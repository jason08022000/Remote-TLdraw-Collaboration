import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react'
import { LiveblocksProvider } from './providers/LiveblocksProvider'
import { UserProvider } from './contexts/UserContext'
import { WebSocketMessagesProvider } from './contexts/WebSocketMessagesContext'
import App from './App'
import './index.css'

const system = createSystem(defaultConfig)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<ChakraProvider value={system}>
			<UserProvider>
				<WebSocketMessagesProvider>
					<LiveblocksProvider>
						<App />
					</LiveblocksProvider>
				</WebSocketMessagesProvider>
			</UserProvider>
		</ChakraProvider>
	</React.StrictMode>
)
