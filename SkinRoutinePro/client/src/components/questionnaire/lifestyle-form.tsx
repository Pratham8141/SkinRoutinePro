import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AGE_RANGES, BUDGET_OPTIONS, TIME_PREFERENCES } from "@/lib/skincare-data";

interface LifestyleFormProps {
  values: {
    ageRange: string;
    budget: string;
    timeAvailable: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function LifestyleForm({ values, onChange }: LifestyleFormProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-primary">Lifestyle & Preferences</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Age Range</Label>
          <Select value={values.ageRange} onValueChange={(value) => onChange('ageRange', value)}>
            <SelectTrigger data-testid="select-age-range">
              <SelectValue placeholder="Select your age range" />
            </SelectTrigger>
            <SelectContent>
              {AGE_RANGES.map((age) => (
                <SelectItem key={age.value} value={age.value}>
                  {age.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Budget Preference</Label>
          <Select value={values.budget} onValueChange={(value) => onChange('budget', value)}>
            <SelectTrigger data-testid="select-budget">
              <SelectValue placeholder="Select your budget preference" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_OPTIONS.map((budget) => (
                <SelectItem key={budget.value} value={budget.value}>
                  {budget.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Time Available for Routine</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TIME_PREFERENCES.map((time) => (
              <div
                key={time.value}
                className={`option-card ${values.timeAvailable === time.value ? 'selected' : ''}`}
                onClick={() => onChange('timeAvailable', time.value)}
                data-testid={`option-time-${time.value}`}
              >
                <div className="option-icon">
                  <i className={time.icon}></i>
                </div>
                <h4 className="text-lg font-semibold mb-2">{time.label}</h4>
                <p className="text-sm text-secondary">{time.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
