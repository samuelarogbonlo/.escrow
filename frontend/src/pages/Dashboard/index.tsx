import { useState, useEffect } from 'react'
import { Box, Heading, Text, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, StatArrow, Flex, Button, Icon, useColorModeValue, Skeleton, Alert, AlertIcon, Grid, Badge } from '@chakra-ui/react'
import { FiPlus, FiDollarSign, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useWallet } from '../../hooks/useWalletContext'
import { EscrowData } from '../../hooks/useEscrowContract'

const StatCard = ({ label, value, helpText, icon, colorScheme = "blue", isLoading = false }: { 
  label: string;
  value: string | number;
  helpText?: string;
  icon: React.ElementType;
  colorScheme?: string;
  isLoading?: boolean;
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  return (
    <Box 
      p={5} 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center">
        <Stat>
          <StatLabel fontSize="sm" color="gray.500">{label}</StatLabel>
          {isLoading ? (
            <Skeleton height="30px" width="80px" my="2" />
          ) : (
            <StatNumber fontSize="2xl">{value}</StatNumber>
          )}
          {helpText && !isLoading && (
            <StatHelpText>
              <StatArrow type="increase" />
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        <Flex
          w="12"
          h="12"
          align="center"
          justify="center"
          rounded="full"
          bg={`${colorScheme}.100`}
        >
          <Icon as={icon} boxSize="6" color={`${colorScheme}.700`} />
        </Flex>
      </Flex>
    </Box>
  );
};

const EscrowCard = ({ escrow }: { escrow: EscrowData }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const navigate = useNavigate();
  
  // Calculate milestone progress
  const completedMilestones = escrow.milestones.filter(m => m.status === 'Completed').length;
  const totalMilestones = escrow.milestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  
  // Get next milestone
  const nextMilestone = escrow.milestones.find(m => m.status === 'InProgress' || m.status === 'Pending');
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Completed': return 'blue';
      case 'Disputed': return 'red';
      case 'Cancelled': return 'gray';
      default: return 'gray';
    }
  };
  
  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      borderColor={borderColor}
      bg={bgColor}
      boxShadow="sm"
      onClick={() => navigate(`/escrow/${escrow.id}`)}
      cursor="pointer"
      _hover={{ boxShadow: 'md', borderColor: 'blue.300' }}
      transition="all 0.2s"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Heading size="sm" fontWeight="semibold" noOfLines={1}>{nextMilestone?.description || 'Escrow Agreement'}</Heading>
        <Badge colorScheme={getStatusColor(escrow.status)}>{escrow.status}</Badge>
      </Flex>
      
      <Text fontSize="sm" color="gray.500" mb={3}>Created on {formatDate(escrow.createdAt)}</Text>
      
      <Grid templateColumns="1fr 1fr" gap={3} mb={3}>
        <Box>
          <Text fontSize="xs" color="gray.500">Amount</Text>
          <Text fontWeight="bold">{escrow.totalAmount} USDT</Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="gray.500">Progress</Text>
          <Text fontWeight="bold">{progress}% ({completedMilestones}/{totalMilestones})</Text>
        </Box>
      </Grid>
      
      {nextMilestone && (
        <Box mt={2} p={2} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
          <Text fontSize="xs" color="gray.500">Next milestone due</Text>
          <Text fontSize="sm" fontWeight="medium">
            {formatDate(nextMilestone.deadline)}
          </Text>
        </Box>
      )}
    </Box>
  );
};

const Dashboard = () => {
  const { isExtensionReady, selectedAccount, listEscrows } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const navigate = useNavigate();
  
  // Redirect to connect wallet page if not connected
  useEffect(() => {
    if (!isExtensionReady || !selectedAccount) {
      navigate('/connect');
    }
  }, [isExtensionReady, selectedAccount, navigate]);
  
  // Fetch escrows
  useEffect(() => {
    const fetchEscrows = async () => {
      if (!isExtensionReady || !selectedAccount) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await listEscrows();
        if (result.success) {
          setEscrows(result.escrows);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to load escrows. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEscrows();
  }, [isExtensionReady, selectedAccount, listEscrows]);
  
  // Calculate stats
  const stats = {
    activeEscrows: escrows.filter(e => e.status === 'Active').length,
    totalValue: escrows.reduce((sum, escrow) => sum + Number(escrow.totalAmount), 0).toLocaleString() + ' USDT',
    completedEscrows: escrows.filter(e => e.status === 'Completed').length,
    pendingMilestones: escrows.reduce((sum, escrow) => {
      return sum + escrow.milestones.filter(m => m.status === 'Pending' || m.status === 'InProgress').length;
    }, 0)
  };
  
  return (
    <Box>
      <Flex justify="space-between" align="center" mb={8}>
        <Heading size="lg">Dashboard</Heading>
        <Button 
          as={Link} 
          to="/escrow/create" 
          colorScheme="blue" 
          leftIcon={<Icon as={FiPlus} />}
        >
          Create Escrow
        </Button>
      </Flex>
      
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Active Escrows"
          value={stats.activeEscrows}
          icon={FiClock}
          colorScheme="blue"
          isLoading={isLoading}
        />
        <StatCard
          label="Total Value Locked"
          value={stats.totalValue}
          icon={FiDollarSign}
          colorScheme="green"
          isLoading={isLoading}
        />
        <StatCard
          label="Completed Escrows"
          value={stats.completedEscrows}
          icon={FiCheckCircle}
          colorScheme="purple"
          isLoading={isLoading}
        />
        <StatCard
          label="Pending Milestones"
          value={stats.pendingMilestones}
          icon={FiAlertCircle}
          colorScheme="orange"
          isLoading={isLoading}
        />
      </SimpleGrid>

      <Box mb={8}>
        <Heading size="md" mb={4}>Your Escrows</Heading>
        
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {[1, 2, 3].map(i => (
              <Skeleton key={i} height="200px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : escrows.length > 0 ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {escrows.map(escrow => (
              <EscrowCard key={escrow.id} escrow={escrow} />
            ))}
          </SimpleGrid>
        ) : (
          <>
            <Text color="gray.500">
              You don't have any escrow agreements yet.
            </Text>
            <Button 
              mt={4} 
              as={Link} 
              to="/escrow/create" 
              size="sm" 
              variant="outline"
            >
              Create your first escrow
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}

export default Dashboard 