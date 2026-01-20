import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  Grid,
  Card,
  Flex,
  Spinner,
  VStack,
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
  FiCalendar
} from 'react-icons/fi';

// Dashboard Components
import StatCard from '../../components/dashboard/StatCard';
import MonthlyComparisonChart from '../../components/dashboard/MonthlyComparisonChart';
import CategoryDonutChart from '../../components/dashboard/CategoryDonutChart';
import NetSavingsChart from '../../components/dashboard/NetSavingsChart';
import { VisibilityToggle } from '../../components/ui/VisibilityToggle';
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

  // Colors
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

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
  }, []);

  const fetchMonthlyComparison = async () => {
    try {
      const response = await api.get('analytics/monthly-comparison?months=6');
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
  };

  const fetchYearlyReport = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await api.get(`analytics/yearly-report?year=${currentYear}`);
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
  };

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



  return (
    <Box maxW="7xl" mx="auto" px={4} py={6}>
      {/* Header */}
      <Box mb={8}>
        <Heading as="h1" size="xl" fontWeight="bold" mb={2}>
          {getGreeting()}, {userName} 👋
        </Heading>
        <Flex align="center" justifyContent={"space-between"} gap={4}>
          <Text color={subtitleColor} fontSize="lg">
            Here's your financial overview
          </Text>
          <VisibilityToggle isHidden={isHidden} onToggle={toggleVisibility} />
          </Flex>
      </Box>

      {/* Summary Stats */}
      {loadingYearly ? (
        <Flex justify="center" py={8}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : (
        <Grid
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={6}
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
            title="Current Year"
            value={yearlyData?.year || new Date().getFullYear()}
            icon={FiCalendar}
            colorScheme="purple"
          />
        </Grid>
      )}

      {/* Monthly Comparison Section */}
      <Card.Root
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        mb={8}
        overflow="hidden"
      >
        <Card.Body p={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading as="h3" size="md" fontWeight="bold">
                Income vs Expense
              </Heading>
              <Text color={subtitleColor} fontSize="sm">
                Last 6 months comparison
              </Text>
            </Box>
            <Badge colorPalette="blue" variant="subtle" px={3} py={1} borderRadius="full">
              Monthly
            </Badge>
          </Flex>

          {loadingMonthly ? (
            <Flex justify="center" py={12}>
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : (
            <MonthlyComparisonChart data={monthlyData} />
          )}
        </Card.Body>
      </Card.Root>

      {/* Net Savings Trend */}
      <Card.Root
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        mb={8}
        overflow="hidden"
      >
        <Card.Body p={6}>
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Heading as="h3" size="md" fontWeight="bold">
                Net Savings Trend
              </Heading>
              <Text color={subtitleColor} fontSize="sm">
                Your savings over time
              </Text>
            </Box>
            <Icon as={FiTrendingUp} boxSize={5} color="blue.500" />
          </Flex>

          {loadingMonthly ? (
            <Flex justify="center" py={12}>
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : (
            <NetSavingsChart data={monthlyData} />
          )}
        </Card.Body>
      </Card.Root>

      {/* Category Breakdown */}
      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        {/* Top Expense Categories */}
        <Card.Root
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Card.Body p={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Heading as="h3" size="md" fontWeight="bold">
                  Top Expenses
                </Heading>
                <Text color={subtitleColor} fontSize="sm">
                  Where your money goes
                </Text>
              </Box>
              <Badge colorPalette="red" variant="subtle" px={3} py={1} borderRadius="full">
                Expense
              </Badge>
            </Flex>

            {loadingYearly ? (
              <Flex justify="center" py={12}>
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : (
              <CategoryDonutChart
                data={yearlyData?.top_expense_categories || []}
                emptyMessage="No expense data available"
              />
            )}
          </Card.Body>
        </Card.Root>

        {/* Top Income Categories */}
        <Card.Root
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          overflow="hidden"
        >
          <Card.Body p={6}>
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Heading as="h3" size="md" fontWeight="bold">
                  Top Income Sources
                </Heading>
                <Text color={subtitleColor} fontSize="sm">
                  Where your money comes from
                </Text>
              </Box>
              <Badge colorPalette="green" variant="subtle" px={3} py={1} borderRadius="full">
                Income
              </Badge>
            </Flex>

            {loadingYearly ? (
              <Flex justify="center" py={12}>
                <Spinner size="xl" color="blue.500" />
              </Flex>
            ) : (
              <CategoryDonutChart
                data={yearlyData?.top_income_categories || []}
                emptyMessage="No income data available"
              />
            )}
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Quick Stats Footer */}
      <Card.Root
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        mt={8}
        overflow="hidden"
      >
        <Card.Body p={6}>
          <Flex
            justify="space-around"
            align="center"
            wrap="wrap"
            gap={4}
          >
            <VStack>
              <Text color={subtitleColor} fontSize="sm">This Month Income</Text>
              <Text fontSize="xl" fontWeight="bold" color="green.500">
                {displayCurrency(latestIncome)}
              </Text>
            </VStack>
            <Box h="40px" w="1px" bg={borderColor} display={{ base: 'none', md: 'block' }} />
            <VStack>
              <Text color={subtitleColor} fontSize="sm">This Month Expense</Text>
              <Text fontSize="xl" fontWeight="bold" color="red.500">
                {displayCurrency(latestExpense)}
              </Text>
            </VStack>
            <Box h="40px" w="1px" bg={borderColor} display={{ base: 'none', md: 'block' }} />
            <VStack>
              <Text color={subtitleColor} fontSize="sm">This Month Net</Text>
              <Text fontSize="xl" fontWeight="bold" color={latestNet >= 0 ? 'blue.500' : 'red.500'}>
                {displayCurrency(latestNet)}
              </Text>
            </VStack>
          </Flex>
        </Card.Body>
      </Card.Root>
    </Box>
  );
};

export default Dashboard;