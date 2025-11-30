"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause } from "lucide-react";

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onRemove: () => void;
  existingAudio?: string;
}

export function VoiceRecorder({
  onRecordingComplete,
  onRemove,
  existingAudio,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(existingAudio || null);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Microphone access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Edge.");
        return;
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete(audioBlob);
        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        alert("An error occurred while recording. Please try again.");
        setIsRecording(false);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      
      // Provide specific error messages based on error type
      let errorMessage = "Could not access microphone. ";
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage += "Please allow microphone access in your browser settings and try again.";
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage += "No microphone found. Please connect a microphone and try again.";
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage += "Microphone is being used by another application. Please close other applications using the microphone and try again.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage += "Microphone doesn't support the required settings. Please try again.";
      } else {
        errorMessage += "Please check your browser permissions and try again.";
      }
      
      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const togglePlayback = () => {
    if (audioURL) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioURL);
        audioRef.current.onended = () => setIsPlaying(false);
      }

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-3">
      {!audioURL && !isRecording && (
        <Button
          type="button"
          variant="outline"
          onClick={startRecording}
          className="w-full border-2 border-dashed border-gray-300 hover:border-[#F4D35E] bg-gray-50"
        >
          <Mic className="h-5 w-5 mr-2 text-gray-600" />
          Record Voice Note
        </Button>
      )}

      {isRecording && (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border-2 border-red-200">
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={stopRecording}
            className="h-10 w-10 rounded-full"
          >
            <Square className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700">Recording...</span>
            </div>
            <p className="text-xs text-red-600 mt-1">{formatTime(recordingTime)}</p>
          </div>
        </div>
      )}

      {audioURL && !isRecording && (
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={togglePlayback}
            className="h-10 w-10 rounded-full bg-[#F4D35E] hover:bg-[#F4D35E]/90"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 text-gray-900" />
            ) : (
              <Play className="h-5 w-5 text-gray-900 ml-0.5" />
            )}
          </Button>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700">Voice note recorded</p>
            <p className="text-xs text-gray-500">Click play to listen</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setAudioURL(null);
              onRemove();
            }}
            className="text-red-600 hover:text-red-700"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

