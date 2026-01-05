import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { getCurrentSeason } from "@/lib/skincare-data";
import { apiRequest } from "@/lib/queryClient";
import { Assessment, RoutineStep } from "@shared/schema";
import RoutineDisplay from "@/components/results/routine-display";
import SeasonalAdjustment from "@/components/results/seasonal-adjustment";
import IngredientAnalysis from "@/components/results/ingredient-analysis";
import ProductComparison from "@/components/results/product-comparison";

export default function Results() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [preferenceType, setPreferenceType] = useState<'home-remedies' | 'products'>('home-remedies');
  const [currentSeason, setCurrentSeason] = useState(getCurrentSeason());
  const [routineData, setRoutineData] = useState<{
    morningSteps: RoutineStep[];
    eveningSteps: RoutineStep[];
  } | null>(null);

  // Load assessment from localStorage or redirect to questionnaire
  useEffect(() => {
    const savedAssessment = localStorage.getItem('currentAssessment');
    if (savedAssessment) {
      const parsedAssessment = JSON.parse(savedAssessment);
      setAssessment(parsedAssessment);
      generateRoutine(parsedAssessment);
    } else {
      setLocation('/questionnaire');
    }
  }, [setLocation]);

  const generateRoutineMutation = useMutation({
    mutationFn: async (data: { assessment: Assessment; preferenceType: string; season: string }) => {
      const response = await apiRequest("POST", "/api/routines/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      setRoutineData({
        morningSteps: data.morningSteps,
        eveningSteps: data.eveningSteps
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate routine",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const saveRoutineMutation = useMutation({
    mutationFn: async () => {
      if (!user || !assessment || !routineData) {
        throw new Error("Missing required data");
      }
      
      const response = await apiRequest("POST", "/api/routines", {
        userId: user.id,
        assessmentId: assessment.id,
        name: `${assessment.skinType} routine - ${new Date().toLocaleDateString()}`,
        season: currentSeason,
        preferenceType,
        morningSteps: routineData.morningSteps,
        eveningSteps: routineData.eveningSteps
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Routine saved!",
        description: "Your personalized routine has been saved to your dashboard.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save routine",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateRoutine = (assessmentData: Assessment) => {
    generateRoutineMutation.mutate({
      assessment: assessmentData,
      preferenceType,
      season: currentSeason
    });
  };

  const handlePreferenceChange = (newPreference: 'home-remedies' | 'products') => {
    setPreferenceType(newPreference);
    if (assessment) {
      generateRoutine(assessment);
    }
  };

  const handleSeasonChange = (season: string) => {
    setCurrentSeason(season);
    if (assessment) {
      generateRoutine(assessment);
    }
  };

  const handleSaveRoutine = () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "Create an account to save your routine.",
      });
      setLocation('/auth');
      return;
    }
    
    saveRoutineMutation.mutate();
  };

  const handlePrintRoutine = () => {
    window.print();
  };

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p>Loading your assessment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Your Personalized Skincare Routine
          </h1>
          <p className="text-lg text-secondary mb-6">
            Based on your {assessment.skinType} skin type and concerns about{' '}
            {assessment.concerns.slice(0, 2).join(' and ')}
            {assessment.concerns.length > 2 && ` and ${assessment.concerns.length - 2} more`}
          </p>
          
          {/* Preference Toggle */}
          <div className="flex justify-center mb-6">
            <div className="toggle-switch">
              <button
                className={`toggle-option ${preferenceType === 'home-remedies' ? 'active' : ''}`}
                onClick={() => handlePreferenceChange('home-remedies')}
                data-testid="toggle-home-remedies"
              >
                <i className="fas fa-leaf mr-2"></i>
                Home Remedies
              </button>
              <button
                className={`toggle-option ${preferenceType === 'products' ? 'active' : ''}`}
                onClick={() => handlePreferenceChange('products')}
                data-testid="toggle-products"
              >
                <i className="fas fa-shopping-bag mr-2"></i>
                Products
              </button>
            </div>
          </div>
        </div>

        {/* Seasonal Adjustment */}
        <SeasonalAdjustment onSeasonChange={handleSeasonChange} />

        {/* Routine Display */}
        {generateRoutineMutation.isPending ? (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
              <p className="text-lg">Generating your personalized routine...</p>
            </CardContent>
          </Card>
        ) : routineData ? (
          <RoutineDisplay
            morningSteps={routineData.morningSteps}
            eveningSteps={routineData.eveningSteps}
            preferenceType={preferenceType}
          />
        ) : null}

        {/* Ingredient Analysis */}
        <IngredientAnalysis />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button
            onClick={handleSaveRoutine}
            disabled={saveRoutineMutation.isPending || !routineData}
            className="skincare-primary"
            data-testid="button-save-routine"
          >
            {saveRoutineMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : (
              <i className="fas fa-save mr-2"></i>
            )}
            Save This Routine
          </Button>
          
          <Button
            variant="outline"
            onClick={handlePrintRoutine}
            disabled={!routineData}
            data-testid="button-print-routine"
          >
            <i className="fas fa-print mr-2"></i>
            Print Routine
          </Button>
        </div>

        {/* Product Comparison */}
        <ProductComparison
          skinType={assessment.skinType}
          concerns={assessment.concerns}
          preferenceType={preferenceType}
        />
      </div>
    </div>
  );
}
