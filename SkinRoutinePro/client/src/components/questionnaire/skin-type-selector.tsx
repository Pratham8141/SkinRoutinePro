import { SKIN_TYPES } from "@/lib/skincare-data";

interface SkinTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SkinTypeSelector({ value, onChange }: SkinTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-primary">What's your primary skin type?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SKIN_TYPES.map((type) => (
          <div
            key={type.value}
            className={`option-card ${value === type.value ? 'selected' : ''}`}
            onClick={() => onChange(type.value)}
            data-testid={`option-skin-type-${type.value}`}
          >
            <div className="option-icon">
              <i className={type.icon}></i>
            </div>
            <h4 className="text-lg font-semibold mb-2">{type.label}</h4>
            <p className="text-sm text-secondary">{type.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
