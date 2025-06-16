"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  VStack,
  Text,
} from "@chakra-ui/react";
import RoomWebRTC from "./RoomWebRTC";

export default function RoomPage() {
  const { roomId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    // Get user media (video+audio)
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
        };
        recorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          setVideoUrl(URL.createObjectURL(blob));
        };
      });
  }, []);

  const startRecording = () => {
    setRecordedChunks([]);
    mediaRecorder?.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6}>
        <Heading>Podcast Room: {roomId}</Heading>
        <RoomWebRTC roomId={roomId as string} />
        <Box>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            width={480}
            height={320}
            style={{ borderRadius: 8, background: "#222" }}
          />
        </Box>
        <Box>
          {!isRecording ? (
            <Button colorScheme="red" onClick={startRecording}>
              Start Recording
            </Button>
          ) : (
            <Button colorScheme="red" onClick={stopRecording}>
              Stop Recording
            </Button>
          )}
        </Box>
        {videoUrl && (
          <Box>
            <Text fontWeight="bold">Your Recording:</Text>
            <video
              src={videoUrl}
              controls
              width={480}
              height={320}
              style={{ borderRadius: 8 }}
            />
          </Box>
        )}
      </VStack>
    </Container>
  );
}
