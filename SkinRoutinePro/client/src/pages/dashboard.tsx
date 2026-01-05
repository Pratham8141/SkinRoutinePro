import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Routine, Assessment } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  if (!isAuthenticated) {
    setLocation('/auth');
    return null;
  }

  const { data: routines, isLoading: routinesLoading } = useQuery<Routine[]>({
    queryKey: ['/api/routines/user', user?.id],
    enabled: !!user?.id,
  });

  const { data: assessments, isLoading: assessmentsLoading } = useQuery<Assessment[]>({
    queryKey: ['/api/assessments/user', user?.id],
    enabled: !!user?.id,
  });

  const deleteRoutineMutation = useMutation({
    mutationFn: async (routineId: string) => {
      const response = await apiRequest("DELETE", `/api/routines/${routineId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Routine deleted",
        description: "Your routine has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/routines/user', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete routine",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleRoutineActiveMutation = useMutation({
    mutationFn: async ({ routineId, isActive }: { routineId: string; isActive: boolean }) => {
      const response = await apiRequest("PATCH", `/api/routines/${routineId}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/routines/user', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update routine",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteRoutine = (routineId: string) => {
    if (confirm("Are you sure you want to delete this routine?")) {
      deleteRoutineMutation.mutate(routineId);
    }
  };

  const handleToggleActive = (routineId: string, currentActive: boolean) => {
    toggleRoutineActiveMutation.mutate({
      routineId,
      isActive: !currentActive
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeRoutines = routines?.filter(r => r.isActive) || [];
  const inactiveRoutines = routines?.filter(r => !r.isActive) || [];

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            My Skincare Dashboard
          </h1>
          <p className="text-lg text-secondary">
            Manage your routines and track your skincare journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/questionnaire" className="block">
                  <Button className="w-full skincare-primary" data-testid="button-new-assessment">
                    <i className="fas fa-plus mr-2"></i>
                    New Assessment
                  </Button>
                </Link>
                
                <Link href="/results" className="block">
                  <Button variant="outline" className="w-full" data-testid="button-retake-assessment">
                    <i className="fas fa-redo mr-2"></i>
                    Retake Assessment
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* User Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-secondary">Total Routines:</span>
                    <span className="font-semibold">{routines?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Active Routines:</span>
                    <span className="font-semibold">{activeRoutines.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Assessments Taken:</span>
                    <span className="font-semibold">{assessments?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Allergy Profile */}
            {user?.allergies && user.allergies.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg text-yellow-700 dark:text-yellow-300">
                    <i className="fas fa-exclamation-triangle mr-2"></i>
                    Allergy Profile
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-secondary mb-2">Avoiding:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Active Routines */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Active Routines</CardTitle>
                <CardDescription>
                  Your currently active skincare routines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {routinesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                ) : activeRoutines.length > 0 ? (
                  <div className="space-y-4">
                    {activeRoutines.map((routine) => (
                      <div 
                        key={routine.id} 
                        className="border rounded-lg p-4 hover:bg-surface/50 transition-colors"
                        data-testid={`routine-active-${routine.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-lg">{routine.name}</h4>
                          <div className="flex gap-2">
                            <Badge className="bg-green-100 text-green-700">
                              {routine.season}
                            </Badge>
                            <Badge variant="outline">
                              {routine.preferenceType}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-secondary mb-3">
                          {routine.morningSteps.length} morning steps, {routine.eveningSteps.length} evening steps
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(routine.id, routine.isActive!)}
                            data-testid={`button-deactivate-${routine.id}`}
                          >
                            <i className="fas fa-pause mr-1"></i>
                            Deactivate
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-${routine.id}`}
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-spa text-4xl text-muted-foreground mb-4"></i>
                    <p className="text-secondary">No active routines yet.</p>
                    <Link href="/questionnaire" className="mt-4 inline-block">
                      <Button className="skincare-primary">
                        Create Your First Routine
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Saved Routines */}
            {inactiveRoutines.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Saved Routines</CardTitle>
                  <CardDescription>
                    Previously saved routines (inactive)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {inactiveRoutines.map((routine) => (
                      <div 
                        key={routine.id} 
                        className="border rounded-lg p-4 hover:bg-surface/50 transition-colors opacity-75"
                        data-testid={`routine-inactive-${routine.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{routine.name}</h4>
                          <Badge variant="secondary">Inactive</Badge>
                        </div>
                        
                        <p className="text-sm text-secondary mb-3">
                          {routine.morningSteps.length} morning steps, {routine.eveningSteps.length} evening steps
                        </p>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(routine.id, routine.isActive!)}
                            data-testid={`button-activate-${routine.id}`}
                          >
                            <i className="fas fa-play mr-1"></i>
                            Activate
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-inactive-${routine.id}`}
                          >
                            <i className="fas fa-trash mr-1"></i>
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
