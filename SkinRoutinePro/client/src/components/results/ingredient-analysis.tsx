import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { Ingredient } from "@shared/schema";

export default function IngredientAnalysis() {
  const { user } = useAuth();
  
  const { data: ingredients, isLoading } = useQuery<Ingredient[]>({
    queryKey: ['/api/ingredients'],
    enabled: true,
  });

  const getSafetyBadge = (safetyLevel: string) => {
    const className = `ingredient-safety ${safetyLevel}`;
    const text = safetyLevel === 'safe' ? 'Safe' : 
                 safetyLevel === 'caution' ? 'Caution' : 'Avoid';
    
    return (
      <Badge className={className} data-testid={`safety-${safetyLevel}`}>
        {text}
      </Badge>
    );
  };

  const isAllergenic = (ingredient: Ingredient) => {
    if (!user?.allergies) return false;
    return user.allergies.some(allergy => 
      ingredient.name.toLowerCase().includes(allergy.toLowerCase()) ||
      ingredient.commonAllergens?.some(allergen => 
        allergen.toLowerCase().includes(allergy.toLowerCase())
      )
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-microscope"></i>
            Ingredient Safety Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center py-3 border-b">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const commonIngredients = ingredients?.slice(0, 6) || [];

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <i className="fas fa-microscope"></i>
          Ingredient Safety Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {commonIngredients.map((ingredient) => {
            const isUserAllergic = isAllergenic(ingredient);
            const displaySafety = isUserAllergic ? 'warning' : ingredient.safetyLevel;
            
            return (
              <div 
                key={ingredient.id} 
                className="flex justify-between items-center py-3 border-b last:border-b-0"
                data-testid={`ingredient-${ingredient.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex-1">
                  <span className="font-medium">{ingredient.name}</span>
                  {ingredient.description && (
                    <p className="text-sm text-secondary mt-1">{ingredient.description}</p>
                  )}
                  {isUserAllergic && (
                    <p className="text-sm text-red-600 mt-1">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      Potential allergen based on your profile
                    </p>
                  )}
                </div>
                <div>
                  {getSafetyBadge(displaySafety)}
                </div>
              </div>
            );
          })}
        </div>
        
        {user?.allergies && user.allergies.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              Your Allergy Profile
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Avoiding: {user.allergies.join(', ')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
