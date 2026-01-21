import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Grid,
  Card,
  Spinner,
  Flex,
  Icon,
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

const WalletDashboard = () => {
  const navigate = useNavigate();
  const [wallets, setWallets] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const cardBg = useColorModeValue('white', 'gray.800');

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
    }).format(amount);
  };

  return (
    <Box maxW="7xl" mx="auto" px={4} py={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Wallet Management
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.400' }}>
              Manage your assets and track balances across different accounts
            </Text>
          </Box>
          <Button
            colorPalette="blue"
            size="lg"
            onClick={handleCreateWallet}
            leftIcon={<FiPlus />}
          >
            Add Wallet
          </Button>
        </Flex>

        {/* Summary Stats */}
        {summaryLoading ? (
          <Flex justify="center" py={8}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
            {Object.entries(summary).map(([currency, total]) => (
              <Card.Root key={currency} bg={cardBg} p={6}>
                <Card.Body>
                  <HStack justify="space-between" align="start">
                    <Box>
                      <Text fontSize="sm" color="gray.600" mb={1}>
                        Total {currency}
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {formatCurrency(total, currency)}
                      </Text>
                    </Box>
                    <Icon as={FiTrendingUp} boxSize={8} color="green.500" />
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        )}

        {/* Chart and List */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
          {/* Summary Chart */}
          <Card.Root bg={cardBg}>
            <Card.Header>
              <Heading size="md">Balance by Currency</Heading>
            </Card.Header>
            <Card.Body>
              {summaryLoading ? (
                <Flex justify="center" py={8}>
                  <Spinner size="lg" color="blue.500" />
                </Flex>
              ) : (
                <WalletSummaryChart data={summary} />
              )}
            </Card.Body>
          </Card.Root>

          {/* Quick Stats */}
          <Card.Root bg={cardBg}>
            <Card.Header>
              <Heading size="md">Quick Stats</Heading>
            </Card.Header>
            <Card.Body>
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between">
                  <Text>Total Wallets</Text>
                  <Badge colorPalette="blue" variant="subtle">
                    {wallets.length}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Active Currencies</Text>
                  <Badge colorPalette="green" variant="subtle">
                    {Object.keys(summary).length}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text>Total Balance</Text>
                  <Text fontWeight="bold">
                    {Object.values(summary).reduce((sum, val) => sum + val, 0).toLocaleString('id-ID')}
                  </Text>
                </HStack>
              </VStack>
            </Card.Body>
          </Card.Root>
        </Grid>

        {/* Wallet List */}
        <Card.Root bg={cardBg}>
          <Card.Header>
            <Heading size="md">Your Wallets</Heading>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <Flex justify="center" py={8}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : (
              <WalletList
                wallets={wallets}
                onEdit={handleEditWallet}
                onDelete={handleDeleteWallet}
                formatCurrency={formatCurrency}
              />
            )}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

export default WalletDashboard;