
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings } from 'lucide-react';

interface AnalysisSettingsProps {
  sensitivity: number;
  onSensitivityChange: (value: number) => void;
  selectedRaag: string;
  onRaagChange: (value: string) => void;
}

// Placeholder raags - in a real app, this would come from a data source
const RAAG_OPTIONS = [
  { value: "none", label: "None (General Analysis)" },
  { value: "yaman", label: "Yaman" },
  { value: "bhairavi", label: "Bhairavi" },
  { value: "todi", label: "Todi" },
  { value: "darbari", label: "Darbari Kanada" },
  { value: "bageshri", label: "Bageshri" },
  { value: "kalyani", label: "Kalyani (Carnatic)"},
  { value: "mayamalavagowla", label: "Mayamalavagowla (Carnatic)"},
  { value: "mohanam", label: "Mohanam (Carnatic)"},
];

const AnalysisSettings: FC<AnalysisSettingsProps> = ({
  sensitivity,
  onSensitivityChange,
  selectedRaag,
  onRaagChange,
}) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="text-primary" />
          Analysis Parameters
        </CardTitle>
        <CardDescription>
          Customize pitch detection and provide context to the AI for more accurate analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="sensitivity-slider" className="text-base">
            Pitch Detection Sensitivity: <span className="font-bold text-primary">{sensitivity}%</span>
          </Label>
          <Slider
            id="sensitivity-slider"
            min={0}
            max={100}
            step={1}
            value={[sensitivity]}
            onValueChange={(value) => onSensitivityChange(value[0])}
            aria-label="Pitch detection sensitivity"
          />
          <p className="text-xs text-muted-foreground">
            Higher values may detect softer or more nuanced pitches but could lead to more noise. (Currently conceptual, not affecting AI)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="raag-select" className="text-base">Target Raag Context</Label>
          <Select value={selectedRaag} onValueChange={onRaagChange}>
            <SelectTrigger id="raag-select">
              <SelectValue placeholder="Select a Raag" />
            </SelectTrigger>
            <SelectContent>
              {RAAG_OPTIONS.map((raag) => (
                <SelectItem key={raag.value} value={raag.value}>
                  {raag.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Selecting a Raag provides context to the AI for analysis. It helps in identifying if the performance aligns with the chosen Raag.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisSettings;

