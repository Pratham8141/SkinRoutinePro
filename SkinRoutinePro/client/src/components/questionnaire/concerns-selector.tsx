import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SKIN_CONCERNS } from "@/lib/skincare-data";

interface ConcernsSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function ConcernsSelector({ value, onChange }: ConcernsSelectorProps) {
  const handleConcernChange = (concern: string, checked: boolean) => {
    if (checked) {
      onChange([...value, concern]);
    } else {
      onChange(value.filter(c => c !== concern));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">
        What are your main skin concerns? (Select all that apply)
      </h3>
      <div className="checkbox-grid">
        {SKIN_CONCERNS.map((concern) => (
          <Label
            key={concern.value}
            className="checkbox-item"
            data-testid={`checkbox-concern-${concern.value}`}
          >
            <Checkbox
              checked={value.includes(concern.value)}
              onCheckedChange={(checked) => 
                handleConcernChange(concern.value, checked as boolean)
              }
            />
            <span>{concern.label}</span>
          </Label>
        ))}
      </div>
    </div>
  );
}
