"use client";

import { useEffect, useRef, useState } from "react";
import { Box, SimpleGrid, Text } from "@chakra-ui/react";

const SIGNALING_URL =
  typeof window !== "undefined"
    ? `ws://${window.location.host}/api/signaling`
    : "";

export default function RoomWebRTC({ roomId }: { roomId: string }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [peers, setPeers] = useState<{ [id: string]: MediaStream }>({});
  const peerConnections = useRef<{ [id: string]: RTCPeerConnection }>({});
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [clientId] = useState(() => Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    // Get local media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        // Connect to signaling server
        const ws = new WebSocket(SIGNALING_URL);
        wsRef.current = ws;
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: "join", roomId, clientId }));
        };
        ws.onmessage = async (event) => {
          const msg = JSON.parse(event.data);
          if (msg.clientId === clientId) return; // Ignore own messages
          if (msg.roomId !== roomId) return;
          switch (msg.type) {
            case "join":
              // New peer joined, create offer
              await createPeer(msg.clientId, true);
              break;
            case "offer":
              await createPeer(msg.clientId, false, msg.offer);
              break;
            case "answer":
              await peerConnections.current[msg.clientId]?.setRemoteDescription(
                new RTCSessionDescription(msg.answer)
              );
              break;
            case "ice":
              await peerConnections.current[msg.clientId]?.addIceCandidate(
                new RTCIceCandidate(msg.candidate)
              );
              break;
          }
        };
      });
    return () => {
      wsRef.current?.close();
      Object.values(peerConnections.current).forEach((pc) => pc.close());
    };
    // eslint-disable-next-line
  }, []);

  async function createPeer(
    remoteId: string,
    isInitiator: boolean,
    remoteOffer?: RTCSessionDescriptionInit
  ) {
    if (peerConnections.current[remoteId]) return;
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    localStreamRef.current
      ?.getTracks()
      .forEach((track) => pc.addTrack(track, localStreamRef.current!));
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        wsRef.current?.send(
          JSON.stringify({
            type: "ice",
            roomId,
            clientId,
            candidate: e.candidate,
          })
        );
      }
    };
    pc.ontrack = (e) => {
      setPeers((prev) => ({ ...prev, [remoteId]: e.streams[0] }));
    };
    peerConnections.current[remoteId] = pc;
    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      wsRef.current?.send(
        JSON.stringify({ type: "offer", roomId, clientId, offer })
      );
    } else if (remoteOffer) {
      await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      wsRef.current?.send(
        JSON.stringify({ type: "answer", roomId, clientId, answer })
      );
    }
  }

  return (
    <Box>
      <Text fontWeight="bold" mb={2}>
        Room Videochat
      </Text>
      <SimpleGrid columns={[1, 2, 3]} spacing={4}>
        <Box>
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            width={320}
            height={200}
            style={{ borderRadius: 8, background: "#222" }}
          />
          <Text fontSize="sm" textAlign="center">
            You
          </Text>
        </Box>
        {Object.entries(peers).map(([id, stream]) => (
          <Box key={id}>
            <video
              autoPlay
              playsInline
              width={320}
              height={200}
              style={{ borderRadius: 8, background: "#222" }}
              ref={(el) => {
                if (el) el.srcObject = stream;
              }}
            />
            <Text fontSize="sm" textAlign="center">
              Guest
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
}
