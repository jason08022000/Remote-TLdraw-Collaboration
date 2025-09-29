import { useState, useEffect, useCallback } from 'react'
import {
	Box,
	Button,
	Input,
	Text,
	Stack,
	Heading
} from '@chakra-ui/react'
import {
	Call,
	CallControls,
	SpeakerLayout,
	StreamCall,
	StreamTheme,
} from '@stream-io/video-react-sdk'
import { useVideo } from './VideoProvider'
import { useUser } from '../../contexts/UserContext'

// Import Stream Video CSS for beautiful UI
import '@stream-io/video-react-sdk/dist/css/styles.css'

// Browser compatibility check
const isWebRTCSupported = (): boolean => {
	return !!(
		typeof navigator !== 'undefined' &&
		navigator.mediaDevices &&
		typeof navigator.mediaDevices.getUserMedia === 'function' &&
		typeof RTCPeerConnection !== 'undefined'
	)
}

export function VideoCall() {
	const { client, isConnected, connectUser } = useVideo()
	const { userName } = useUser()
	const [callId, setCallId] = useState('')
	const [activeCall, setActiveCall] = useState<Call | null>(null)
	const [isJoining, setIsJoining] = useState(false)
	const [webRTCSupported, setWebRTCSupported] = useState(true)

	useEffect(() => {
		setWebRTCSupported(isWebRTCSupported())
	}, [])

	const handleConnect = useCallback(async () => {
		try {
			setIsJoining(true)
			await connectUser(userName)
		} catch (error) {
			console.error('Failed to connect:', error)
		} finally {
			setIsJoining(false)
		}
	}, [userName, connectUser])

	// Auto-connect to Stream when component mounts
	useEffect(() => {
		if (!isConnected && userName && !isJoining) {
			handleConnect()
		}
	}, [userName, isConnected, isJoining, handleConnect])

	// Auto-clear activeCall when call ends (not just when user clicks leave)
	useEffect(() => {
		if (!activeCall) return

		const handleCallEnd = () => {
			console.log('Call ended, clearing activeCall')
			setActiveCall(null)
		}

		// Listen for call ending events
		activeCall.on('call.ended', handleCallEnd)

		return () => {
			activeCall.off('call.ended', handleCallEnd)
		}
	}, [activeCall])

	const handleJoinCall = async () => {
		if (!client || !callId.trim()) return

		// Check WebRTC support before attempting to join
		if (!webRTCSupported) {
			alert('Your browser doesn\'t support video calling. Please use Chrome, Firefox, or Safari.')
			return
		}

		try {
			setIsJoining(true)
			const call = client.call('default', callId.trim())

			// Join the call first - let Stream SDK handle WebRTC setup
			await call.join({ create: true })

			// Set as active call
			setActiveCall(call)
			console.log(`Successfully joined call: ${callId.trim()}`)

			// Enable camera and microphone after successful join
			try {
				await call.camera.enable()
				await call.microphone.enable()
				console.log('Camera and microphone enabled successfully')
			} catch (mediaError) {
				console.warn('Media permissions issue, call will work but without camera/mic:', mediaError)
				// Call still works, user can enable manually via call controls
			}

		} catch (error: any) {
			console.error('Failed to join call:', error)

			// Provide specific error messages based on error type
			let errorMessage = 'Failed to join call. '

			if (error.message?.includes('addTransceiver')) {
				errorMessage += 'Browser compatibility issue. Please try refreshing the page or use a different browser.'
			} else if (error.message?.includes('token')) {
				errorMessage += 'Authentication failed. Please try reconnecting.'
			} else if (error.message?.includes('network') || error.message?.includes('connection')) {
				errorMessage += 'Network connection issue. Please check your internet connection.'
			} else {
				errorMessage += 'Please try again.'
			}

			alert(errorMessage)
		} finally {
			setIsJoining(false)
		}
	}

	const handleLeaveCall = async () => {
		if (activeCall) {
			try {
				await activeCall.leave()
				console.log('Left call successfully')
			} catch (error) {
				console.error('Failed to leave call:', error)
			} finally {
				// Always clear the activeCall state regardless of leave success/failure
				setActiveCall(null)
			}
		}
	}

	// Show video call UI if in a call
	if (activeCall) {
		return (
			<StreamCall call={activeCall}>
				<StreamTheme style={{ height: '100%', width: '100%' }}>
					<VideoCallUI onLeave={handleLeaveCall} />
				</StreamTheme>
			</StreamCall>
		)
	}

	// Show setup form if not connected or not in a call
	return (
		<Box p={6} h="100%" display="flex" flexDirection="column" justifyContent="center">
			<Stack direction="column" gap={6} maxW="300px" mx="auto">
				<Heading size="md" color="gray.700" textAlign="center">
					Video Call
				</Heading>

				{!webRTCSupported && (
					<Box
						bg="orange.50"
						borderColor="orange.200"
						border="1px solid"
						borderRadius="md"
						p={3}
					>
						<Text fontSize="sm" color="orange.800">
							⚠️ Your browser doesn't fully support video calling. Please use Chrome, Firefox, or Safari for the best experience.
						</Text>
					</Box>
				)}

				{!isConnected ? (
					<Stack direction="column" gap={4} w="100%">
						<Box w="100%" p={4} bg="blue.50" borderRadius="md" borderColor="blue.200" border="1px solid">
							<Text fontSize="sm" color="blue.600" mb={1} fontWeight="medium">
								Welcome, {userName}!
							</Text>
							<Text fontSize="xs" color="blue.500">
								{isJoining ? 'Connecting to video service...' : 'Setting up video calling'}
							</Text>
						</Box>
						{isJoining && (
							<Box textAlign="center" py={2}>
								<Text fontSize="sm" color="gray.500">
									Connecting...
								</Text>
							</Box>
						)}
					</Stack>
				) : (
					<Stack direction="column" gap={4} w="100%">
						<Text fontSize="sm" color="green.600" fontWeight="medium">
							Connected as {userName}
						</Text>
						<Box w="100%">
							<Text fontSize="sm" color="gray.600" mb={2}>
								Call ID
							</Text>
							<Input
								placeholder="Enter call ID"
								value={callId}
								onChange={(e) => setCallId(e.target.value)}
								size="md"
								borderRadius="md"
							/>
						</Box>
						<Button
							onClick={handleJoinCall}
							colorScheme="blue"
							w="100%"
							loading={isJoining}
							disabled={!callId.trim() || isJoining}
						>
							{isJoining ? 'Joining...' : 'Join Call'}
						</Button>
						<Text fontSize="xs" color="gray.500" textAlign="center">
							Share the same Call ID with others to join the same call
						</Text>
					</Stack>
				)}
			</Stack>
		</Box>
	)
}

function VideoCallUI({ onLeave }: { onLeave: () => void }) {
	// Center the video call interface properly
	return (
		<Box 
			h="100%" 
			w="100%" 
			p={4}
			display="flex" 
			flexDirection="column" 
			position="relative"
		>
			{/* Beautiful title */}
			<Box 
				position="absolute" 
				top={4} 
				left="50%" 
				transform="translateX(-50%)"
				zIndex={10}
			>
				<Heading 
					size="md" 
					textAlign="center"
					px={4}
					py={2}
					borderRadius="lg"
					backdropFilter="blur(10px)"
					fontWeight="semibold"
					letterSpacing="wider"
					fontFamily="sans-serif"
				>
					Live Video Call
				</Heading>
			</Box>
			
			<Box 
				flex={1} 
				w="100%" 
				display="flex" 
				justifyContent="center" 
				alignItems="center"
				position="relative"
			>
				<SpeakerLayout participantsBarPosition="bottom" />
			</Box>
			
			<Box 
				position="absolute" 
				bottom={4} 
				left="50%" 
				transform="translateX(-50%)"
				zIndex={10}
			>
				<CallControls onLeave={onLeave} />
			</Box>
		</Box>
	)
}
