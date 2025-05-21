import { Box, Flex, Input, InputGroup, InputLeftElement, Button, Text, HStack, useColorMode, IconButton, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from '@chakra-ui/react'
import { SearchIcon, MoonIcon, SunIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { FiLogOut, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../../hooks/useWalletContext'

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const { selectedAccount, isExtensionReady, disconnectApi } = useWallet()
  const navigate = useNavigate()
  
  const truncateAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDisconnect = async () => {
    await disconnectApi();
    navigate('/connect');
  };

  return (
    <Box as="header" py={4} px={6} borderBottomWidth="1px" bg={colorMode === 'dark' ? 'gray.800' : 'white'}>
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold" display={{ base: 'block', md: 'none' }}>.escrow</Text>
        
        <InputGroup maxW="400px" display={{ base: 'none', md: 'block' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input placeholder="Search escrows..." borderRadius="full" />
        </InputGroup>
        
        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
            onClick={toggleColorMode}
            variant="ghost"
          />
          
          {isExtensionReady && selectedAccount ? (
            <Menu>
              <MenuButton as={Button} size="sm" rightIcon={<ChevronDownIcon />}>
                {selectedAccount.meta.name || truncateAddress(selectedAccount.address)}
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiUser />}>
                  {truncateAddress(selectedAccount.address)}
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FiLogOut />} onClick={handleDisconnect}>
                  Disconnect
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button size="sm" colorScheme="blue" onClick={() => navigate('/connect')}>
              Connect Wallet
            </Button>
          )}
        </HStack>
      </Flex>
    </Box>
  )
}

export default Header 