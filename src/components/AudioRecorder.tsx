"use client";

import { useState, useRef } from "react";
import { Box, Button, VStack, Text, useToast } from "@chakra-ui/react";
import { FaMicrophone, FaStop, FaPlay, FaPause } from "react-icons/fa";
import RecordRTC from "recordrtc";

export default function AudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const recorderRef = useRef<RecordRTC | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toast = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new RecordRTC(stream, {
        type: "audio",
        mimeType: "audio/webm",
      });

      recorderRef.current = recorder;
      recorder.startRecording();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        status: "error",
        duration: 3000,
      });
    }
  };

  const stopRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current?.getBlob();
        if (blob) {
          setAudioBlob(blob);
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
        setIsRecording(false);
      });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl || "");
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <VStack spacing={4}>
      <Text fontSize="xl" fontWeight="bold">
        Grabar Audio
      </Text>

      <Box>
        {!isRecording ? (
          <Button
            leftIcon={<FaMicrophone />}
            colorScheme="red"
            onClick={startRecording}
            isDisabled={!!audioUrl}
          >
            Iniciar Grabación
          </Button>
        ) : (
          <Button
            leftIcon={<FaStop />}
            colorScheme="red"
            onClick={stopRecording}
          >
            Detener Grabación
          </Button>
        )}

        {audioUrl && (
          <Button
            ml={4}
            leftIcon={isPlaying ? <FaPause /> : <FaPlay />}
            onClick={togglePlayback}
          >
            {isPlaying ? "Pausar" : "Reproducir"}
          </Button>
        )}
      </Box>
    </VStack>
  );
}
