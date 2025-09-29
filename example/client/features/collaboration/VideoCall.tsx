import { useState, useEffect, useCallback } from 'react'
import {
	Box,
	Button,
	Input,
	Text,
	Stack,
	HStack,
	Heading
} from '@chakra-ui/react'
import { LuMic, LuMicOff, LuVideo, LuVideoOff } from 'react-icons/lu'
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
	const { userName, roomId } = useUser()
	const [activeCall, setActiveCall] = useState<Call | null>(null)
	const [isJoining, setIsJoining] = useState(false)
	const [webRTCSupported, setWebRTCSupported] = useState(true)
	const [isMicEnabled, setIsMicEnabled] = useState(true)
	const [isCameraEnabled, setIsCameraEnabled] = useState(true)

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

	const toggleMicrophone = useCallback(async () => {
		if (activeCall) {
			try {
				if (isMicEnabled) {
					await activeCall.microphone.disable()
				} else {
					await activeCall.microphone.enable()
				}
				setIsMicEnabled(!isMicEnabled)
			} catch (error) {
				console.warn('Failed to toggle microphone:', error)
			}
		} else {
			setIsMicEnabled(!isMicEnabled)
		}
	}, [activeCall, isMicEnabled])

	const toggleCamera = useCallback(async () => {
		if (activeCall) {
			try {
				if (isCameraEnabled) {
					await activeCall.camera.disable()
				} else {
					await activeCall.camera.enable()
				}
				setIsCameraEnabled(!isCameraEnabled)
			} catch (error) {
				console.warn('Failed to toggle camera:', error)
			}
		} else {
			setIsCameraEnabled(!isCameraEnabled)
		}
	}, [activeCall, isCameraEnabled])

	const handleJoinCall = async () => {
		if (!client || !roomId.trim()) return

		// Check WebRTC support before attempting to join
		if (!webRTCSupported) {
			alert('Your browser doesn\'t support video calling. Please use Chrome, Firefox, or Safari.')
			return
		}

		try {
			setIsJoining(true)
			const call = client.call('default', roomId.trim())

			// Join the call first - let Stream SDK handle WebRTC setup
			await call.join({ create: true })

			// Set as active call
			setActiveCall(call)
			console.log(`Successfully joined call: ${roomId.trim()}`)

			// Apply initial mic/camera settings based on user preferences
			try {
				if (isMicEnabled) {
					await call.microphone.enable()
				} else {
					await call.microphone.disable()
				}
				
				if (isCameraEnabled) {
					await call.camera.enable()
				} else {
					await call.camera.disable()
				}
				console.log('Applied initial media settings')
			} catch (mediaError) {
				console.warn('Media permissions issue, call will work but controls may not function:', mediaError)
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

				<Stack direction="column" gap={6} w="100%">
					{/* Media Controls */}
					<HStack gap={4} justify="center">
						<Button
							onClick={toggleMicrophone}
							variant="outline"
							size="md"
							w="60px"
							h="60px"
							borderRadius="full"
							bg={isMicEnabled ? "blue.500" : "gray.100"}
							color={isMicEnabled ? "white" : "gray.600"}
							borderColor={isMicEnabled ? "blue.500" : "gray.300"}
							_hover={{
								transform: "scale(1.05)",
								bg: isMicEnabled ? "blue.600" : "gray.200"
							}}
							title={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
						>
							{isMicEnabled ? <LuMic size={20} /> : <LuMicOff size={20} />}
						</Button>
						
						<Button
							onClick={toggleCamera}
							variant="outline"
							size="md"
							w="60px"
							h="60px"
							borderRadius="full"
							bg={isCameraEnabled ? "blue.500" : "gray.100"}
							color={isCameraEnabled ? "white" : "gray.600"}
							borderColor={isCameraEnabled ? "blue.500" : "gray.300"}
							_hover={{
								transform: "scale(1.05)",
								bg: isCameraEnabled ? "blue.600" : "gray.200"
							}}
							title={isCameraEnabled ? "Turn off camera" : "Turn on camera"}
						>
							{isCameraEnabled ? <LuVideo size={20} /> : <LuVideoOff size={20} />}
						</Button>
					</HStack>

					<Button
						onClick={handleJoinCall}
						colorScheme="blue"
						w="100%"
						loading={isJoining || !isConnected}
						disabled={isJoining || !isConnected}
						size="lg"
						borderRadius="lg"
					>
						{isJoining ? 'Joining...' : !isConnected ? 'Connecting...' : 'Join Video Call'}
					</Button>
				</Stack>
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
