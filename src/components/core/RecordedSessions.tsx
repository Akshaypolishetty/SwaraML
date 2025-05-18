
"use client";

import type { FC } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayCircle, Trash2, Download, History, FileAudio, Music, GitBranch, Lightbulb, Tags, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { RecordedSession } from '@/app/page'; 

interface RecordedSessionsProps {
  sessions: RecordedSession[];
  onPlaySession: (session: RecordedSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onDownloadSession: (session: RecordedSession) => void;
}

const RecordedSessions: FC<RecordedSessionsProps> = ({
  sessions,
  onPlaySession,
  onDeleteSession,
  onDownloadSession,
}) => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="text-primary" />
          Recorded Sessions
        </CardTitle>
        <CardDescription>
          Review your past recordings and their detailed pitch, style, and Raaga analyses.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <FileAudio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No recorded sessions yet.</p>
            <p className="text-sm text-muted-foreground">Record your performance to review it here.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {sessions.map((session) => (
              <li key={session.id} className="p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-card-foreground">{session.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Recorded on: {new Date(session.date).toLocaleString()}
                    </p>
                    
                    <div className="mt-3 space-y-2">
                      {session.swaras && session.swaras.length > 0 && (
                       <div className="flex items-center gap-2">
                         <Music className="h-4 w-4 text-primary" />
                         <span className="text-xs font-medium text-muted-foreground">Swaras:</span>
                         <div className="flex flex-wrap gap-1">
                            {session.swaras.slice(0, 5).map((swara, idx) => (
                                <Badge key={`swara-${session.id}-${idx}`} variant="secondary" className="text-xs">{swara}</Badge>
                            ))}
                            {session.swaras.length > 5 && <Badge variant="outline" className="text-xs">...</Badge>}
                         </div>
                       </div>
                      )}
                      {session.shrutis && session.shrutis.length > 0 && (
                         <div className="flex items-center gap-2">
                           <GitBranch className="h-4 w-4 text-accent" />
                           <span className="text-xs font-medium text-muted-foreground">Shrutis:</span>
                            <div className="flex flex-wrap gap-1">
                                {session.shrutis.slice(0, 3).map((shruti, idx) => (
                                    <Badge key={`shruti-${session.id}-${idx}`} variant="outline" className="text-xs border-dashed">{shruti}</Badge>
                                ))}
                                {session.shrutis.length > 3 && <Badge variant="outline" className="text-xs">...</Badge>}
                            </div>
                         </div>
                      )}
                      {session.raaga && (
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-yellow-600" /> {/* Icon color adjusted */}
                          <span className="text-xs font-medium text-muted-foreground">Raaga:</span>
                          <Badge className="text-xs bg-[#E8B92E] text-neutral-900 hover:bg-[#E8B92E]/90 border border-yellow-700/50">{session.raaga}</Badge>
                        </div>
                      )}
                      {!session.raaga && (session.swaras && session.swaras.length > 0) && ( 
                        <div className="flex items-center gap-2">
                          <Tags className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Raaga:</span>
                          <Badge variant="outline" className="text-xs">Not identified</Badge>
                        </div>
                      )}
                      {session.musicStyle && session.musicStyle !== "Undetermined" && (
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-500" />
                          <span className="text-xs font-medium text-muted-foreground">Style:</span>
                          <Badge variant="default" className="text-xs bg-primary/70 text-primary-foreground">{session.musicStyle}</Badge>
                        </div>
                      )}
                       {session.musicStyle === "Undetermined" && (
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs font-medium text-muted-foreground">Style:</span>
                          <Badge variant="outline" className="text-xs">Undetermined</Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 sm:mt-0 self-start sm:self-center shrink-0">
                    <Button variant="outline" size="sm" onClick={() => onPlaySession(session)} className="w-full sm:w-auto">
                      <PlayCircle className="mr-1.5 h-4 w-4" /> Play
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDownloadSession(session)} className="w-full sm:w-auto">
                      <Download className="mr-1.5 h-4 w-4" /> Download
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDeleteSession(session.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto">
                      <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default RecordedSessions;
