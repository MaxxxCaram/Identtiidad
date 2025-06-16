"use client";

import { Box, Container, Heading, VStack, Button } from "@chakra-ui/react";
import AudioRecorder from "@/components/AudioRecorder";
import AudioEditor from "@/components/AudioEditor";
import Link from "next/link";

export default function Home() {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading textAlign="center" color="brand.600">
          Podcast Creator
        </Heading>

        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <AudioRecorder />
        </Box>

        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <AudioEditor />
        </Box>

        <Box bg="white" p={6} borderRadius="lg" boxShadow="md">
          <Link href="/create-room">
            <Button colorScheme="blue" size="lg" w="100%">
              Create Podcast Room
            </Button>
          </Link>
        </Box>
      </VStack>
    </Container>
  );
}
