import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { validateAssessment } from "@/lib/skincare-data";
import { apiRequest } from "@/lib/queryClient";
import SkinTypeSelector from "@/components/questionnaire/skin-type-selector";
import ConcernsSelector from "@/components/questionnaire/concerns-selector";
import LifestyleForm from "@/components/questionnaire/lifestyle-form";

interface AssessmentData {
  skinType: string;
  concerns: string[];
  ageRange: string;
  budget: string;
  timeAvailable: string;
  lifestyle: Record<string, any>;
}

export default function Questionnaire() {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [assessment, setAssessment] = useState<AssessmentData>({
    skinType: "",
    concerns: [],
    ageRange: "",
    budget: "",
    timeAvailable: "",
    lifestyle: {}
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: AssessmentData) => {
      if (!user) {
        throw new Error("Please sign in to save your assessment");
      }
      
      const response = await apiRequest("POST", "/api/assessments", {
        ...data,
        userId: user.id
      });
      return response.json();
    },
    onSuccess: (data) => {
      localStorage.setItem('currentAssessment', JSON.stringify(data));
      setLocation('/results');
    },
    onError: (error: any) => {
      toast({
        title: "Assessment failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    const errors = validateAssessment(assessment);
    
    if (errors.length > 0) {
      toast({
        title: "Please complete all fields",
        description: errors.join(", "),
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      // Store assessment temporarily and redirect to auth
      localStorage.setItem('pendingAssessment', JSON.stringify(assessment));
      toast({
        title: "Please sign in",
        description: "Create an account or sign in to save your personalized routine.",
      });
      setLocation('/auth');
      return;
    }

    createAssessmentMutation.mutate(assessment);
  };

  const updateAssessment = (field: string, value: any) => {
    setAssessment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateLifestyle = (field: string, value: string) => {
    setAssessment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return assessment.skinType !== "";
      case 2:
        return assessment.concerns.length > 0;
      case 3:
        return assessment.ageRange !== "" && assessment.budget !== "" && assessment.timeAvailable !== "";
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-surface py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary">
            Skin Assessment
          </h1>
          <p className="text-lg text-secondary">
            Help us understand your skin to create the perfect routine
          </p>
          
          <div className="mt-6">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {step} of {totalSteps}
            </p>
          </div>
        </div>

        <Card className="mb-8">
          <CardContent className="p-8">
            {step === 1 && (
              <SkinTypeSelector
                value={assessment.skinType}
                onChange={(value) => updateAssessment('skinType', value)}
              />
            )}
            
            {step === 2 && (
              <ConcernsSelector
                value={assessment.concerns}
                onChange={(value) => updateAssessment('concerns', value)}
              />
            )}
            
            {step === 3 && (
              <LifestyleForm
                values={{
                  ageRange: assessment.ageRange,
                  budget: assessment.budget,
                  timeAvailable: assessment.timeAvailable
                }}
                onChange={updateLifestyle}
              />
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            data-testid="button-back"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canProceed() || createAssessmentMutation.isPending}
            className="skincare-primary"
            data-testid={step === totalSteps ? "button-generate-routine" : "button-next"}
          >
            {createAssessmentMutation.isPending ? (
              <i className="fas fa-spinner fa-spin mr-2"></i>
            ) : step === totalSteps ? (
              <i className="fas fa-magic mr-2"></i>
            ) : (
              <i className="fas fa-arrow-right mr-2"></i>
            )}
            {step === totalSteps ? "Generate My Routine" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
