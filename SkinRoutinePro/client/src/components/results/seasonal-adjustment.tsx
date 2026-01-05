import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SEASONS, getCurrentSeason } from "@/lib/skincare-data";

interface SeasonalAdjustmentProps {
  onSeasonChange: (season: string) => void;
}

export default function SeasonalAdjustment({ onSeasonChange }: SeasonalAdjustmentProps) {
  const [selectedSeason, setSelectedSeason] = useState(getCurrentSeason());

  const handleSeasonSelect = (season: string) => {
    setSelectedSeason(season);
    onSeasonChange(season);
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-semibold text-primary mb-2">Seasonal Adjustments</h3>
          <p className="text-secondary">Your routine adapts to seasonal changes for optimal results</p>
        </div>
        
        <div className="seasonal-cards">
          {SEASONS.map((season) => (
            <div
              key={season.value}
              className={`seasonal-card ${selectedSeason === season.value ? 'active' : ''}`}
              onClick={() => handleSeasonSelect(season.value)}
              data-testid={`season-${season.value}`}
            >
              <i 
                className={season.icon} 
                style={{ fontSize: '2rem', color: season.color, marginBottom: '1rem' }}
              ></i>
              <h4 className="font-semibold text-lg mb-2">{season.label}</h4>
              <p className="text-sm text-secondary">{season.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
