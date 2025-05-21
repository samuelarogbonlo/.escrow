import { Box, Flex, useColorModeValue } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar'
import Header from '../Header'
import Notifications from '../Notifications'

const Layout = () => {
  const bgColor = useColorModeValue('white', 'gray.900');
  
  return (
    <Flex minHeight="100vh" width="100%" bg={bgColor}>
      <Sidebar />
      <Box flex="1" overflow="auto" bg={bgColor}>
        <Header />
        <Box as="main" p={4} maxW="1400px" mx="auto">
          <Outlet />
        </Box>
      </Box>
      <Notifications />
    </Flex>
  )
}

export default Layout 