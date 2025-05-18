
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Music3, Target, Zap, Lightbulb, HelpCircle, Tags, MinusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { MusicStyle } from '@/app/page';

interface PitchDisplayProps {
  identifiedSwaras: string[];
  identifiedShrutis: string[];
  musicStyle?: MusicStyle;
  identifiedRaaga?: string;
  currentSwara?: string; 
}

const PitchDisplay: FC<PitchDisplayProps> = ({ 
  identifiedSwaras, 
  identifiedShrutis, 
  musicStyle,
  identifiedRaaga,
  currentSwara 
}) => {
  // This condition determines if we show the initial "Start recording..." message.
  // It's true if all specific analysis results are empty/undefined AND musicStyle is also undefined (not even "Undetermined").
  // This state typically only occurs on initial load before any audio processing.
  const showInitialMessage = 
    identifiedSwaras.length === 0 && 
    identifiedShrutis.length === 0 && 
    !musicStyle && // Not even "Undetermined"
    !currentSwara && 
    !identifiedRaaga;

  return (
    <Card className="w-full shadow-lg">
      <div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="text-primary" />
            Live Audio Analysis
          </CardTitle>
          <CardDescription>
            Real-time identification of Swaras, Shrutis, Raaga, and music style.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showInitialMessage ? (
            <p className="text-muted-foreground text-center py-4">
              <Music3 className="mx-auto h-10 w-10 mb-2 text-muted-foreground/70" />
              Start recording or input audio to see live analysis.
            </p>
          ) : (
            <>
              <div>
                <h3 className="text-sm font-semibold text-accent mb-1 flex items-center">
                  <Target className="mr-2 h-4 w-4" />
                  Current Focus Swara:
                </h3>
                {currentSwara ? (
                  <Badge variant="default" className="text-lg bg-accent text-accent-foreground px-3 py-1 shadow-md">
                    {currentSwara}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm px-2 py-0.5 text-muted-foreground">None</Badge>
                )}
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground mb-2">Identified Swaras:</h3>
                {identifiedSwaras.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {identifiedSwaras.map((swara, index) => (
                      <Badge 
                        key={`swara-${index}`} 
                        variant={swara === currentSwara ? "default" : "secondary"}
                        className={`transition-all duration-300 ease-in-out transform hover:scale-110 text-base px-2.5 py-1 shadow-sm
                          ${swara === currentSwara ? 'bg-primary text-primary-foreground border-primary' : 'border-input bg-secondary hover:bg-secondary/80'}`}
                      >
                        {swara}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Badge variant="outline" className="text-sm px-2 py-0.5 text-muted-foreground">
                    <MinusCircle className="mr-1.5 h-3 w-3" /> None detected
                  </Badge>
                )}
              </div>

              <div>
                <h3 className="text-base font-medium text-foreground mb-2 mt-4">Identified Shrutis:</h3>
                {identifiedShrutis.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {identifiedShrutis.map((shruti, index) => (
                      <Badge 
                        key={`shruti-${index}`} 
                        variant="outline"
                        className="text-sm px-2 py-0.5 border-dashed border-muted-foreground text-muted-foreground shadow-sm"
                      >
                        {shruti}
                      </Badge>
                    ))}
                  </div>
                ) : (
                   <Badge variant="outline" className="text-sm px-2 py-0.5 text-muted-foreground">
                     <MinusCircle className="mr-1.5 h-3 w-3" /> None detected
                   </Badge>
                )}
                {identifiedShrutis.length > 0 && <p className="text-xs text-muted-foreground mt-1">Shrutis are microtonal variations, may be context-dependent.</p>}
              </div>
              
              <div className="mt-4">
                <h3 className="text-base font-medium text-foreground mb-2 flex items-center">
                  <Tags className="mr-2 h-5 w-5 text-yellow-600" />
                  Identified Raaga:
                </h3>
                {identifiedRaaga ? (
                  <Badge 
                      className="text-md bg-[#E8B92E] text-neutral-900 hover:bg-[#E8B92E]/90 px-3 py-1 shadow-md border border-yellow-700/50"
                  >
                    {identifiedRaaga}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm px-2 py-0.5 text-muted-foreground">
                    <MinusCircle className="mr-1.5 h-3 w-3" /> Not identified
                  </Badge>
                )}
                {!identifiedRaaga && identifiedSwaras.length === 0 && identifiedShrutis.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">A specific Raaga could not be determined from the current audio.</p>
                )}
              </div>
              
              <div className="mt-4">
                <h3 className="text-base font-medium text-foreground mb-2 flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-primary" />
                  Music Style Classification:
                </h3>
                {(musicStyle && musicStyle !== "Undetermined") ? (
                  <Badge 
                      variant="default" 
                      className="text-md bg-primary/80 text-primary-foreground px-3 py-1 shadow-md"
                  >
                    {musicStyle}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-sm px-2 py-0.5 text-muted-foreground">
                     <HelpCircle className="mr-1.5 h-3 w-3" /> 
                    {musicStyle === "Undetermined" ? "Undetermined" : "Not classified"}
                  </Badge>
                )}
                {(musicStyle === "Undetermined" || !musicStyle) && (
                  <p className="text-xs text-muted-foreground mt-1">The musical style could not be confidently classified from the current audio.</p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default PitchDisplay;
