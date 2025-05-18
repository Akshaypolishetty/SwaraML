
"use client";

import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AudioInputControls from '@/components/core/AudioInputControls';
import PitchDisplay from '@/components/core/PitchDisplay';
import AnalysisSettings from '@/components/core/AnalysisSettings';
import RecordedSessions from '@/components/core/RecordedSessions';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { analyzeLivePitch, type LivePitchAnalysisInput, type LivePitchAnalysisOutput } from '@/ai/flows/live-pitch-analysis';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export type MusicStyle = "Hindustani" | "Carnatic" | "Undetermined" | undefined;

export interface RecordedSession {
  id: string;
  name: string;
  audioUrl: string;
  audioBlob: Blob;
  swaras: string[];
  shrutis: string[];
  raaga?: string;
  musicStyle?: MusicStyle;
  date: Date;
}

const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to Data URL.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function SwaraMLPage() {
  const { toast } = useToast();
  
  const [currentIdentifiedSwaras, setCurrentIdentifiedSwaras] = useState<string[]>([]);
  const [currentIdentifiedShrutis, setCurrentIdentifiedShrutis] = useState<string[]>([]);
  const [currentMusicStyle, setCurrentMusicStyle] = useState<MusicStyle>(undefined);
  const [currentIdentifiedRaaga, setCurrentIdentifiedRaaga] = useState<string | undefined>(undefined);
  const [currentFocusedSwara, setCurrentFocusedSwara] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [sensitivity, setSensitivity] = useState(50); 
  const [selectedRaagContext, setSelectedRaagContext] = useState("none"); 
  
  const [recordedSessions, setRecordedSessions] = useState<RecordedSession[]>([]);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [hasMediaDeviceSupport, setHasMediaDeviceSupport] = useState(true); 

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setHasMediaDeviceSupport(true);
    } else if (typeof window !== 'undefined') {
      setHasMediaDeviceSupport(false);
    }
  }, []);

  const handleAudioChunkForAnalysis = useCallback(async (audioChunkDataUri: string) => {
    setIsAnalyzing(true);
    try {
      const analysisInput: LivePitchAnalysisInput = { audioDataUri: audioChunkDataUri };
      if (selectedRaagContext && selectedRaagContext !== "none") {
        analysisInput.targetRaaga = selectedRaagContext;
      }

      const result: LivePitchAnalysisOutput = await analyzeLivePitch(analysisInput);
      setCurrentIdentifiedSwaras(result.identifiedSwaras || []);
      setCurrentIdentifiedShrutis(result.identifiedShrutis || []);
      setCurrentMusicStyle(result.musicStyle);
      setCurrentIdentifiedRaaga(result.identifiedRaaga);

      if (result.identifiedSwaras && result.identifiedSwaras.length > 0) {
        setCurrentFocusedSwara(result.identifiedSwaras[0]); 
      } else {
        setCurrentFocusedSwara(undefined);
      }
    } catch (error) {
      console.error("Error analyzing audio:", error);
      toast({
        variant: "destructive",
        title: "Audio Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred during audio analysis.",
      });
      setCurrentIdentifiedSwaras([]);
      setCurrentIdentifiedShrutis([]);
      setCurrentMusicStyle(undefined);
      setCurrentIdentifiedRaaga(undefined);
      setCurrentFocusedSwara(undefined);
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast, selectedRaagContext]);

  const audioRecorder = useAudioRecorder(async (chunk) => {
    try {
        const dataUri = await blobToDataURL(chunk);
        handleAudioChunkForAnalysis(dataUri);
    } catch (error) {
        console.error("Error processing audio chunk for analysis:", error);
         toast({
            variant: "destructive",
            title: "Audio Chunk Error",
            description: "Could not process the latest audio chunk for analysis.",
        });
    }
  }, 2000); 

  useEffect(() => {
    if (!audioRecorder.isRecording && audioRecorder.audioBlob) {
      const newSession: RecordedSession = {
        id: new Date().toISOString(),
        name: `Recording ${new Date().toLocaleTimeString()}`,
        audioUrl: URL.createObjectURL(audioRecorder.audioBlob),
        audioBlob: audioRecorder.audioBlob,
        swaras: [...currentIdentifiedSwaras], 
        shrutis: [...currentIdentifiedShrutis],
        raaga: currentIdentifiedRaaga,
        musicStyle: currentMusicStyle,
        date: new Date(),
      };
      setRecordedSessions(prev => [newSession, ...prev]);
      toast({
        title: "Recording Saved",
        description: `${newSession.name} has been saved.`,
        action: <CheckCircle2 className="text-green-500" />,
      });
      
      setCurrentIdentifiedSwaras([]);
      setCurrentIdentifiedShrutis([]);
      setCurrentMusicStyle(undefined);
      setCurrentIdentifiedRaaga(undefined);
      setCurrentFocusedSwara(undefined);
      audioRecorder.setAudioBlob(null); 
    }
  }, [
      audioRecorder.isRecording, 
      audioRecorder.audioBlob, 
      currentIdentifiedSwaras, 
      currentIdentifiedShrutis,
      currentIdentifiedRaaga,
      currentMusicStyle, 
      toast, 
      audioRecorder
    ]);

  const handlePlaySession = (session: RecordedSession) => {
    if (currentPlayingAudio) {
      currentPlayingAudio.pause();
      currentPlayingAudio.currentTime = 0;
    }
    const audio = new Audio(session.audioUrl);
    setCurrentPlayingAudio(audio);
    audio.play();
    toast({ title: "Playing Session", description: `Playing: ${session.name}` });
  };

  const handleDeleteSession = (sessionId: string) => {
    setRecordedSessions(prev => prev.filter(s => s.id !== sessionId));
    toast({ title: "Session Deleted", description: "The recording has been removed." });
  };

  const handleDownloadSession = (session: RecordedSession) => {
    const a = document.createElement('a');
    a.href = session.audioUrl;
    a.download = `${session.name.replace(/\s+/g, '_')}.webm`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({ title: "Download Started", description: `Downloading: ${session.name}` });
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <AudioInputControls 
              recorder={audioRecorder} 
              onAudioChunk={handleAudioChunkForAnalysis}
              isAnalyzing={isAnalyzing} 
            />
            <PitchDisplay 
              identifiedSwaras={currentIdentifiedSwaras} 
              identifiedShrutis={currentIdentifiedShrutis}
              musicStyle={currentMusicStyle}
              identifiedRaaga={currentIdentifiedRaaga}
              currentSwara={currentFocusedSwara} 
            />
          </div>

          <div className="space-y-8">
            <AnalysisSettings
              sensitivity={sensitivity}
              onSensitivityChange={setSensitivity}
              selectedRaag={selectedRaagContext}
              onRaagChange={setSelectedRaagContext}
            />
          </div>
        </div>
        
        <RecordedSessions
            sessions={recordedSessions}
            onPlaySession={handlePlaySession}
            onDeleteSession={handleDeleteSession}
            onDownloadSession={handleDownloadSession}
        />

        {!hasMediaDeviceSupport && (
             <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Media Access Error</AlertTitle>
                <AlertDescription>
                Your browser does not support media devices, or permission was denied. Please check your browser settings.
                </AlertDescription>
            </Alert>
        )}
      </main>
      <Footer />
    </div>
  );
}

