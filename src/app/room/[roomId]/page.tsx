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
import axios from "axios";

export default function RoomPage() {
  const { roomId } = useParams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  useEffect(() => {
    if (videoUrl && recordedChunks.length > 0) {
      // Subir automáticamente el archivo grabado
      const upload = async () => {
        setUploading(true);
        setUploadSuccess(false);
        setUploadError(null);
        try {
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const formData = new FormData();
          formData.append("file", blob, `recording-${roomId}.webm`);
          await axios.post("/api/upload", blob, {
            headers: {
              "Content-Type": "video/webm",
              "x-filename": `recording-${roomId}.webm`,
            },
          });
          setUploadSuccess(true);
        } catch (err: any) {
          setUploadError(err.message || "Upload failed");
        } finally {
          setUploading(false);
        }
      };
      upload();
    }
    // eslint-disable-next-line
  }, [videoUrl]);

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
        {uploading && <Text color="blue.500">Uploading recording...</Text>}
        {uploadSuccess && <Text color="green.500">Upload successful!</Text>}
        {uploadError && (
          <Text color="red.500">Upload failed: {uploadError}</Text>
        )}
      </VStack>
    </Container>
  );
}
