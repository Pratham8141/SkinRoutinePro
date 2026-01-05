import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoutineStep } from "@shared/schema";

interface RoutineDisplayProps {
  morningSteps: RoutineStep[];
  eveningSteps: RoutineStep[];
  preferenceType: 'home-remedies' | 'products' | 'mixed';
}

export default function RoutineDisplay({ morningSteps, eveningSteps, preferenceType }: RoutineDisplayProps) {
  const renderRoutineSteps = (steps: RoutineStep[], timeOfDay: 'morning' | 'evening') => (
    <Card className="routine-column">
      <CardHeader className="bg-primary text-white text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <i className={timeOfDay === 'morning' ? 'fas fa-sun' : 'fas fa-moon'}></i>
          {timeOfDay === 'morning' ? 'Morning Routine' : 'Evening Routine'}
        </CardTitle>
        <p className="text-sm opacity-90">
          {timeOfDay === 'morning' ? 'Start your day with glowing skin' : 'Repair and rejuvenate overnight'}
        </p>
      </CardHeader>
      
      <CardContent className="p-0">
        {steps.map((step) => (
          <div key={step.stepNumber} className="routine-step">
            <div className="step-number">{step.stepNumber}</div>
            <div className="step-title text-lg font-semibold mb-2">{step.title}</div>
            <div className="step-description text-secondary mb-4">{step.description}</div>
            
            {step.products.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {step.products.map((product, index) => (
                  <Badge
                    key={index}
                    className={`product-tag ${product.type === 'home-remedy' ? 'home-remedy' : 'commercial'}`}
                    data-testid={`product-${product.type}-${index}`}
                  >
                    {product.name}
                  </Badge>
                ))}
              </div>
            )}
            
            {step.frequency && (
              <p className="text-sm text-muted-foreground mt-2">
                <i className="fas fa-calendar-alt mr-1"></i>
                {step.frequency}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
          <i className="fas fa-leaf text-primary"></i>
          <span className="text-primary font-medium">
            {preferenceType === 'home-remedies' ? 'Home Remedies Focus' : 
             preferenceType === 'products' ? 'Commercial Products Focus' : 
             'Balanced Approach'}
          </span>
        </div>
      </div>
      
      <div className="routine-grid">
        {renderRoutineSteps(morningSteps, 'morning')}
        {renderRoutineSteps(eveningSteps, 'evening')}
      </div>
    </div>
  );
}
