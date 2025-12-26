import React, { useState, useEffect } from 'react';
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
  Button
} from "@chakra-ui/react";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";

export default function Financials() {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [spendingByCategory, setSpendingByCategory] = useState([]);
  const [spendingByBank, setSpendingByBank] = useState([]);
  const [monthlyComparison, setMonthlyComparison] = useState([]);
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      await Promise.all([
        fetchDashboard(token),
        fetchSpendingByCategory(token),
        fetchSpendingByBank(token),
        fetchMonthlyComparison(token)
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
  };

  const fetchDashboard = async (token) => {
    try {
      const url = import.meta.env.VITE_API_URL + 'analytics/dashboard';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchSpendingByCategory = async (token) => {
    try {
      const params = new URLSearchParams(dateRange);
      const url = import.meta.env.VITE_API_URL + `analytics/spending-by-category?${params}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setSpendingByCategory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching spending by category:', error);
    }
  };

  const fetchSpendingByBank = async (token) => {
    try {
      const params = new URLSearchParams(dateRange);
      const url = import.meta.env.VITE_API_URL + `analytics/spending-by-bank?${params}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setSpendingByBank(response.data.data || []);
    } catch (error) {
      console.error('Error fetching spending by bank:', error);
    }
  };

  const fetchMonthlyComparison = async (token) => {
    try {
      const url = import.meta.env.VITE_API_URL + 'analytics/monthly-comparison?months=6';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setMonthlyComparison(response.data.data || []);
    } catch (error) {
      console.error('Error fetching monthly comparison:', error);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyDateFilter = () => {
    const token = localStorage.getItem('token');
    fetchSpendingByCategory(token);
    fetchSpendingByBank(token);
  };

  const formatCurrency = (amount) => {
    return `Rp ${(amount || 0).toLocaleString('id-ID')}`;
  };

  const formatMonth = (monthStr) => {
    const date = new Date(monthStr + '-01');
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  const currentMonth = dashboardData?.current_month || {};
  const lastMonth = dashboardData?.last_month || {};
  const budgetSummary = dashboardData?.budget_summary || {};

  return (
    <Box maxW="7xl" mx="auto" px={4} py={8}>
      <Heading as="h3" size="lg" mb={6}>
        Financial Analytics
      </Heading>

      {/* Date Range Filter */}
      <Card.Root mb={6} p={4}>
        <Flex gap={3} align="end" wrap="wrap">
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Start Date</Text>
            <Input
              type="date"
              name="start_date"
              value={dateRange.start_date}
              onChange={handleDateChange}
            />
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>End Date</Text>
            <Input
              type="date"
              name="end_date"
              value={dateRange.end_date}
              onChange={handleDateChange}
            />
          </Box>
          <Button colorScheme="blue" onClick={applyDateFilter}>
            Apply Filter
          </Button>
        </Flex>
      </Card.Root>

      {/* Summary Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={4} mb={6}>
        <Card.Root bg="green.50" borderLeft="4px solid" borderColor="green.500">
          <Card.Body>
            <Text fontSize="sm" color="gray.600" mb={1}>Total Income</Text>
            <Text fontSize="2xl" fontWeight="bold" color="green.600">
              {formatCurrency(currentMonth.total_income)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {currentMonth.income_count} transactions
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="red.50" borderLeft="4px solid" borderColor="red.500">
          <Card.Body>
            <Text fontSize="sm" color="gray.600" mb={1}>Total Expense</Text>
            <Text fontSize="2xl" fontWeight="bold" color="red.600">
              {formatCurrency(currentMonth.total_expense)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {currentMonth.expense_count} transactions
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="blue.50" borderLeft="4px solid" borderColor="blue.500">
          <Card.Body>
            <Text fontSize="sm" color="gray.600" mb={1}>Net Amount</Text>
            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
              {formatCurrency(currentMonth.net_amount)}
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              This month
            </Text>
          </Card.Body>
        </Card.Root>

        <Card.Root bg="purple.50" borderLeft="4px solid" borderColor="purple.500">
          <Card.Body>
            <Text fontSize="sm" color="gray.600" mb={1}>Savings Rate</Text>
            <Text fontSize="2xl" fontWeight="bold" color="purple.600">
              {(currentMonth.savings_rate || 0).toFixed(1)}%
            </Text>
            <Text fontSize="xs" color="gray.500" mt={1}>
              {currentMonth.savings_rate > lastMonth.savings_rate ? '↑' : '↓'} vs last month
            </Text>
          </Card.Body>
        </Card.Root>
      </SimpleGrid>

      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={6}>
        {/* Spending by Category */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Spending by Category</Heading>
            <Text fontSize="sm" color="gray.500">
              {dateRange.start_date} to {dateRange.end_date}
            </Text>
          </Card.Header>
          <Card.Body>
            {spendingByCategory.length > 0 ? (
              <Stack gap={3}>
                {spendingByCategory.slice(0, 8).map((cat, idx) => (
                  <Box key={idx}>
                    <Flex justify="space-between" mb={2}>
                      <Flex align="center" gap={2}>
                        <Text fontWeight="medium">{cat.category_name}</Text>
                        <Badge size="sm">{cat.count}</Badge>
                      </Flex>
                      <Text fontWeight="bold">{formatCurrency(cat.total_amount)}</Text>
                    </Flex>
                    <Box w="100%" bg="gray.200" h="8px" borderRadius="full" overflow="hidden">
                      <Box
                        bg="blue.500"
                        h="100%"
                        w={`${cat.percentage}%`}
                        transition="width 0.3s"
                      />
                    </Box>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {cat.percentage?.toFixed(1)}% of total spending
                    </Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text color="gray.500" textAlign="center">No data available</Text>
            )}
          </Card.Body>
        </Card.Root>

        {/* Spending by Bank */}
        <Card.Root>
          <Card.Header>
            <Heading size="md">Spending by Bank</Heading>
            <Text fontSize="sm" color="gray.500">
              {dateRange.start_date} to {dateRange.end_date}
            </Text>
          </Card.Header>
          <Card.Body>
            {spendingByBank.length > 0 ? (
              <Stack gap={3}>
                {spendingByBank.map((bank, idx) => (
                  <Box key={idx}>
                    <Flex justify="space-between" mb={2}>
                      <Flex align="center" gap={2}>
                        <Text fontWeight="medium">{bank.bank_name}</Text>
                        <Badge size="sm">{bank.count}</Badge>
                      </Flex>
                      <Text fontWeight="bold">{formatCurrency(bank.total_amount)}</Text>
                    </Flex>
                    <Box w="100%" bg="gray.200" h="8px" borderRadius="full" overflow="hidden">
                      <Box
                        bg="green.500"
                        h="100%"
                        w={`${bank.percentage}%`}
                        transition="width 0.3s"
                      />
                    </Box>
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {bank.percentage?.toFixed(1)}% of total spending
                    </Text>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Text color="gray.500" textAlign="center">No data available</Text>
            )}
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Budget Summary */}
      {budgetSummary.total_budgets > 0 && (
        <Card.Root mb={6}>
          <Card.Header>
            <Heading size="md">Budget Overview</Heading>
          </Card.Header>
          <Card.Body>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
              <Box textAlign="center" p={4} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">Active Budgets</Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                  {budgetSummary.active_budgets}
                </Text>
              </Box>
              <Box textAlign="center" p={4} bg="orange.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">Warning</Text>
                <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                  {budgetSummary.warning_budgets}
                </Text>
              </Box>
              <Box textAlign="center" p={4} bg="red.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">Exceeded</Text>
                <Text fontSize="3xl" fontWeight="bold" color="red.600">
                  {budgetSummary.exceeded_budgets}
                </Text>
              </Box>
            </SimpleGrid>
            <Box mt={4}>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="medium">Overall Budget Utilization</Text>
                <Text fontWeight="bold">{budgetSummary.average_utilization?.toFixed(1)}%</Text>
              </Flex>
              <Box w="100%" bg="gray.200" h="12px" borderRadius="full" overflow="hidden">
                <Box
                  bg={budgetSummary.average_utilization > 90 ? 'red.500' : budgetSummary.average_utilization > 80 ? 'orange.500' : 'green.500'}
                  h="100%"
                  w={`${Math.min(budgetSummary.average_utilization, 100)}%`}
                  transition="width 0.3s"
                />
              </Box>
              <Flex justify="space-between" mt={2} fontSize="sm" color="gray.600">
                <Text>Spent: {formatCurrency(budgetSummary.total_spent)}</Text>
                <Text>Budgeted: {formatCurrency(budgetSummary.total_budgeted)}</Text>
              </Flex>
            </Box>
          </Card.Body>
        </Card.Root>
      )}

      {/* Monthly Comparison */}
      <Card.Root>
        <Card.Header>
          <Heading size="md">6-Month Trend</Heading>
          <Text fontSize="sm" color="gray.500">
            Income vs Expense comparison
          </Text>
        </Card.Header>
        <Card.Body>
          {monthlyComparison.length > 0 ? (
            <Stack gap={4}>
              {monthlyComparison.map((month, idx) => (
                <Box key={idx} p={3} bg="gray.50" borderRadius="md">
                  <Flex justify="space-between" mb={3}>
                    <Text fontWeight="bold" fontSize="lg">{formatMonth(month.month)}</Text>
                    <Badge colorScheme={month.net >= 0 ? 'green' : 'red'}>
                      {formatCurrency(month.net)}
                    </Badge>
                  </Flex>
                  <Grid templateColumns="1fr 1fr" gap={3}>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Income</Text>
                      <Text fontWeight="bold" color="green.600">
                        {formatCurrency(month.income)}
                      </Text>
                      {month.income_change !== 0 && (
                        <Text fontSize="xs" color={month.income_change > 0 ? 'green.500' : 'red.500'}>
                          {month.income_change > 0 ? '↑' : '↓'} {Math.abs(month.income_change).toFixed(1)}%
                        </Text>
                      )}
                    </Box>
                    <Box>
                      <Text fontSize="sm" color="gray.600">Expense</Text>
                      <Text fontWeight="bold" color="red.600">
                        {formatCurrency(month.expense)}
                      </Text>
                      {month.expense_change !== 0 && (
                        <Text fontSize="xs" color={month.expense_change > 0 ? 'red.500' : 'green.500'}>
                          {month.expense_change > 0 ? '↑' : '↓'} {Math.abs(month.expense_change).toFixed(1)}%
                        </Text>
                      )}
                    </Box>
                  </Grid>
                </Box>
              ))}
            </Stack>
          ) : (
            <Text color="gray.500" textAlign="center">No data available</Text>
          )}
        </Card.Body>
      </Card.Root>

      {/* Top Categories */}
      {dashboardData?.top_categories && dashboardData.top_categories.length > 0 && (
        <Card.Root mt={6}>
          <Card.Header>
            <Heading size="md">Top Spending Categories (This Month)</Heading>
          </Card.Header>
          <Card.Body>
            <Stack gap={3}>
              {dashboardData.top_categories.slice(0, 5).map((cat, idx) => (
                <Flex key={idx} justify="space-between" align="center" p={3} bg="gray.50" borderRadius="md">
                  <Flex align="center" gap={3}>
                    <Box
                      w="40px"
                      h="40px"
                      bg={`hsl(${idx * 60}, 70%, 60%)`}
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      color="white"
                    >
                      {idx + 1}
                    </Box>
                    <Box>
                      <Text fontWeight="medium">{cat.category_name}</Text>
                      <Text fontSize="sm" color="gray.600">{cat.count} transactions</Text>
                    </Box>
                  </Flex>
                  <Box textAlign="right">
                    <Text fontWeight="bold">{formatCurrency(cat.total_amount)}</Text>
                    <Text fontSize="sm" color="gray.600">{cat.percentage?.toFixed(1)}%</Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </Card.Body>
        </Card.Root>
      )}
    </Box>
  );
}
