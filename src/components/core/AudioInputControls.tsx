
"use client";

import type { FC, ChangeEvent } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Square, Pause, Play, AlertCircle, Loader2, ListMusic, UploadCloud, Link as LinkIcon } from 'lucide-react';
// Removed Select, SelectContent, SelectItem, SelectTrigger, SelectValue as they are no longer used for device selection
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UseAudioRecorder } from '@/hooks/useAudioRecorder';
// Removed getAudioInputDevices as it's no longer used here
import { useToast } from '@/hooks/use-toast';

interface AudioInputControlsProps {
  recorder: UseAudioRecorder;
  onAudioChunk: (dataUri: string) => Promise<void>;
  isAnalyzing: boolean;
}

const blobToDataURL = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert Blob to Data URL.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const AudioInputControls: FC<AudioInputControlsProps> = ({ recorder, onAudioChunk, isAnalyzing }) => {
  const {
    isRecording,
    isPaused,
    recordingTime,
    error: recorderError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = recorder;

  // Removed audioDevices and selectedDeviceId states and related useEffect
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [audioUrlInput, setAudioUrlInput] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);


  const handleStartRecording = () => {
    // Call startRecording without deviceId to use the default microphone
    startRecording();
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a valid audio file.",
        });
        return;
      }
      setIsUploading(true);
      try {
        const dataUri = await blobToDataURL(file);
        await onAudioChunk(dataUri);
        toast({
          title: "File Uploaded",
          description: `${file.name} has been processed for analysis.`,
        });
      } catch (error) {
        console.error("Error processing uploaded file:", error);
        toast({
          variant: "destructive",
          title: "File Processing Failed",
          description: error instanceof Error ? error.message : "Could not process the uploaded file.",
        });
      } finally {
        setIsUploading(false);
        if (event.target) {
            event.target.value = "";
        }
      }
    }
  };

  const handleProcessUrl = async () => {
    if (!audioUrlInput.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid audio URL.",
      });
      return;
    }
    setIsFetchingUrl(true);
    try {
      const response = await fetch(audioUrlInput);
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}. Check for CORS issues or incorrect URL.`);
      }
      const blob = await response.blob();
      if (!blob.type.startsWith('audio/')) {
        throw new Error(`The fetched content is not a recognized audio type. Found: ${blob.type}`);
      }
      const dataUri = await blobToDataURL(blob);
      await onAudioChunk(dataUri);
      toast({
        title: "URL Processed",
        description: "Audio from URL has been processed for analysis.",
      });
    } catch (error) {
      console.error("Error processing URL:", error);
      toast({
        variant: "destructive",
        title: "URL Processing Failed",
        description: error instanceof Error ? error.message : "Could not process the audio from the URL.",
      });
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const isLoading = isAnalyzing || isUploading || isFetchingUrl;

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListMusic className="text-primary" />
          Audio Input
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="live"><Mic className="mr-2"/>Live Mic</TabsTrigger>
            <TabsTrigger value="upload"><UploadCloud className="mr-2"/>Upload</TabsTrigger>
            <TabsTrigger value="url"><LinkIcon className="mr-2"/>From URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="live" className="space-y-6">
            {/* Microphone selection dropdown removed */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <Button 
                    onClick={handleStartRecording} 
                    size="lg" 
                    className="w-full sm:w-auto" 
                    disabled={isLoading} 
                  >
                    <Mic className="mr-2" /> Start Recording
                  </Button>
                ) : (
                  <Button onClick={stopRecording} variant="destructive" size="lg" className="w-full sm:w-auto" disabled={isLoading && !isRecording}>
                    <Square className="mr-2" /> Stop Recording
                  </Button>
                )}
                {isRecording && (
                  isPaused ? (
                    <Button onClick={resumeRecording} variant="outline" size="lg" className="w-full sm:w-auto">
                      <Play className="mr-2" /> Resume
                    </Button>
                  ) : (
                    <Button onClick={pauseRecording} variant="outline" size="lg" className="w-full sm:w-auto">
                      <Pause className="mr-2" /> Pause
                    </Button>
                  )
                )}
              </div>
              <div className="text-lg font-mono tabular-nums text-foreground min-w-[80px] text-center">
                {formatTime(recordingTime)}
              </div>
            </div>
            
            {isAnalyzing && isRecording && (
              <div className="flex items-center text-sm text-accent animate-pulse">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing pitch...
              </div>
            )}

            {recorderError && (
              <div className="flex items-center text-sm text-destructive p-2 bg-destructive/10 rounded-md">
                <AlertCircle className="mr-2 h-4 w-4" />
                Error: {recorderError}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Audio File</Label>
              <Input 
                id="file-upload" 
                type="file" 
                accept="audio/*" 
                onChange={handleFileChange} 
                disabled={isLoading}
                className="file:text-primary file:font-semibold hover:file:bg-primary/10"
              />
              <p className="text-xs text-muted-foreground">
                Select an audio file (e.g., .mp3, .wav, .webm) to analyze its pitches.
              </p>
            </div>
            {isUploading && (
              <div className="flex items-center text-sm text-accent animate-pulse">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading and processing file...
              </div>
            )}
             {isAnalyzing && !isRecording && !isUploading && !isFetchingUrl && ( 
              <div className="flex items-center text-sm text-accent">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing uploaded file...
              </div>
            )}
          </TabsContent>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input">Audio URL</Label>
              <div className="flex gap-2">
                <Input 
                  id="url-input" 
                  type="url" 
                  placeholder="https://example.com/audio.mp3"
                  value={audioUrlInput}
                  onChange={(e) => setAudioUrlInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button onClick={handleProcessUrl} disabled={isLoading || !audioUrlInput.trim()}>
                  {isFetchingUrl ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-4 w-4" />}
                  Process URL
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Enter a direct URL to an audio file (e.g., .mp3, .wav). CORS restrictions may apply.
              </p>
            </div>
            {isFetchingUrl && (
              <div className="flex items-center text-sm text-accent animate-pulse">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching and processing URL...
              </div>
            )}
            {isAnalyzing && !isRecording && !isUploading && !isFetchingUrl && ( // Shown when analyzing after URL fetch
              <div className="flex items-center text-sm text-accent">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing audio from URL...
              </div>
            )}
          </TabsContent>
        </Tabs>
        {/* Display general recorder errors if not specific to live recording start */}
        {recorderError && !isRecording && (
            <div className="mt-4 flex items-center text-sm text-destructive p-2 bg-destructive/10 rounded-md">
              <AlertCircle className="mr-2 h-4 w-4" />
              Audio System Error: {recorderError}
            </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AudioInputControls;
