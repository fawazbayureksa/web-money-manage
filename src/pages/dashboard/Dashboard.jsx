import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Grid,
  Card,
  Flex,
  Spinner,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { useColorModeValue } from '../../components/ui/color-mode';
import { api } from '../../components/axios/Config';
import { toaster } from '../../components/ui/toaster';
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPieChart,
} from 'react-icons/fi';

// Dashboard Components
import StatCard from '../../components/dashboard/StatCard';
import MonthlyComparisonChart from '../../components/dashboard/MonthlyComparisonChart';
import CategoryDonutChart from '../../components/dashboard/CategoryDonutChart';
import NetSavingsChart from '../../components/dashboard/NetSavingsChart';
import { VisibilityToggle } from '../../components/ui/VisibilityToggle';
import { PayCycleToggle } from '../../components/ui/PayCycleToggle';
import { useLocalValueVisibility } from '../../hooks/useValueVisibility';

/**
 * Format currency for IDR
 */
const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Analytics Dashboard Component
 */
const Dashboard = () => {
  const [userName, setUserName] = useState('');
  const [monthlyData, setMonthlyData] = useState([]);
  const [yearlyData, setYearlyData] = useState(null);
  const [loadingMonthly, setLoadingMonthly] = useState(true);
  const [loadingYearly, setLoadingYearly] = useState(true);
  const [usePayCycle, setUsePayCycle] = useState(false);

  // Handle pay cycle toggle
  const handlePayCycleToggle = useCallback((isEnabled) => {
    setUsePayCycle(isEnabled);
  }, []);

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const pageBg = useColorModeValue('gray.50', 'gray.900');

  const fetchMonthlyComparison = useCallback(async () => {
    try {
      const params = { months: 6 };
      if (usePayCycle) {
        params.use_pay_cycle = 'true';
      }
      const response = await api.get('analytics/monthly-comparison', { params });
      setMonthlyData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching monthly comparison:', error);
      toaster.create({
        description: "Failed to fetch monthly comparison",
        type: "error",
      });
    } finally {
      setLoadingMonthly(false);
    }
  }, [usePayCycle]);

  const fetchYearlyReport = useCallback(async () => {
    try {
      const currentYear = new Date().getFullYear();
      const params = { year: currentYear };
      if (usePayCycle) {
        params.use_pay_cycle = 'true';
      }
      const response = await api.get('analytics/yearly-report', { params });
      setYearlyData(response.data.data || null);
    } catch (error) {
      console.error('Error fetching yearly report:', error);
      toaster.create({
        description: "Failed to fetch yearly report",
        type: "error",
      });
    } finally {
      setLoadingYearly(false);
    }
  }, [usePayCycle]);

  useEffect(() => {
    // Get user name
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || 'User');
      } catch {
        setUserName('User');
      }
    }

    // Fetch data
    fetchMonthlyComparison();
    fetchYearlyReport();
  }, [fetchMonthlyComparison, fetchYearlyReport]);

  // Calculate latest changes from monthly data
  const latestIncome = monthlyData[monthlyData.length - 1]?.income || 0;
  const latestExpense = monthlyData[monthlyData.length - 1]?.expense || 0;
  const latestNet = monthlyData[monthlyData.length - 1]?.net || 0;
  const incomeChange = monthlyData[monthlyData.length - 1]?.income_change || 0;
  const expenseChange = monthlyData[monthlyData.length - 1]?.expense_change || 0;

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

    // Value visibility hook
  const { isHidden, toggleVisibility, formatValue } = useLocalValueVisibility();
  
   // Format currency with visibility check
  const displayCurrency = (amount) => {
    return formatValue(amount, formatCurrency);
  };



  // Savings rate calculation
  const savingsRate = yearlyData?.total_income > 0
    ? ((yearlyData.net_savings / yearlyData.total_income) * 100).toFixed(1)
    : 0;

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        {/* Header Hero Section */}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={6}
          mb={8}
          pb={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Box>
            <Flex align="center" gap={2} mb={2}>
              {/* <Box w={2} h={2} borderRadius="full" bg="blue.500" /> */}
              <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="widest" color={subtitleColor}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </Flex>
            <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
              {getGreeting()}, {userName}
            </Heading>
            <Text color={subtitleColor} fontSize="md">
              Here is your financial performance and active cash flow overview.
            </Text>
          </Box>

          <Flex
            gap={3}
            align="center"
            wrap="wrap"
            p={1.5}
            borderRadius="2xl"
            bg={cardBg}
            border="1px solid"
            borderColor={borderColor}
            shadow="xs"
          >
            <Box px={3} py={1.5}>
              <PayCycleToggle isEnabled={usePayCycle} onToggle={handlePayCycleToggle} />
            </Box>
            <Box w="1px" h={6} bg={borderColor} />
            <Box px={2} py={1.5}>
              <VisibilityToggle isHidden={isHidden} onToggle={toggleVisibility} />
            </Box>
          </Flex>
        </Flex>

        {/* Key Metrics Grid */}
        {loadingYearly ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : (
          <Grid
            templateColumns={{ base: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
            gap={5}
            mb={8}
          >
            <StatCard
              title="Total Income"
              value={yearlyData?.total_income || 0}
              formatValue={displayCurrency}
              icon={FiTrendingUp}
              colorScheme="green"
              change={incomeChange}
              changeLabel="vs last month"
            />
            <StatCard
              title="Total Expense"
              value={yearlyData?.total_expense || 0}
              formatValue={displayCurrency}
              icon={FiTrendingDown}
              colorScheme="red"
              change={expenseChange}
              changeLabel="vs last month"
            />
            <StatCard
              title="Net Savings"
              value={yearlyData?.net_savings || 0}
              formatValue={displayCurrency}
              icon={FiDollarSign}
              colorScheme="blue"
            />
            <StatCard
              title="Savings Rate"
              value={`${savingsRate}%`}
              icon={FiPieChart}
              colorScheme="purple"
              change={parseFloat(savingsRate) - 20}
              changeLabel="vs 20% goal"
            />
          </Grid>
        )}

        {/* Main Analytics Row: Income vs Expense & Net Savings */}
        <Grid templateColumns={{ base: '1fr', lg: '7fr 5fr' }} gap={6} mb={8}>
          {/* Monthly Comparison Chart */}
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
                  Income vs Expense
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  Performance over the last 6 months
                </Text>
              </Box>
              <Badge colorPalette="blue" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                6 Months
              </Badge>
            </Flex>
            {loadingMonthly ? (
              <Flex justify="center" py={12}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : (
              <MonthlyComparisonChart data={monthlyData} />
            )}
          </Box>

          {/* Net Savings Trend Chart */}
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
                  Net Savings Trend
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  Accumulated net growth trajectory
                </Text>
              </Box>
              <Flex w={8} h={8} align="center" justify="center" borderRadius="lg" bg={useColorModeValue('blue.50', 'blue.950/50')}>
                <Icon as={FiTrendingUp} boxSize={4} color="blue.500" />
              </Flex>
            </Flex>
            {loadingMonthly ? (
              <Flex justify="center" py={12}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : (
              <NetSavingsChart data={monthlyData} />
            )}
          </Box>
        </Grid>

        {/* Category Breakdown Row */}
        <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
          {/* Top Expense Categories */}
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
                  Expense Distribution
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  Breakdown by top spending categories
                </Text>
              </Box>
              <Badge colorPalette="red" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                Expenses
              </Badge>
            </Flex>

            {loadingYearly ? (
              <Flex justify="center" py={12}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : (
              <CategoryDonutChart
                data={yearlyData?.top_expense_categories || []}
                emptyMessage="No expense data available"
              />
            )}
          </Box>

          {/* Top Income Categories */}
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
                  Income Sources
                </Heading>
                <Text color={subtitleColor} fontSize="xs" mt={0.5}>
                  Breakdown by top revenue origins
                </Text>
              </Box>
              <Badge colorPalette="green" variant="subtle" px={2.5} py={0.5} borderRadius="full" fontSize="xs" fontWeight="600">
                Income
              </Badge>
            </Flex>

            {loadingYearly ? (
              <Flex justify="center" py={12}>
                <Spinner size="lg" color="blue.500" />
              </Flex>
            ) : (
              <CategoryDonutChart
                data={yearlyData?.top_income_categories || []}
                emptyMessage="No income data available"
              />
            )}
          </Box>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;