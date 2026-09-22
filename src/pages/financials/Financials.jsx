import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Stack,
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
  Skeleton,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useColorModeValue } from '../../components/ui/color-mode';
import { FiSettings, FiTrendingUp, FiTrendingDown, FiDollarSign, FiPieChart } from 'react-icons/fi';
import { toaster } from "./../../components/ui/toaster";
import { useLocalValueVisibility } from '../../hooks/useValueVisibility';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { VisibilityToggle } from '../../components/ui/VisibilityToggle';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { useSearchParams } from 'react-router-dom';
import { getSettings } from '../../services/userSettings';

// Analytics pieces
import { useAnalytics } from '../../hooks/useAnalytics';
import StatCard from '../../components/dashboard/StatCard';
import SectionCard from '../../components/ui/SectionCard';
import CategoryDonutChart from '../../components/dashboard/CategoryDonutChart';
import MonthlyComparisonChart from '../../components/dashboard/MonthlyComparisonChart';

const today = () => new Date().toISOString().split('T')[0];
const monthStart = () =>
  new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

export default function Financials() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [usePayCycle, setUsePayCycle] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [inputDateRange, setInputDateRange] = useState({
    start_date: searchParams.get('start_date') || monthStart(),
    end_date: searchParams.get('end_date') || today(),
  });

  const isMobile = useBreakpointValue({ base: true, md: false });

  const { isHidden, toggleVisibility, formatValue } = useLocalValueVisibility();
  const { triggerHaptic } = useHapticFeedback();

  const dateRange = useMemo(() => ({
    start_date: searchParams.get('start_date') || monthStart(),
    end_date: searchParams.get('end_date') || today(),
  }), [searchParams]);

  const { dashboard, byCategory, byAsset, byTag, monthly, periods, loading } = useAnalytics({
    startDate: dateRange.start_date,
    endDate: dateRange.end_date,
    usePayCycle,
  });

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const response = await getSettings();
        if (response.data?.pay_cycle_type && response.data.pay_cycle_type !== 'calendar') {
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

  const formatCurrency = useCallback(
    (amount) => `Rp ${(amount || 0).toLocaleString('id-ID')}`,
    []
  );
  const displayCurrency = useCallback(
    (amount) => formatValue(amount, formatCurrency),
    [formatValue, formatCurrency]
  );
  const displayPercent = useCallback(
    (value, decimals = 1) => formatValue(value, (v) => `${(v || 0).toFixed(decimals)}%`),
    [formatValue]
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const applyDateFilter = () => {
    const newParams = new URLSearchParams(searchParams);
    for (const key of ['start_date', 'end_date']) {
      if (inputDateRange[key]) newParams.set(key, inputDateRange[key]);
      else newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleTogglePayCycle = () => {
    if (!userSettings) {
      triggerHaptic('medium');
      toaster.create({
        description: "Please configure your pay cycle settings first",
        type: "warning",
      });
      return;
    }
    triggerHaptic('light');
    setUsePayCycle((v) => !v);
  };

  const cardColors = {
    green: useColorModeValue('green.600', 'green.300'),
    red: useColorModeValue('red.600', 'red.300'),
    blue: useColorModeValue('blue.600', 'blue.300'),
    orange: useColorModeValue('orange.600', 'orange.300'),
    purple: useColorModeValue('purple.600', 'purple.300'),
  };
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const softBg = useColorModeValue('gray.50', 'gray.900');
  const panelBg = useColorModeValue('white', 'gray.800');
  const blueBandBg = useColorModeValue('blue.50/60', 'blue.950/40');
  const blueBandBorder = useColorModeValue('blue.200/60', 'blue.800/60');
  const blueBandText = useColorModeValue('blue.700', 'blue.300');
  const tagCardBg = useColorModeValue('gray.50/80', 'gray.900/60');
  const tagBarBg = useColorModeValue('gray.200', 'gray.700');
  const budgetBarBg = useColorModeValue('gray.100', 'gray.700');
  const rankRowBg = useColorModeValue('gray.50/60', 'gray.900/40');

  const currentMonth = dashboard?.current_month || {};
  const lastMonth = dashboard?.last_month || {};
  const budgetSummary = dashboard?.budget_summary || {};

  const assetChartData = useMemo(
    () => (byAsset || []).map((a) => ({ name: a.asset_name, value: a.total_expense })),
    [byAsset]
  );

  const rangeLabel = `${inputDateRange.start_date || 'All time'} – ${inputDateRange.end_date || 'All time'}`;

  if (loading) return <FinancialsSkeleton pageBg={pageBg} />;

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        {/* Header */}
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
            <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="widest" color={subtitleColor}>
              Financial Analytics
            </Text>
            <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
              Financial Performance
            </Heading>
            <Text color={subtitleColor} fontSize="md">
              Deep dive into income streams, expense breakdowns, asset distribution, and budget health.
            </Text>
          </Box>

          <HStack
            bg={panelBg}
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
                  onChange={(e) => setInputDateRange((p) => ({ ...p, start_date: e.target.value }))}
                  bg={softBg}
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
                  onChange={(e) => setInputDateRange((p) => ({ ...p, end_date: e.target.value }))}
                  bg={softBg}
                  borderColor={borderColor}
                  borderRadius="xl"
                  w={{ base: '130px', sm: '145px' }}
                />
              </Flex>
              <Button size="sm" onClick={applyDateFilter} color="blue" borderRadius="xl" px={3.5} fontWeight="600">
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
                        onCheckedChange={handleTogglePayCycle}
                        colorPalette="blue"
                        size="sm"
                      >
                        <ChakraSwitch.HiddenInput />
                        <ChakraSwitch.Control>
                          <ChakraSwitch.Thumb />
                        </ChakraSwitch.Control>
                      </ChakraSwitch.Root>
                      <Text fontSize="xs" fontWeight="600" color={subtitleColor}>Pay Cycle</Text>
                    </HStack>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    Use custom pay cycle ({userSettings.pay_cycle_type})
                  </Tooltip.Content>
                </Tooltip.Root>
              )}

              {userSettings && isMobile && (
                <IconButton size="sm" variant="ghost" colorPalette="blue" aria-label="Pay Cycle Settings" onClick={() => setIsBottomSheetOpen(true)}>
                  <FiSettings />
                </IconButton>
              )}

              <VisibilityToggle isHidden={isHidden} onToggle={toggleVisibility} />
            </HStack>
          </HStack>
        </Flex>

        {/* Pay cycle periods banner */}
        {usePayCycle && periods.length > 0 && (
          <Box
            mb={6}
            p={4}
            borderRadius="2xl"
            bg={blueBandBg}
            border="1px solid"
            borderColor={blueBandBorder}
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={blueBandText}>
                Active Pay Cycle Periods
              </Text>
              <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">
                {userSettings?.pay_cycle_type || 'Custom'}
              </Badge>
            </Flex>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
              {periods.slice(0, 3).map((period, idx) => (
                <Flex key={idx} justify="space-between" align="center" p={2.5} borderRadius="xl" bg={panelBg} border="1px solid" borderColor={borderColor}>
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

        {/* Summary metrics */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={8}>
          <StatCard
            title="Total Income"
            value={currentMonth.total_income}
            icon={FiTrendingUp}
            colorScheme="green"
            valueColor={cardColors.green}
            subtitle={`${currentMonth.income_count || 0} transactions`}
            formatValue={displayCurrency}
          />
          <StatCard
            title="Total Expense"
            value={currentMonth.total_expense}
            icon={FiTrendingDown}
            colorScheme="red"
            valueColor={cardColors.red}
            subtitle={`${currentMonth.expense_count || 0} transactions`}
            formatValue={displayCurrency}
          />
          <StatCard
            title="Net Amount"
            value={currentMonth.net_amount}
            icon={FiDollarSign}
            colorScheme="blue"
            valueColor={(currentMonth.net_amount || 0) >= 0 ? cardColors.blue : cardColors.orange}
            subtitle="Active period net balance"
            formatValue={displayCurrency}
          />
          <StatCard
            title="Savings Rate"
            value={currentMonth.savings_rate}
            icon={FiPieChart}
            colorScheme="purple"
            valueColor={cardColors.purple}
            change={(currentMonth.savings_rate || 0) - (lastMonth.savings_rate || 0)}
            changeLabel="vs last month"
            formatValue={(v) => displayPercent(v)}
          />
        </SimpleGrid>

        {/* Category & Asset donuts */}
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={8}>
          <SectionCard title="Spending by Category" subtitle={rangeLabel} badge="Categories" badgeColor="blue">
            <CategoryDonutChart data={byCategory} emptyMessage="No category data available for this range" />
          </SectionCard>
          <SectionCard title="Spending by Asset Account" subtitle={rangeLabel} badge="Assets" badgeColor="green">
            <CategoryDonutChart data={assetChartData} emptyMessage="No asset account data available for this range" />
          </SectionCard>
        </Grid>

        {/* Spending by Tag */}
        <SectionCard title="Spending by Tag" subtitle="Tag-based expense classification and breakdown" badge="Tags" badgeColor="purple" mb={8}>
          {byTag.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {byTag.map((tag, idx) => (
                <Box key={idx} p={4} borderRadius="xl" bg={tagCardBg} border="1px solid" borderColor={borderColor}>
                  <Flex align="center" gap={3} mb={3}>
                    {tag.icon && <Text fontSize="xl">{tag.icon}</Text>}
                    <Box flex={1}>
                      <Text fontWeight="700" fontSize="sm">{tag.name}</Text>
                      <Text fontSize="xs" color={subtitleColor}>{tag.transaction_count} transactions</Text>
                    </Box>
                    <Box w="10px" h="10px" borderRadius="full" bg={tag.color || 'purple.500'} />
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
                    <Box w="100%" bg={tagBarBg} h="5px" borderRadius="full" overflow="hidden" mt={1}>
                      <Box bg={tag.color || 'purple.500'} h="100%" w={`${Math.min(tag.percentage, 100)}%`} borderRadius="full" />
                    </Box>
                    <Text fontSize="xs" color={subtitleColor} mt={0.5}>{displayPercent(tag.percentage)} of total spending</Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <Text color={subtitleColor} fontSize="sm" textAlign="center" py={6}>No tagged transactions recorded yet</Text>
          )}
        </SectionCard>

        {/* Budget overview */}
        {budgetSummary.total_budgets > 0 && (
          <SectionCard title="Budget Utilization" subtitle="Overall spending against set budget targets" badge="Budgets" badgeColor="orange" mb={8}>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4} mb={6}>
              <MiniStat title="Active Budgets" value={budgetSummary.active_budgets} colorScheme="blue" />
              <MiniStat title="Warning Threshold" value={budgetSummary.warning_budgets} colorScheme="orange" />
              <MiniStat title="Exceeded Limits" value={budgetSummary.exceeded_budgets} colorScheme="red" />
            </SimpleGrid>

            <Box>
              <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="sm" fontWeight="600">Overall Budget Utilization</Text>
                <Text fontSize="sm" fontWeight="800">{displayPercent(budgetSummary.average_utilization)}</Text>
              </Flex>
              <Box w="100%" bg={budgetBarBg} h="8px" borderRadius="full" overflow="hidden">
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
          </SectionCard>
        )}

        {/* Trend */}
        <SectionCard
          title={usePayCycle ? 'Pay Cycle Trend History' : 'Monthly Performance Trend'}
          subtitle={usePayCycle ? 'Income vs expense per pay cycle period' : 'Historical income and expense comparisons'}
          badge="History"
          badgeColor="blue"
          mb={8}
        >
          {monthly?.length > 0 ? (
            <MonthlyComparisonChart data={monthly} />
          ) : (
            <Text color={subtitleColor} fontSize="sm" textAlign="center" py={6}>No historical trend data available</Text>
          )}
        </SectionCard>

        {/* Top categories */}
        {dashboard?.top_categories?.length > 0 && (
          <SectionCard
            title={`Top Spending Categories (${usePayCycle ? 'This Period' : 'This Month'})`}
            subtitle={usePayCycle && dashboard.period_start ? `${formatDate(dashboard.period_start)} – ${formatDate(dashboard.period_end)}` : undefined}
            badge="Top Categories"
            badgeColor="blue"
          >
            <Stack gap={3}>
              {dashboard.top_categories.slice(0, 5).map((cat, idx) => (
                <Flex key={idx} justify="space-between" align="center" p={3.5} borderRadius="xl" bg={rankRowBg} border="1px solid" borderColor={borderColor}>
                  <Flex align="center" gap={3}>
                    <Badge size="md" variant="solid" colorPalette={idx === 0 ? 'amber' : idx === 1 ? 'gray' : 'blue'} borderRadius="lg" px={2.5} py={1} fontWeight="700">
                      #{idx + 1}
                    </Badge>
                    <Box>
                      <Text fontWeight="700" fontSize="sm">{cat.category_name}</Text>
                      <Text fontSize="xs" color={subtitleColor}>{cat.count} transactions</Text>
                    </Box>
                  </Flex>
                  <Box textAlign="right">
                    <Text fontWeight="800" fontSize="sm">{displayCurrency(cat.total_amount)}</Text>
                    <Text fontSize="xs" color={subtitleColor}>{displayPercent(cat.percentage)} of total</Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </SectionCard>
        )}

        {/* Mobile pay cycle sheet */}
        <BottomSheet isOpen={isBottomSheetOpen} onClose={() => setIsBottomSheetOpen(false)} title="Pay Cycle Settings">
          <VStack gap={6} align="stretch">
            <Box>
              <Text fontWeight="bold" mb={2}>Pay Cycle Type</Text>
              <Badge colorPalette="blue" size="md">{userSettings?.pay_cycle_type}</Badge>
            </Box>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">Use Pay Cycle for Analytics</Text>
                <Text fontSize="sm" color="gray.500">Apply your custom pay cycle to all analytics views</Text>
              </Box>
              <ChakraSwitch.Root checked={usePayCycle} onCheckedChange={handleTogglePayCycle} colorPalette="blue" size="lg">
                <ChakraSwitch.HiddenInput />
                <ChakraSwitch.Control>
                  <ChakraSwitch.Thumb />
                </ChakraSwitch.Control>
              </ChakraSwitch.Root>
            </Flex>
            {usePayCycle && periods.length > 0 && (
              <Box>
                <Text fontWeight="bold" mb={2}>Current Period</Text>
                <VStack gap={2} align="stretch" bg={softBg} p={4} borderRadius="md">
                  {periods.slice(0, 2).map((period, idx) => (
                    <Flex key={idx} justify="space-between" align="center">
                      <Text fontSize="sm">{formatDate(period.period_start)} – {formatDate(period.period_end)}</Text>
                      <Badge colorPalette={period.is_current ? 'green' : 'gray'} size="sm">
                        {period.is_current ? 'Current' : 'Previous'}
                      </Badge>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            )}
            <Button onClick={() => setIsBottomSheetOpen(false)} bg="blue.500" color="white" width="full">Close</Button>
            <Button as="a" href="/settings/pay-cycle" variant="outline" width="full">Configure Pay Cycle</Button>
          </VStack>
        </BottomSheet>

        {isMobile && userSettings && (
          <IconButton
            onClick={() => setIsBottomSheetOpen(true)}
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

function MiniStat({ title, value, colorScheme }) {
  return (
    <Box textAlign="center" p={4} borderRadius="xl" border="1px solid" borderColor={useColorModeValue(`${colorScheme}.100`, `${colorScheme}.900`)} bg={useColorModeValue(`${colorScheme}.50/50`, `${colorScheme}.950/40`)}>
      <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={useColorModeValue(`${colorScheme}.600`, `${colorScheme}.300`)}>{title}</Text>
      <Text fontSize="2xl" fontWeight="800" color={useColorModeValue(`${colorScheme}.700`, `${colorScheme}.200`)} mt={1}>{value}</Text>
    </Box>
  );
}

function FinancialsSkeleton({ pageBg }) {
  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        <Skeleton height="90px" borderRadius="2xl" mb={8} />
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5} mb={8}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="120px" borderRadius="2xl" />
          ))}
        </SimpleGrid>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={8}>
          <Skeleton height="380px" borderRadius="2xl" />
          <Skeleton height="380px" borderRadius="2xl" />
        </Grid>
        <Skeleton height="320px" borderRadius="2xl" />
      </Box>
    </Box>
  );
}
