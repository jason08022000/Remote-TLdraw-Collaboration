import { Box, HStack, Text } from '@chakra-ui/react'

interface ConnectionStatusProps {
  isConnected: boolean
  onReconnect?: () => void
}

export function ConnectionStatus({ isConnected, onReconnect }: ConnectionStatusProps) {
  return (
    <Box
      position="fixed"
      top={4}
      left={4}
      zIndex={1000}
      bg="white"
      px={3}
      py={2}
      borderRadius="md"
      shadow="sm"
      border="1px solid"
      borderColor="gray.200"
    >
      <HStack gap={2}>
        <Box
          w={2}
          h={2}
          borderRadius="full"
          bg={isConnected ? 'green.500' : 'red.500'}
        />
        <Text fontSize="xs" color="gray.600">
          {isConnected ? 'Connected' : 'Disconnected'}
        </Text>
        {!isConnected && onReconnect && (
          <Text
            fontSize="xs"
            color="blue.500"
            cursor="pointer"
            _hover={{ textDecoration: 'underline' }}
            onClick={onReconnect}
          >
            Retry
          </Text>
        )}
      </HStack>
    </Box>
  )
}
