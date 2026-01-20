import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Table,
  Text,
  Button,
  Flex,
  Stack,
  Badge,
  Card,
  Progress
} from "@chakra-ui/react";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";
import { useNavigate } from 'react-router-dom';

export default function Budget() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination, Search, Filter, Sort states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterIsActive, setFilterIsActive] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });

      if (filterCategoryId) params.append('category_id', filterCategoryId);
      if (filterPeriod) params.append('period', filterPeriod);
      if (filterIsActive) params.append('is_active', filterIsActive);
      if (sortBy) {
        params.append('sort_by', sortBy);
        params.append('sort_dir', sortDir);
      }

      const url = import.meta.env.VITE_API_URL + `budgets?${params.toString()}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));

      setBudgets(response.data.data.data || []);
      setTotalPages(response.data.data.total_pages || 1);
      setTotalItems(response.data.data.total_items || 0);
    } catch (error) {
      console.error(error);
      setError(error.message);
      toaster.create({
        description: "Failed to fetch budgets",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterCategoryId, filterPeriod, filterIsActive, sortBy, sortDir]);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, [fetchBudgets]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'categories';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      // Handle response: response.data.data is direct array
      const categoriesData = response.data.data || [];
      setCategories(categoriesData.map(cat => ({
        label: cat.CategoryName,
        value: String(cat.ID) // Convert to string for SelectComponent
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleEdit = (budget) => {
    navigate(`/budget/edit/${budget.id}`);
  };

  const handleAddNew = () => {
    navigate('/budget/new');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}budgets/${id}`, 
        Config({ Authorization: `Bearer ${token}` }));

      toaster.create({
        description: "Budget deleted successfully",
        type: "success",
      });
      fetchBudgets();
    } catch (error) {
      console.error(error);
      toaster.create({
        description: "Failed to delete budget",
        type: "error",
      });
    }
  };



  const handleClearFilters = () => {
    setFilterCategoryId('');
    setFilterPeriod('');
    setFilterIsActive('');
    setSortBy('');
    setSortDir('asc');
    setPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return 'green';
      case 'warning':
        return 'orange';
      case 'exceeded':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'red';
    if (percentage >= 80) return 'orange';
    return 'green';
  };



  return (
    <>
      <Box maxW="7xl" mx="auto" px={4} py={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading as="h3" size="lg" mb={2}>
              Budget Management
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Total: {totalItems} budgets
            </Text>
          </Box>
          <Button size="md" onClick={handleAddNew} bg={{ base: 'blue.500', _dark: 'blue.600' }} color="white" _hover={{ bg: { base: 'blue.600', _dark: 'blue.700' } }}>
            + Create Budget
          </Button>
        </Flex>

        {/* Filters Card */}
        <Card.Root mb={6} p={4}>
          <Stack gap={4}>
            <Flex gap={3} wrap="wrap" align="center">
              <select
                value={filterCategoryId}
                onChange={(e) => {
                  setFilterCategoryId(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  minWidth: '200px'
                }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>

              <select
                value={filterPeriod}
                onChange={(e) => {
                  setFilterPeriod(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  minWidth: '150px'
                }}
              >
                <option value="">All Periods</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              <select
                value={filterIsActive}
                onChange={(e) => {
                  setFilterIsActive(e.target.value);
                  setPage(1);
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  fontSize: '14px',
                  minWidth: '150px'
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>

              <Box flex={1} />

              <Flex gap={2} align="center">
                <Text fontSize="sm" color="gray.600">Items per page:</Text>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </Flex>
            </Flex>

            {/* Active Filters */}
            {(filterCategoryId || filterPeriod || filterIsActive || sortBy) && (
              <Flex gap={2} flexWrap="wrap">
                <Text fontSize="sm" fontWeight="medium">Active filters:</Text>
                {filterCategoryId && (
                  <Badge colorScheme="blue">
                    Category: {categories.find(c => c.value == filterCategoryId)?.label}
                  </Badge>
                )}
                {filterPeriod && (
                  <Badge colorScheme="green">Period: {filterPeriod}</Badge>
                )}
                {filterIsActive && (
                  <Badge colorScheme="purple">
                    {filterIsActive === 'true' ? 'Active' : 'Inactive'}
                  </Badge>
                )}
                {sortBy && (
                  <Badge colorScheme="orange">Sort: {sortBy} ({sortDir})</Badge>
                )}
              </Flex>
            )}
          </Stack>
        </Card.Root>

        {loading && (
          <Flex justify="center" align="center" py={12}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        )}

        {error && (
          <Text color="red.500" textAlign="center">
            Error: {error}
          </Text>
        )}

        {!loading && budgets.length > 0 ? (
          <>
            <Card.Root mb={4}>
              <Table.Root>
                <Table.Header>
                  <Table.Row bg={{ base: "gray.50", _dark: "transparent" }}>
                    <Table.ColumnHeader>Category</Table.ColumnHeader>
                    <Table.ColumnHeader>Period</Table.ColumnHeader>
                    <Table.ColumnHeader>Budget Amount</Table.ColumnHeader>
                    <Table.ColumnHeader>Spent</Table.ColumnHeader>
                    <Table.ColumnHeader>Progress</Table.ColumnHeader>
                    <Table.ColumnHeader>Status</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {budgets.map((budget) => (
                    <Table.Row key={budget.id} _hover={{ bg: { base: "gray.50", _dark: "whiteAlpha.100" } }}>
                      <Table.Cell fontWeight="medium">{budget.category_name}</Table.Cell>
                      <Table.Cell>
                        <Badge colorScheme="gray" textTransform="capitalize">
                          {budget.period}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        Rp {budget.amount?.toLocaleString('id-ID')}
                      </Table.Cell>
                      <Table.Cell>
                        Rp {budget.spent_amount?.toLocaleString('id-ID') || '0'}
                      </Table.Cell>
                      <Table.Cell>
                        <Box w="150px">
                          <Progress.Root 
                            value={budget.percentage_used || 0} 
                            size="sm"
                            colorScheme={getProgressColor(budget.percentage_used || 0)}
                          >
                            <Progress.Track>
                              <Progress.Range />
                            </Progress.Track>
                          </Progress.Root>
                          <Text fontSize="xs" color="gray.600" mt={1}>
                            {(budget.percentage_used || 0).toFixed(1)}%
                          </Text>
                        </Box>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorScheme={getStatusColor(budget.status)} textTransform="capitalize">
                          {budget.status || 'Unknown'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <Button
                          variant="ghost"
                          colorScheme="blue"
                          size="sm"
                          mr={2}
                          onClick={() => handleEdit(budget)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          colorScheme="red"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                        >
                          Delete
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Root>

            {/* Pagination */}
            <Flex justify="space-between" align="center" mt={4}>
              <Text fontSize="sm" color="gray.600">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} entries
              </Text>
              <Flex gap={2}>
                <Button
                  size="sm"
                  onClick={() => setPage(1)}
                  isDisabled={page === 1}
                  variant="outline"
                >
                  First
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  isDisabled={page === 1}
                  variant="outline"
                >
                  Previous
                </Button>
                <Flex gap={1}>
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (page <= 3) {
                      pageNum = idx + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = page - 2 + idx;
                    }
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        colorScheme={page === pageNum ? 'blue' : 'gray'}
                        variant={page === pageNum ? 'solid' : 'outline'}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </Flex>
                <Button
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  isDisabled={page === totalPages}
                  variant="outline"
                >
                  Next
                </Button>
                <Button
                  size="sm"
                  onClick={() => setPage(totalPages)}
                  isDisabled={page === totalPages}
                  variant="outline"
                >
                  Last
                </Button>
              </Flex>
            </Flex>
          </>
        ) : !loading && (
          <Card.Root p={12}>
            <Text textAlign="center" fontSize="lg" color="gray.500">
              No budgets found. Create your first budget to start tracking!
            </Text>
          </Card.Root>
        )}
      </Box>
    </>
  );
}
