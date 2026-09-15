import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Flex,
  Stack,
  Card,
  Grid,
  Badge,
  SimpleGrid,
  Input,
  Button,
  Switch as ChakraSwitch,
  HStack,
  Tooltip,
  VStack,
  IconButton,
  useBreakpointValue
} from "@chakra-ui/react";
import { useColorModeValue } from '../../components/ui/color-mode';
import { FiSettings, FiRefreshCw, FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart, FiFilter, FiCalendar } from 'react-icons/fi';
import Config from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";
import { useLocalValueVisibility } from '../../hooks/useValueVisibility';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { VisibilityToggle } from '../../components/ui/VisibilityToggle';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { useSearchParams } from 'react-router-dom';
import { getSettings } from '../../services/userSettings';

export default function Financials() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [spendingByCategory, setSpendingByCategory] = useState([]);
  const [spendingByBank, setSpendingByBank] = useState([]);
  const [spendingByTag, setSpendingByTag] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [usePayCycle, setUsePayCycle] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [payCyclePeriods, setPayCyclePeriods] = useState([]);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const isMobile = useBreakpointValue({ base: true, md: false });

  const [inputDateRange, setInputDateRange] = useState({
    start_date: searchParams.get('start_date') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: searchParams.get('end_date') || new Date().toISOString().split('T')[0]
  });

  const dateRange = useMemo(() => ({
    start_date: searchParams.get('start_date') || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: searchParams.get('end_date') || new Date().toISOString().split('T')[0]
  }), [searchParams]);

  // Value visibility hook
  const { isHidden, toggleVisibility, formatValue } = useLocalValueVisibility();

  // Haptic feedback hook
  const { triggerHaptic } = useHapticFeedback();

  const fetchDashboard = useCallback(async (token, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (usePayCycle) params.append('use_pay_cycle', 'true');
      const url = import.meta.env.VITE_API_URL + `analytics/dashboard?${params.toString()}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  }, [usePayCycle]);

  const fetchSpendingByCategory = useCallback(async (token, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (usePayCycle) params.append('use_pay_cycle', 'true');
      const url = import.meta.env.VITE_API_URL + `analytics/spending-by-category?${params.toString()}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setSpendingByCategory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching spending by category:', error);
    }
  }, [usePayCycle]);

  const fetchSpendingByAsset = useCallback(async (token, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      params.append('start_date', startDate);
      params.append('end_date', endDate);
      if (usePayCycle) params.append('use_pay_cycle', 'true');
      const url = import.meta.env.VITE_API_URL + `analytics/spending-by-asset?${params.toString()}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setSpendingByBank(response.data.data || []);
    } catch (error) {
      console.error('Error fetching spending by asset:', error);
    }
  }, [usePayCycle]);

  const fetchMonthlyComparison = useCallback(async (token, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (!startDate && !endDate) params.append('months', '6');
      if (usePayCycle) params.append('use_pay_cycle', 'true');
      const url = import.meta.env.VITE_API_URL + `analytics/monthly-comparison?${params.toString()}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setMonthlyComparison(response.data.data || []);

      if (response.data.periods) {
        setPayCyclePeriods(response.data.periods);
      }
    } catch (error) {
      console.error('Error fetching monthly comparison:', error);
    }
  }, [usePayCycle]);

  const fetchSpendingByTag = useCallback(async (token, startDate, endDate) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      const url = import.meta.env.VITE_API_URL + `v2/analytics/spending-by-tag?${params.toString()}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setSpendingByTag(response.data.data || []);
    } catch (error) {
      console.error('Error fetching spending by tag:', error);
    }
  }, []);

  const fetchAllAnalytics = useCallback(async (startDate, endDate) => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      await Promise.all([
        fetchDashboard(token, startDate, endDate),
        fetchSpendingByCategory(token, startDate, endDate),
        fetchSpendingByAsset(token, startDate, endDate),
        fetchMonthlyComparison(token, startDate, endDate),
        fetchSpendingByTag(token, startDate, endDate)
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toaster.create({
        description: "Failed to fetch analytics data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchDashboard, fetchSpendingByCategory, fetchSpendingByAsset, fetchMonthlyComparison, fetchSpendingByTag]);

  useEffect(() => {
    fetchAllAnalytics(dateRange.start_date, dateRange.end_date);
  }, [dateRange, fetchAllAnalytics]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await getSettings();
        if (response.data && response.data.pay_cycle_type && response.data.pay_cycle_type !== 'calendar') {
          setUserSettings(response.data);
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Error fetching user settings:', error);
        }
      }
    };
    fetchUserSettings();
  }, []);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setInputDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyDateFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    if (inputDateRange.start_date) {
      newParams.set('start_date', inputDateRange.start_date);
    } else {
      newParams.delete('start_date');
    }
    if (inputDateRange.end_date) {
      newParams.set('end_date', inputDateRange.end_date);
    } else {
      newParams.delete('end_date');
    }
    setSearchParams(newParams);
  };

  const formatCurrency = (amount) => {
    return `Rp ${(amount || 0).toLocaleString('id-ID')}`;
  };

  // Format currency with visibility check
  const displayCurrency = (amount) => {
    return formatValue(amount, formatCurrency);
  };

  // Format percentage with visibility check
  const displayPercentage = (value, decimals = 1) => {
    return formatValue(value, (v) => `${(v || 0).toFixed(decimals)}%`);
  };

  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
  };

  const handleTogglePayCycle = (details) => {
    console.log(details);
    if (!userSettings) {
      triggerHaptic('medium');
      toaster.create({
        description: "Please configure your pay cycle settings first",
        type: "warning",
      });
      return;
    }
    triggerHaptic('light');
    setUsePayCycle(!usePayCycle);
  };

  const handleOpenSettings = () => {
    triggerHaptic('light');
    setIsBottomSheetOpen(true);
  };

  const handleCloseSettings = () => {
    triggerHaptic('light');
    setIsBottomSheetOpen(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="500px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  const currentMonth = dashboardData?.current_month || {};
  const lastMonth = dashboardData?.last_month || {};
  const budgetSummary = dashboardData?.budget_summary || {};

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        {/* Header Hero Section */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', lg: 'center' }}
          direction={{ base: 'column', lg: 'row' }}
          gap={6}
          mb={8}
          pb={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Box>
            <Flex align="center" gap={2} mb={2}>
              <Box w={2} h={2} borderRadius="full" bg="blue.500" />
              <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="widest" color={subtitleColor}>
                Financial Analytics
              </Text>
            </Flex>
            <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
              Financial Performance
            </Heading>
            <Text color={subtitleColor} fontSize="md">
              Deep dive into income streams, expense breakdowns, asset distribution, and budget health.
            </Text>
          </Box>

          {/* Action Toolbar & Filters */}
          <Flex align="center" gap={3} wrap="wrap">
            <HStack
              bg={cardBg}
              p={2}
              borderRadius="2xl"
              border="1px solid"
              borderColor={borderColor}
              shadow="xs"
              gap={3}
              wrap="wrap"
            >
              <Flex align="center" gap={2} px={1}>
                <Flex align="center" gap={1.5}>
                  <Text fontSize="xs" fontWeight="600" color={subtitleColor}>From</Text>
                  <Input
                    type="date"
                    name="start_date"
                    size="sm"
                    value={inputDateRange.start_date}
                    onChange={handleDateChange}
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    borderColor={borderColor}
                    borderRadius="xl"
                    w={{ base: '130px', sm: '145px' }}
                  />
                </Flex>
                <Flex align="center" gap={1.5}>
                  <Text fontSize="xs" fontWeight="600" color={subtitleColor}>To</Text>
                  <Input
                    type="date"
                    name="end_date"
                    size="sm"
                    value={inputDateRange.end_date}
                    onChange={handleDateChange}
                    bg={useColorModeValue('gray.50', 'gray.900')}
                    borderColor={borderColor}
                    borderRadius="xl"
                    w={{ base: '130px', sm: '145px' }}
                  />
                </Flex>
                <Button
                  size="sm"
                  onClick={applyDateFilter}
                  color="blue"
                  borderRadius="xl"
                  px={3.5}
                  fontWeight="600"
                >
                  Filter
                </Button>
              </Flex>

              <Box w="1px" h={6} bg={borderColor} display={{ base: 'none', sm: 'block' }} />

              <HStack gap={3} px={1}>
                {userSettings && !isMobile && (
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <HStack gap={2}>
                        <ChakraSwitch.Root
                          checked={usePayCycle}
                          onCheckedChange={(details) => handleTogglePayCycle(details.checked)}
                          colorPalette="blue"
                          size="sm"
                        >
                          <ChakraSwitch.HiddenInput />
                          <ChakraSwitch.Control>
                            <ChakraSwitch.Thumb />
                          </ChakraSwitch.Control>
                        </ChakraSwitch.Root>
                        <Text fontSize="xs" fontWeight="600" color={subtitleColor}>
                          Pay Cycle
                        </Text>
                      </HStack>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      Use custom pay cycle ({userSettings.pay_cycle_type})
                    </Tooltip.Content>
                  </Tooltip.Root>
                )}

                {userSettings && isMobile && (
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="blue"
                    aria-label="Pay Cycle Settings"
                    onClick={handleOpenSettings}
                  >
                    <FiSettings />
                  </IconButton>
                )}

                <VisibilityToggle isHidden={isHidden} onToggle={toggleVisibility} />
              </HStack>
            </HStack>
          </Flex>
        </Flex>

        {/* Pay Cycle Periods Alert Banner */}
        {usePayCycle && payCyclePeriods.length > 0 && (
          <Box
            mb={6}
            p={4}
            borderRadius="2xl"
            bg={useColorModeValue('blue.50/60', 'blue.950/40')}
            border="1px solid"
            borderColor={useColorModeValue('blue.200/60', 'blue.800/60')}
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Flex align="center" gap={2}>
                <Box w={2} h={2} borderRadius="full" bg="blue.500" />
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={useColorModeValue('blue.700', 'blue.300')}>
                  Active Pay Cycle Periods
                </Text>
              </Flex>
              <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">
                {userSettings?.pay_cycle_type || 'Custom'}
              </Badge>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
              {payCyclePeriods.slice(0, 3).map((period, idx) => (
                <Flex
                  key={idx}
                  justify="space-between"
                  align="center"
                  p={2.5}
                  borderRadius="xl"
                  bg={useColorModeValue('white', 'gray.800')}
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Text fontSize="xs" fontWeight="500" color={subtitleColor}>
                    Period {idx + 1}: {formatDate(period.period_start)} – {formatDate(period.period_end)}
                  </Text>
                  <Badge size="xs" colorPalette={period.is_current ? 'green' : 'gray'} variant="subtle" borderRadius="full">
                    {period.is_current ? 'Current' : 'Completed'}
                  </Badge>
                </Flex>
              ))}
            </SimpleGrid>
          </Box>
        )}

        {/* Top Summary Metrics */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={8}>
          {/* Total Income */}
          <Box
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
                  Total Income
                </Text>
                <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={useColorModeValue('green.600', 'green.300')}>
                  {displayCurrency(currentMonth.total_income)}
                </Text>
                <Text fontSize="xs" color={subtitleColor} mt={2}>
                  {currentMonth.income_count || 0} transactions
                </Text>
              </Box>
              <Flex w={10} h={10} align="center" justify="center" borderRadius="xl" bg={useColorModeValue('green.50', 'green.950/50')}>
                <FiTrendingUp color="var(--chakra-colors-green-500)" size={20} />
              </Flex>
            </Flex>
          </Box>

          {/* Total Expense */}
          <Box
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
                  Total Expense
                </Text>
                <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={useColorModeValue('red.600', 'red.300')}>
                  {displayCurrency(currentMonth.total_expense)}
                </Text>
                <Text fontSize="xs" color={subtitleColor} mt={2}>
                  {currentMonth.expense_count || 0} transactions
                </Text>
              </Box>
              <Flex w={10} h={10} align="center" justify="center" borderRadius="xl" bg={useColorModeValue('red.50', 'red.950/50')}>
                <FiTrendingDown color="var(--chakra-colors-red-500)" size={20} />
              </Flex>
            </Flex>
          </Box>

          {/* Net Amount */}
          <Box
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
                  Net Amount
                </Text>
                <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={useColorModeValue((currentMonth.net_amount || 0) >= 0 ? 'blue.600' : 'orange.600', (currentMonth.net_amount || 0) >= 0 ? 'blue.300' : 'orange.300')}>
                  {displayCurrency(currentMonth.net_amount)}
                </Text>
                <Text fontSize="xs" color={subtitleColor} mt={2}>
                  Active period net balance
                </Text>
              </Box>
              <Flex w={10} h={10} align="center" justify="center" borderRadius="xl" bg={useColorModeValue('blue.50', 'blue.950/50')}>
                <FiDollarSign color="var(--chakra-colors-blue-500)" size={20} />
              </Flex>
            </Flex>
          </Box>

          {/* Savings Rate */}
          <Box
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
                  Savings Rate
                </Text>
                <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={useColorModeValue('purple.600', 'purple.300')}>
                  {displayPercentage(currentMonth.savings_rate)}
                </Text>
                <Flex align="center" gap={1} mt={2}>
                  <Text fontSize="xs" fontWeight="600" color={currentMonth.savings_rate > lastMonth.savings_rate ? 'green.500' : 'red.500'}>
                    {currentMonth.savings_rate > lastMonth.savings_rate ? '↑ Higher' : '↓ Lower'}
                  </Text>
                  <Text fontSize="xs" color={subtitleColor}>
                    vs last month
                  </Text>
                </Flex>
              </Box>
              <Flex w={10} h={10} align="center" justify="center" borderRadius="xl" bg={useColorModeValue('purple.50', 'purple.950/50')}>
                <FiPieChart color="var(--chakra-colors-purple-500)" size={20} />
              </Flex>
            </Flex>
          </Box>
        </SimpleGrid>

        {/* Breakdown Row: Spending by Category & Asset */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={8}>
          {/* Spending by Category */}
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
                  Spending by Category
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  {inputDateRange.start_date || 'All time'} – {inputDateRange.end_date || 'All time'}
                </Text>
              </Box>
              <Badge colorPalette="blue" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                Categories
              </Badge>
            </Flex>

            {spendingByCategory.length > 0 ? (
              <Stack gap={4}>
                {spendingByCategory.slice(0, 8).map((cat, idx) => (
                  <Box key={idx}>
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <Flex align="center" gap={2}>
                        <Text fontSize="sm" fontWeight="600">{cat.category_name}</Text>
                        <Badge size="xs" variant="outline" colorPalette="blue">{cat.count} txns</Badge>
                      </Flex>
                      <Text fontSize="sm" fontWeight="700">{displayCurrency(cat.total_amount)}</Text>
                    </Flex>
                    <Box w="100%" bg={useColorModeValue('gray.100', 'gray.700')} h="6px" borderRadius="full" overflow="hidden">
                      <Box
                        bg="blue.500"
                        h="100%"
                        w={`${Math.min(cat.percentage, 100)}%`}
                        borderRadius="full"
                        transition="width 0.4s ease-out"
                      />
                    </Box>
                    <Text fontSize="xs" color={subtitleColor} mt={1}>
                      {displayPercentage(cat.percentage)} of total spending
                    </Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text color={subtitleColor} fontSize="sm" textAlign="center" py={8}>
                No category data available for this range
              </Text>
            )}
          </Box>

          {/* Spending by Asset */}
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
                  Spending by Asset Account
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  {inputDateRange.start_date || 'All time'} – {inputDateRange.end_date || 'All time'}
                </Text>
              </Box>
              <Badge colorPalette="green" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                Assets
              </Badge>
            </Flex>

            {spendingByBank.length > 0 ? (
              <Stack gap={4}>
                {spendingByBank.map((asset, idx) => (
                  <Box key={idx}>
                    <Flex justify="space-between" align="center" mb={1.5}>
                      <Flex align="center" gap={2}>
                        <Text fontSize="sm" fontWeight="600">{asset.asset_name}</Text>
                        <Badge size="xs" variant="subtle" colorPalette="green">{asset.asset_type}</Badge>
                      </Flex>
                      <Text fontSize="sm" fontWeight="700">{displayCurrency(asset.total_expense)}</Text>
                    </Flex>
                    <Box w="100%" bg={useColorModeValue('gray.100', 'gray.700')} h="6px" borderRadius="full" overflow="hidden">
                      <Box
                        bg="green.500"
                        h="100%"
                        w={`${Math.min(asset.percentage, 100)}%`}
                        borderRadius="full"
                        transition="width 0.4s ease-out"
                      />
                    </Box>
                    <Flex justify="space-between" align="center" mt={1}>
                      <Text fontSize="xs" color={subtitleColor}>
                        {displayPercentage(asset.percentage)} of total spending ({asset.transaction_count} txns)
                      </Text>
                      <Text fontSize="xs" fontWeight="600" color={asset.net_amount >= 0 ? "green.600" : "red.600"}>
                        Net: {displayCurrency(asset.net_amount)}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text color={subtitleColor} fontSize="sm" textAlign="center" py={8}>
                No asset account data available for this range
              </Text>
            )}
          </Box>
        </Grid>

        {/* Spending by Tag */}
        <Box
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          p={{ base: 5, md: 6 }}
          shadow="xs"
          mb={8}
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading as="h2" size="sm" fontWeight="700" letterSpacing="tight">
                Spending by Tag
              </Heading>
              <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                Tag-based expense classification and breakdown
              </Text>
            </Box>
            <Badge colorPalette="purple" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
              Tags
            </Badge>
          </Flex>

          {spendingByTag.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {spendingByTag.map((tag, idx) => (
                <Box
                  key={idx}
                  p={4}
                  borderRadius="xl"
                  bg={useColorModeValue('gray.50/80', 'gray.900/60')}
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Flex align="center" gap={3} mb={3}>
                    {tag.icon && <Text fontSize="xl">{tag.icon}</Text>}
                    <Box flex={1}>
                      <Text fontWeight="700" fontSize="sm">{tag.name}</Text>
                      <Text fontSize="xs" color={subtitleColor}>{tag.transaction_count} transactions</Text>
                    </Box>
                    <Box
                      w="10px"
                      h="10px"
                      borderRadius="full"
                      bg={tag.color || 'purple.500'}
                    />
                  </Flex>
                  <VStack gap={1.5} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color={subtitleColor}>Total Spending</Text>
                      <Text fontWeight="700" fontSize="sm">{displayCurrency(tag.total_spending)}</Text>
                    </Flex>
                    <Flex justify="space-between" align="center">
                      <Text fontSize="xs" color={subtitleColor}>Average / Txn</Text>
                      <Text fontSize="xs" fontWeight="500">{displayCurrency(tag.average_amount)}</Text>
                    </Flex>
                    <Box w="100%" bg={useColorModeValue('gray.200', 'gray.700')} h="5px" borderRadius="full" overflow="hidden" mt={1}>
                      <Box
                        bg={tag.color || 'purple.500'}
                        h="100%"
                        w={`${Math.min(tag.percentage, 100)}%`}
                        borderRadius="full"
                      />
                    </Box>
                    <Text fontSize="xs" color={subtitleColor} mt={0.5}>
                      {displayPercentage(tag.percentage)} of total spending
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text color={subtitleColor} fontSize="sm" textAlign="center" py={6}>
              No tagged transactions recorded yet
            </Text>
          )}
        </Box>

        {/* Budget Overview */}
        {budgetSummary.total_budgets > 0 && (
          <Box
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            p={{ base: 5, md: 6 }}
            shadow="xs"
            mb={8}
          >
            <Flex justify="space-between" align="center" mb={6}>
              <Box>
                <Heading as="h2" size="sm" fontWeight="700" letterSpacing="tight">
                  Budget Utilization
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  Overall spending against set budget targets
                </Text>
              </Box>
              <Badge colorPalette="orange" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                Budgets
              </Badge>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
              <Box textAlign="center" p={4} bg={useColorModeValue('blue.50/50', 'blue.950/40')} borderRadius="xl" border="1px solid" borderColor={useColorModeValue('blue.100', 'blue.900')}>
                <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={useColorModeValue('blue.600', 'blue.300')}>Active Budgets</Text>
                <Text fontSize="2xl" fontWeight="800" color={useColorModeValue('blue.700', 'blue.200')} mt={1}>
                  {budgetSummary.active_budgets}
                </Text>
              </Box>
              <Box textAlign="center" p={4} bg={useColorModeValue('orange.50/50', 'orange.950/40')} borderRadius="xl" border="1px solid" borderColor={useColorModeValue('orange.100', 'orange.900')}>
                <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={useColorModeValue('orange.600', 'orange.300')}>Warning Threshold</Text>
                <Text fontSize="2xl" fontWeight="800" color={useColorModeValue('orange.700', 'orange.200')} mt={1}>
                  {budgetSummary.warning_budgets}
                </Text>
              </Box>
              <Box textAlign="center" p={4} bg={useColorModeValue('red.50/50', 'red.950/40')} borderRadius="xl" border="1px solid" borderColor={useColorModeValue('red.100', 'red.900')}>
                <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={useColorModeValue('red.600', 'red.300')}>Exceeded Limits</Text>
                <Text fontSize="2xl" fontWeight="800" color={useColorModeValue('red.700', 'red.200')} mt={1}>
                  {budgetSummary.exceeded_budgets}
                </Text>
              </Box>
            </SimpleGrid>

            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="600">Overall Budget Utilization</Text>
                <Text fontSize="sm" fontWeight="800">{displayPercentage(budgetSummary.average_utilization)}</Text>
              </Flex>
              <Box w="100%" bg={useColorModeValue('gray.100', 'gray.700')} h="8px" borderRadius="full" overflow="hidden">
                <Box
                  bg={budgetSummary.average_utilization > 90 ? 'red.500' : budgetSummary.average_utilization > 80 ? 'orange.500' : 'green.500'}
                  h="100%"
                  w={`${Math.min(budgetSummary.average_utilization, 100)}%`}
                  borderRadius="full"
                  transition="width 0.4s ease-out"
                />
              </Box>
              <Flex justify="space-between" mt={2} fontSize="xs" color={subtitleColor}>
                <Text>Spent: {displayCurrency(budgetSummary.total_spent)}</Text>
                <Text>Budgeted: {displayCurrency(budgetSummary.total_budgeted)}</Text>
              </Flex>
            </Box>
          </Box>
        )}

        {/* Monthly Comparison / Pay Cycle Trend */}
        <Box
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          p={{ base: 5, md: 6 }}
          shadow="xs"
          mb={8}
        >
          <Flex justify="space-between" align="center" mb={6}>
            <Box>
              <Heading as="h2" size="sm" fontWeight="700" letterSpacing="tight">
                {usePayCycle ? 'Pay Cycle Trend History' : 'Monthly Performance Trend'}
              </Heading>
              <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                {usePayCycle ? 'Income vs Expense per pay cycle period' : 'Historical income and expense comparisons'}
              </Text>
            </Box>
            <Badge colorPalette="blue" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
              History
            </Badge>
          </Flex>

          {monthlyComparison.length > 0 ? (
            <Stack gap={3}>
              {monthlyComparison.map((month, idx) => (
                <Box
                  key={idx}
                  p={4}
                  borderRadius="xl"
                  bg={useColorModeValue('gray.50/60', 'gray.900/40')}
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <Box>
                      <Text fontWeight="700" fontSize="sm">
                        {usePayCycle && month.period_label
                          ? month.period_label
                          : formatMonth(month.month)}
                      </Text>
                      {usePayCycle && month.period_start && month.period_end && (
                        <Text fontSize="xs" color={subtitleColor}>
                          {formatDate(month.period_start)} – {formatDate(month.period_end)}
                        </Text>
                      )}
                    </Box>
                    <Badge colorPalette={month.net >= 0 ? 'green' : 'red'} variant="subtle" size="sm" borderRadius="full">
                      Net: {displayCurrency(month.net)}
                    </Badge>
                  </Flex>
                  <Grid templateColumns="1fr 1fr" gap={4} mt={3}>
                    <Box>
                      <Text fontSize="xs" color={subtitleColor}>Income</Text>
                      <Text fontWeight="700" fontSize="sm" color={useColorModeValue('green.600', 'green.300')}>
                        {displayCurrency(month.income)}
                      </Text>
                      {month.income_change !== 0 && (
                        <Text fontSize="xs" fontWeight="500" color={month.income_change > 0 ? 'green.500' : 'red.500'}>
                          {month.income_change > 0 ? '↑' : '↓'} {formatValue(Math.abs(month.income_change), (v) => `${v.toFixed(1)}%`)}
                        </Text>
                      )}
                    </Box>
                    <Box>
                      <Text fontSize="xs" color={subtitleColor}>Expense</Text>
                      <Text fontWeight="700" fontSize="sm" color={useColorModeValue('red.600', 'red.300')}>
                        {displayCurrency(month.expense)}
                      </Text>
                      {month.expense_change !== 0 && (
                        <Text fontSize="xs" fontWeight="500" color={month.expense_change > 0 ? 'red.500' : 'green.500'}>
                          {month.expense_change > 0 ? '↑' : '↓'} {formatValue(Math.abs(month.expense_change), (v) => `${v.toFixed(1)}%`)}
                        </Text>
                      )}
                    </Box>
                  </Grid>
                </Box>
              ))}
            </Stack>
          ) : (
            <Text color={subtitleColor} fontSize="sm" textAlign="center" py={6}>
              No historical trend data available
            </Text>
          )}
        </Box>

        {/* Top Spending Categories List */}
        {dashboardData?.top_categories && dashboardData.top_categories.length > 0 && (
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
                  Top Spending Categories ({usePayCycle ? 'This Period' : 'This Month'})
                </Heading>
                {usePayCycle && dashboardData.period_start && dashboardData.period_end && (
                  <Text fontSize="xs" color={subtitleColor} mt={0.5}>
                    {formatDate(dashboardData.period_start)} – {formatDate(dashboardData.period_end)}
                  </Text>
                )}
              </Box>
              <Badge colorPalette="blue" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                Top Categories
              </Badge>
            </Flex>

            <Stack gap={3}>
              {dashboardData.top_categories.slice(0, 5).map((cat, idx) => (
                <Flex
                  key={idx}
                  justify="space-between"
                  align="center"
                  p={3.5}
                  borderRadius="xl"
                  bg={useColorModeValue('gray.50/60', 'gray.900/40')}
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Flex align="center" gap={3}>
                    <Badge
                      size="md"
                      variant="solid"
                      colorPalette={idx === 0 ? 'amber' : idx === 1 ? 'gray' : 'blue'}
                      borderRadius="lg"
                      px={2.5}
                      py={1}
                      fontWeight="700"
                    >
                      #{idx + 1}
                    </Badge>
                    <Box>
                      <Text fontWeight="700" fontSize="sm">{cat.category_name}</Text>
                      <Text fontSize="xs" color={subtitleColor}>{cat.count} transactions</Text>
                    </Box>
                  </Flex>
                  <Box textAlign="right">
                    <Text fontWeight="800" fontSize="sm">{displayCurrency(cat.total_amount)}</Text>
                    <Text fontSize="xs" color={subtitleColor}>{displayPercentage(cat.percentage)} of total</Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Box>
        )}

        {/* Bottom Sheet for Mobile Pay Cycle Toggle */}
        <BottomSheet
          isOpen={isBottomSheetOpen}
          onClose={handleCloseSettings}
          title="Pay Cycle Settings"
        >
          <VStack gap={6} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>Pay Cycle Type</Text>
              <Badge colorPalette="blue" size="md">
                {userSettings?.pay_cycle_type}
              </Badge>
            </Box>

            <Box>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold">Use Pay Cycle for Analytics</Text>
                  <Text fontSize="sm" color="gray.500">
                    Apply your custom pay cycle to all analytics views
                  </Text>
                </Box>
                <ChakraSwitch.Root
                  checked={usePayCycle}
                  onCheckedChange={(details) => handleTogglePayCycle(details)}
                  colorPalette="blue"
                  size="lg"
                >
                  <ChakraSwitch.HiddenInput />
                  <ChakraSwitch.Control>
                    <ChakraSwitch.Thumb />
                  </ChakraSwitch.Control>
                </ChakraSwitch.Root>
              </Flex>
            </Box>

            {usePayCycle && payCyclePeriods.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>Current Period</Text>
                <VStack gap={2} align="stretch" bg="gray.50" p={4} borderRadius="md">
                  {payCyclePeriods.slice(0, 2).map((period, idx) => (
                    <Flex key={idx} justify="space-between" align="center">
                      <Text fontSize="sm">
                        {formatDate(period.period_start)} – {formatDate(period.period_end)}
                      </Text>
                      <Badge colorPalette={period.is_current ? 'green' : 'gray'} size="sm">
                        {period.is_current ? 'Current' : 'Previous'}
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            )}

            <Button
              onClick={handleCloseSettings}
              colorPalette="blue"
              width="full"
            >
              Close
            </Button>

            <Button
              as="a"
              href="/settings/pay-cycle"
              variant="outline"
              width="full"
            >
              Configure Pay Cycle
            </Button>
          </VStack>
        </BottomSheet>

        {/* Floating Action Button for Mobile */}
        {isMobile && userSettings && (
          <IconButton
            onClick={handleOpenSettings}
            position="fixed"
            bottom={6}
            right={6}
            size="lg"
            borderRadius="full"
            shadow="lg"
            colorPalette="blue"
            aria-label="Pay Cycle Settings"
            zIndex="sticky"
          >
            <FiSettings />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
