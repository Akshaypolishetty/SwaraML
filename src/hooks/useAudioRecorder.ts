
"use client";

import { useState, useRef, useCallback, useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  error: string | null;
}

interface AudioRecorderControls {
  startRecording: (deviceId?: string) => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  setAudioBlob: Dispatch<SetStateAction<Blob | null>>;
}

export type UseAudioRecorder = AudioRecorderState & AudioRecorderControls & {
  audioChunksRef: React.MutableRefObject<Blob[]>;
};


export function useAudioRecorder(onAudioChunk?: (audioChunk: Blob) => void, recordingIntervalMs: number = 1000): UseAudioRecorder {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const cleanupMediaRecorder = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.onerror = null;
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    mediaRecorderRef.current = null;
  }, []);


  useEffect(() => {
    return () => {
      cleanupMediaRecorder();
      clearTimer();
    };
  }, [cleanupMediaRecorder]);

  const startRecording = useCallback(async (deviceId?: string) => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Media Devices API not supported by your browser. Please use a modern browser.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = deviceId 
        ? { audio: { deviceId: { exact: deviceId } } }
        : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const options = { mimeType: 'audio/webm' }; 
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          if (onAudioChunk) {
            onAudioChunk(event.data);
          }
        }
      };

      mediaRecorder.onstop = () => {
        const completeBlob = new Blob(audioChunksRef.current, { type: options.mimeType });
        setAudioBlob(completeBlob);
        setAudioUrl(URL.createObjectURL(completeBlob));
        setIsRecording(false);
        setIsPaused(false);
        clearTimer();
        cleanupMediaRecorder();
      };
      
      mediaRecorder.onerror = (event) => {
        setError(`MediaRecorder error: ${(event as any).error?.name || 'Unknown error during recording.'}`);
        setIsRecording(false);
        setIsPaused(false);
        clearTimer();
        cleanupMediaRecorder();
      };
      
      mediaRecorder.start(recordingIntervalMs); 
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);

    } catch (err) {
      let detailedErrorMessage = "Error starting recording: ";
      if (err instanceof Error) {
        switch (err.name) {
          case 'NotAllowedError': // Standard name for permission denied
            detailedErrorMessage += "Microphone permission denied. Please allow microphone access in your browser settings for this site.";
            break;
          case 'NotFoundError': // Standard name if no device is found
            detailedErrorMessage += "No microphone found. Please ensure a microphone is connected and enabled in your system settings.";
            break;
          case 'NotReadableError': // Hardware error or OS-level issue
            detailedErrorMessage += "Cannot access microphone. It might be in use by another application or a hardware issue. Please check your microphone and try again.";
            break;
          case 'SecurityError': // Usually for non-secure contexts (http instead of https)
             detailedErrorMessage += "Microphone access is restricted. This feature requires a secure connection (HTTPS).";
            break;
          case 'TypeError': // e.g. if constraints are malformed - less likely with current setup
            detailedErrorMessage += "Internal error setting up microphone. Invalid configuration.";
            break;
          default:
            detailedErrorMessage += err.message || "An unknown error occurred.";
        }
      } else {
        detailedErrorMessage += String(err);
      }
      setError(detailedErrorMessage);
      cleanupMediaRecorder();
    }
  }, [onAudioChunk, recordingIntervalMs, cleanupMediaRecorder]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop(); 
    }
    clearTimer();
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearTimer();
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    }
  }, []);
  
  const resetRecording = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setError(null);
    audioChunksRef.current = [];
    cleanupMediaRecorder();
    clearTimer();
  }, [cleanupMediaRecorder]);


  return {
    isRecording,
    isPaused,
    recordingTime,
    audioBlob,
    audioUrl,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    setAudioBlob,
    audioChunksRef,
  };
}

export async function getAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.warn("enumerateDevices() not supported.");
    return [];
  }
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'audioinput');
  } catch (err) {
    console.error("Error enumerating audio devices:", err);
    return [];
  }
}
