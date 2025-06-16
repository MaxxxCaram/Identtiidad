"use client";

import { useRouter } from "next/navigation";
import { Button, Container, Heading, VStack } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";

export default function CreateRoomPage() {
  const router = useRouter();

  const handleCreateRoom = () => {
    const roomId = uuidv4();
    router.push(`/room/${roomId}`);
  };

  return (
    <Container maxW="md" py={16} centerContent>
      <VStack spacing={8}>
        <Heading>Start a New Podcast Room</Heading>
        <Button colorScheme="blue" size="lg" onClick={handleCreateRoom}>
          Create Room
        </Button>
      </VStack>
    </Container>
  );
}
