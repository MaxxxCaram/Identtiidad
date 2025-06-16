"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  VStack,
  Text,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import WaveSurfer from "wavesurfer.js";
import { FaPlay, FaPause, FaDownload } from "react-icons/fa";

export default function AudioEditor() {
  const [waveform, setWaveform] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const waveformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (waveformRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#4A5568",
        progressColor: "#2B6CB0",
        cursorColor: "#2B6CB0",
        barWidth: 2,
        barRadius: 3,
        responsive: true,
        height: 100,
      });

      wavesurfer.on("ready", () => {
        setDuration(wavesurfer.getDuration());
      });

      wavesurfer.on("audioprocess", () => {
        setCurrentTime(wavesurfer.getCurrentTime());
      });

      wavesurfer.on("play", () => setIsPlaying(true));
      wavesurfer.on("pause", () => setIsPlaying(false));

      setWaveform(wavesurfer);

      return () => {
        wavesurfer.destroy();
      };
    }
  }, []);

  const togglePlayback = () => {
    if (waveform) {
      waveform.playPause();
    }
  };

  const handleTimeChange = (value: number) => {
    if (waveform) {
      waveform.seekTo(value / duration);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && waveform) {
      waveform.loadBlob(file);
    }
  };

  return (
    <VStack spacing={4}>
      <Text fontSize="xl" fontWeight="bold">
        Editor de Audio
      </Text>

      <Box w="100%" p={4} borderWidth={1} borderRadius="md">
        <div ref={waveformRef} />
      </Box>

      <Box w="100%">
        <Slider
          value={currentTime}
          max={duration}
          onChange={handleTimeChange}
          aria-label="audio-progress"
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </Box>

      <Box>
        <Button
          leftIcon={isPlaying ? <FaPause /> : <FaPlay />}
          onClick={togglePlayback}
          mr={4}
        >
          {isPlaying ? "Pausar" : "Reproducir"}
        </Button>

        <Button as="label" leftIcon={<FaDownload />} cursor="pointer">
          Subir Audio
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </Button>
      </Box>
    </VStack>
  );
}
