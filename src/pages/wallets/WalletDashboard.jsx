import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  Spinner,
  Flex,
  SimpleGrid,
  Badge,
} from '@chakra-ui/react';
import { useColorModeValue } from '../../components/ui/color-mode';
import { toaster } from '../../components/ui/toaster';
import axios from 'axios';
import Config from '../../components/axios/Config';
import { FiPlus, FiCreditCard, FiTrendingUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Components
import WalletList from '../../components/wallets/WalletList';
import WalletSummaryChart from '../../components/wallets/WalletSummaryChart';
import { VisibilityToggle } from '../../components/ui/VisibilityToggle';
import { useLocalValueVisibility } from '../../hooks/useValueVisibility';

const WalletDashboard = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const { isHidden, toggleVisibility, formatValue } = useLocalValueVisibility();
  const displayCurrency = (amount, currency) => {
    return formatValue(amount, (value) => formatCurrency(value, currency));
  };

  const displayNumber = (value) => {
    return formatValue(value, (val) => val.toLocaleString('id-ID'));
  };

  useEffect(() => {
    fetchWallets();
    fetchSummary();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + 'wallets', Config({ Authorization: `Bearer ${token}` }));
      setWallets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toaster.create({
        description: "Failed to fetch wallets",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    setSummaryLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + 'wallets/summary', Config({ Authorization: `Bearer ${token}` }));
      setSummary(response.data.data || {});
    } catch (error) {
      console.error('Error fetching summary:', error);
      toaster.create({
        description: "Failed to fetch wallet summary",
        type: "error",
      });
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCreateWallet = () => {
    navigate('/wallets/new');
  };

  const handleEditWallet = (wallet) => {
    navigate(`/wallets/edit/${wallet.id}`);
  };

  const handleDeleteWallet = async (id) => {
    if (!window.confirm('Are you sure you want to delete this wallet?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}wallets/${id}`, Config({ Authorization: `Bearer ${token}` }));
      toaster.create({
        description: "Wallet deleted successfully",
        type: "success",
      });
      fetchWallets();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting wallet:', error);
      toaster.create({
        description: "Failed to delete wallet",
        type: "error",
      });
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        {/* Hero Header */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap={4}
          mb={8}
          pb={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Box>
            <Flex align="center" gap={2} mb={2}>
              {/* <Box w={2} h={2} borderRadius="full" bg="blue.500" /> */}
              <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="widest" color={subtitleColor}>
                Asset Infrastructure
              </Text>
            </Flex>
            <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
              Wallet Infrastructure
            </Heading>
            <Text color={subtitleColor} fontSize="md">
              Manage your accounts, track multi-currency balances, and monitor asset distribution.
            </Text>
          </Box>

          <HStack gap={3}>
            <VisibilityToggle isHidden={isHidden} onToggle={toggleVisibility} />
            <Button
              onClick={handleCreateWallet}
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              size="md"
              borderRadius="xl"
              px={5}
              fontWeight="600"
              boxShadow="xs"
            >
              <FiPlus style={{ marginRight: '6px' }} />
              Add Wallet
            </Button>
          </HStack>
        </Flex>

        {summaryLoading ? (
          <Flex justify="center" py={8}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5} mb={8}>
            {Object.entries(summary).map(([currency, total]) => (
              <Box
                key={currency}
                bg={cardBg}
                borderRadius="2xl"
                border="1px solid"
                borderColor={borderColor}
                p={5}
                shadow="xs"
              >
                <Flex justify="space-between" align="flex-start">
                  <Box flex={1}>
                    <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor} mb={1.5}>
                      Total {currency}
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
                      {displayCurrency(total, currency)}
                    </Text>
                    <Text fontSize="xs" color={subtitleColor} mt={2}>
                      Liquid balance in {currency}
                    </Text>
                  </Box>
                  <Flex w={10} h={10} align="center" justify="center" borderRadius="xl" bg={useColorModeValue('green.50', 'green.950/50')}>
                    <FiTrendingUp color="var(--chakra-colors-green-500)" size={20} />
                  </Flex>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        )}

        <Grid templateColumns={{ base: '1fr', lg: '7fr 5fr' }} gap={6} mb={8}>
          <Box
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            p={{ base: 5, md: 6 }}
            shadow="xs"
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Heading as="h2" size="sm" fontWeight="700" letterSpacing="tight">
                  Balance by Currency
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  Currency distribution across active wallets
                </Text>
              </Box>
              <Badge colorPalette="blue" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                Currencies
              </Badge>
            </Flex>
            {summaryLoading ? (
              <Flex justify="center" py={12}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : (
              <WalletSummaryChart data={summary} />
            )}
          </Box>


          <Box
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            p={{ base: 5, md: 6 }}
            shadow="xs"
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Heading as="h2" size="sm" fontWeight="700" letterSpacing="tight">
                  Portfolio Overview
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  Key wallet account statistics
                </Text>
              </Box>
              <Badge colorPalette="purple" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                Overview
              </Badge>
            </Flex>

            <VStack align="stretch" gap={4}>
              <Flex justify="space-between" align="center" p={3.5} borderRadius="xl" bg={useColorModeValue('gray.50/60', 'gray.900/40')} border="1px solid" borderColor={borderColor}>
                <Text fontSize="xs" fontWeight="600" color={subtitleColor}>Total Wallets</Text>
                <Badge colorPalette="blue" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="700">
                  {wallets.length} accounts
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center" p={3.5} borderRadius="xl" bg={useColorModeValue('gray.50/60', 'gray.900/40')} border="1px solid" borderColor={borderColor}>
                <Text fontSize="xs" fontWeight="600" color={subtitleColor}>Active Currencies</Text>
                <Badge colorPalette="green" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="700">
                  {Object.keys(summary).length} currencies
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center" p={3.5} borderRadius="xl" bg={useColorModeValue('gray.50/60', 'gray.900/40')} border="1px solid" borderColor={borderColor}>
                <Text fontSize="xs" fontWeight="600" color={subtitleColor}>Total Nominal Balance</Text>
                <Text fontSize="sm" fontWeight="800">
                  {displayNumber(Object.values(summary).reduce((sum, val) => sum + val, 0))}
                </Text>
              </Flex>
            </VStack>
          </Box>
        </Grid>

        {/* Your Wallets List Section */}
        <Box
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          p={{ base: 5, md: 6 }}
          shadow="xs"
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading as="h2" size="sm" fontWeight="700" letterSpacing="tight">
                Your Wallets & Accounts
              </Heading>
              <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                Individual account details, balances, and management
              </Text>
            </Box>
            <VisibilityToggle isHidden={isHidden} onToggle={toggleVisibility} />
          </Flex>

          {loading ? (
            <Flex justify="center" py={12}>
              <Spinner size="lg" color="blue.500" />
            </Flex>
          ) : (
            <WalletList
              wallets={wallets}
              onEdit={handleEditWallet}
              onDelete={handleDeleteWallet}
              formatCurrency={displayCurrency}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default WalletDashboard;