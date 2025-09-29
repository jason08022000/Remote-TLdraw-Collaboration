import { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Heading,
  Container,
  Center,
  HStack
} from '@chakra-ui/react';
import { useUser } from '../contexts/UserContext';

export function NameInput() {
  const { setUserDetails } = useUser();
  const [inputName, setInputName] = useState('');
  const [inputRoom, setInputRoom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!inputName.trim() || !inputRoom.trim()) return;
    
    setIsSubmitting(true);
    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    setUserDetails(inputName.trim(), inputRoom.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputName.trim() && inputRoom.trim()) {
      handleSubmit();
    }
  };

  return (
    <Center h="100vh" bg="gray.100">
      <Container maxW="lg">
        <VStack gap={12}>
          <VStack gap={6} textAlign="center">
            <Heading 
              size="2xl" 
              color="gray.800"
              fontWeight="400"
              letterSpacing="-0.025em"
            >
              Collaborative Whiteboard
            </Heading>
              <Text fontSize="xl" color="gray.600" fontWeight="300" maxW="md">
                Enter your name and room ID to start collaborating with others in real-time
              </Text>
          </VStack>

          <Box w="100%" maxW="md" p={10} bg="white" borderRadius="2xl" border="1px" borderColor="gray.200">
            <VStack gap={8}>
              <VStack gap={6} w="100%">
                <VStack gap={4} w="100%">
                  <Text fontSize="sm" fontWeight="500" color="gray.700" textAlign="left" w="100%">
                    Your Name
                  </Text>
                  
                  <Input
                    placeholder="Enter your name"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="lg"
                    bg="gray.50"
                    border="1px"
                    borderColor="gray.300"
                    borderRadius="lg"
                    _hover={{
                      borderColor: "gray.400"
                    }}
                    _focus={{
                      borderColor: "blue.500",
                      bg: "white",
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)"
                    }}
                    fontSize="md"
                    autoFocus
                  />
                </VStack>

                <VStack gap={4} w="100%">
                  <Text fontSize="sm" fontWeight="500" color="gray.700" textAlign="left" w="100%">
                    Room ID
                  </Text>
                  
                  <Input
                    placeholder="Enter room ID (e.g., meeting-room-2024)"
                    value={inputRoom}
                    onChange={(e) => setInputRoom(e.target.value)}
                    onKeyPress={handleKeyPress}
                    size="lg"
                    bg="gray.50"
                    border="1px"
                    borderColor="gray.300"
                    borderRadius="lg"
                    _hover={{
                      borderColor: "gray.400"
                    }}
                    _focus={{
                      borderColor: "blue.500",
                      bg: "white",
                      boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)"
                    }}
                    fontSize="md"
                  />
                </VStack>
              </VStack>
              
              <Button
                onClick={handleSubmit}
                disabled={!inputName.trim() || !inputRoom.trim()}
                loading={isSubmitting}
                loadingText="Starting..."
                bg="gray.900"
                color="white"
                size="lg"
                w="100%"
                borderRadius="lg"
                fontWeight="500"
                _hover={{
                  bg: "gray.800"
                }}
                _active={{
                  bg: "gray.900"
                }}
                _disabled={{
                  bg: "gray.300",
                  color: "gray.500"
                }}
              >
                Start Collaborating
              </Button>
            </VStack>
          </Box>

            <HStack gap={8} color="gray.500" fontSize="sm" fontWeight="400">
              <Text>Shared whiteboard</Text>
              <Box w="1px" h="4" bg="gray.300" />
              <Text>Video calls</Text>
              <Box w="1px" h="4" bg="gray.300" />
              <Text>One room ID</Text>
            </HStack>
        </VStack>
      </Container>
    </Center>
  );
}
