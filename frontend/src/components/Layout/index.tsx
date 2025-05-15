import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar'
import Header from '../Header'
import Notifications from '../Notifications'

const Layout = () => {
  return (
    <Flex minHeight="100vh">
      <Sidebar />
      <Box flex="1" overflow="auto">
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