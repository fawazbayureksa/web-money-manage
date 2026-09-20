import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  Flex,
  Badge,
  Grid,
  HStack,
  VStack,
  SimpleGrid,
  IconButton,
  Spacer
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWallet,
  FaPlus,
  FaFilter,
  FaXmark,
  FaPencil,
  FaTrash,
  FaChartPie,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaChevronLeft,
  FaChevronRight,
  FaLayerGroup
} from "react-icons/fa6";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";
import { useNavigate } from 'react-router-dom';
import { useColorModeValue } from '../../components/ui/color-mode';

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const cardVariants = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getProgressColor = (pct) => {
  if (pct >= 100) return 'red.500';
  if (pct >= 80)  return 'orange.500';
  if (pct >= 60)  return 'yellow.500';
  return 'green.500';
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'safe':     return { palette: 'green',  label: 'Safe' };
    case 'warning':  return { palette: 'orange', label: 'Warning' };
    case 'exceeded': return { palette: 'red',    label: 'Exceeded' };
    default:         return { palette: 'gray',   label: status || 'Unknown' };
  }
};

const formatIDR = (val) =>
  val != null ? `Rp ${Number(val).toLocaleString('id-ID')}` : 'Rp 0';

// ─── Budget Card Component ────────────────────────────────────────────────────
function BudgetCard({ budget, onEdit, onDelete }) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  const pct = budget.percentage_used || 0;
  const statusCfg = getStatusBadge(budget.status);
  const remaining = (budget.amount || 0) - (budget.spent_amount || 0);

  return (
    <MotionBox variants={cardVariants}>
      <Box
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={borderColor}
        shadow="xs"
        overflow="hidden"
        position="relative"
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{ shadow: 'sm', transform: 'translateY(-2px)' }}
      >
        {/* Top Accent Strip */}
        <Box
          h="6px"
          bg={pct >= 100 ? 'red.500' : pct >= 80 ? 'orange.500' : pct >= 60 ? 'yellow.500' : 'green.500'}
        />

        <Box p={5}>
          {/* Category & Status Header */}
          <Flex justify="space-between" align="flex-start" mb={3}>
            <Box flex={1} mr={2}>
              <Heading as="h3" size="sm" fontWeight="700" letterSpacing="tight" mb={1.5}>
                {budget.category_name || 'Uncategorized'}
              </Heading>
              <HStack gap={2} flexWrap="wrap">
                <Badge colorPalette="blue" variant="subtle" size="xs" borderRadius="full" fontWeight="600">
                  {budget.period}
                </Badge>
                <Badge colorPalette={budget.asset_name ? 'cyan' : 'gray'} variant="subtle" size="xs" borderRadius="full" fontWeight="600">
                  {budget.asset_name || 'All Assets'}
                </Badge>
              </HStack>
            </Box>

            <Badge colorPalette={statusCfg.palette} variant="subtle" size="xs" borderRadius="full" px={2.5} py={0.5} fontWeight="700">
              {statusCfg.label}
            </Badge>
          </Flex>

          {/* Usage Progress Bar */}
          <Box mb={4}>
            <Flex justify="space-between" align="center" mb={1.5}>
              <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                Budget Usage
              </Text>
              <Text fontSize="xs" fontWeight="700" color={pct >= 100 ? 'red.500' : pct >= 80 ? 'orange.500' : 'green.500'}>
                {pct.toFixed(1)}%
              </Text>
            </Flex>
            <Box h="6px" borderRadius="full" bg={useColorModeValue('gray.100', 'gray.700')} overflow="hidden">
              <Box
                h="100%"
                borderRadius="full"
                w={`${Math.min(pct, 100)}%`}
                bg={pct >= 100 ? 'red.500' : pct >= 80 ? 'orange.500' : pct >= 60 ? 'yellow.500' : 'green.500'}
                transition="width 0.4s ease-out"
              />
            </Box>
          </Box>

          {/* 3-Column Amount Breakdown */}
          <Grid templateColumns="repeat(3, 1fr)" gap={2.5} mb={4}>
            <Box p={2.5} borderRadius="xl" bg={useColorModeValue('gray.50/80', 'gray.900/60')} border="1px solid" borderColor={borderColor} textAlign="center">
              <Text fontSize="xs" color={subtitleColor} mb={0.5}>Budget</Text>
              <Text fontSize="xs" fontWeight="700" noOfLines={1}>{formatIDR(budget.amount)}</Text>
            </Box>
            <Box p={2.5} borderRadius="xl" bg={useColorModeValue('orange.50/50', 'orange.950/40')} border="1px solid" borderColor={useColorModeValue('orange.100', 'orange.900')} textAlign="center">
              <Text fontSize="xs" color={useColorModeValue('orange.600', 'orange.300')} mb={0.5}>Spent</Text>
              <Text fontSize="xs" fontWeight="700" color={useColorModeValue('orange.700', 'orange.200')} noOfLines={1}>{formatIDR(budget.spent_amount)}</Text>
            </Box>
            <Box p={2.5} borderRadius="xl" bg={useColorModeValue(remaining >= 0 ? 'green.50/50' : 'red.50/50', remaining >= 0 ? 'green.950/40' : 'red.950/40')} border="1px solid" borderColor={useColorModeValue(remaining >= 0 ? 'green.100' : 'red.100', remaining >= 0 ? 'green.900' : 'red.900')} textAlign="center">
              <Text fontSize="xs" color={useColorModeValue(remaining >= 0 ? 'green.600' : 'red.600', remaining >= 0 ? 'green.300' : 'red.300')} mb={0.5}>
                {remaining >= 0 ? 'Left' : 'Over'}
              </Text>
              <Text fontSize="xs" fontWeight="700" color={useColorModeValue(remaining >= 0 ? 'green.700' : 'red.700', remaining >= 0 ? 'green.200' : 'red.200')} noOfLines={1}>
                {formatIDR(Math.abs(remaining))}
              </Text>
            </Box>
          </Grid>

          {/* Action Buttons */}
          <Flex gap={2} justify="flex-end" pt={3} borderTop="1px solid" borderColor={borderColor}>
            <Button
              size="xs"
              variant="ghost"
              borderRadius="lg"
              onClick={() => onEdit(budget)}
            >
              <FaPencil style={{ marginRight: '4px' }} size={11} />
              Edit
            </Button>
            <Button
              size="xs"
              variant="ghost"
              bg="blue.500" color="white"
              borderRadius="lg"
              onClick={() => onDelete(budget.id)}
            >
              <FaTrash style={{ marginRight: '4px' }} size={11} />
              Delete
            </Button>
          </Flex>
        </Box>
      </Box>
    </MotionBox>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Budget() {
  const navigate = useNavigate();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination, Filter, Sort
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterAssetId, setFilterAssetId] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterIsActive, setFilterIsActive] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const params = new URLSearchParams({ page: page.toString(), page_size: pageSize.toString() });
      if (filterCategoryId) params.append('category_id', filterCategoryId);
      if (filterAssetId)    params.append('asset_id', filterAssetId);
      if (filterPeriod)     params.append('period', filterPeriod);
      if (filterIsActive)   params.append('is_active', filterIsActive);
      if (sortBy) { params.append('sort_by', sortBy); params.append('sort_dir', sortDir); }

      const url = import.meta.env.VITE_API_URL + `budgets?${params.toString()}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setBudgets(response.data.data.data || []);
      setTotalPages(response.data.data.total_pages || 1);
      setTotalItems(response.data.data.total_items || 0);
    } catch (err) {
      console.error(err);
      setError(err.message);
      toaster.create({ description: "Failed to fetch budgets", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, filterCategoryId, filterAssetId, filterPeriod, filterIsActive, sortBy, sortDir]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'categories';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setCategories((response.data.data || []).map(c => ({ label: c.CategoryName, value: String(c.ID) })));
    } catch (e) { console.error(e); }
  };

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'wallets';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      setAssets((response.data.data || []).map(a => ({ label: a.name, value: String(a.id) })));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
    fetchAssets();
  }, [fetchBudgets]);

  const handleEdit   = (budget) => navigate(`/budget/edit/${budget.id}`);
  const handleAddNew = () => navigate('/budget/new');
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}budgets/${id}`, Config({ Authorization: `Bearer ${token}` }));
      toaster.create({ description: "Budget deleted successfully", type: "success" });
      fetchBudgets();
    } catch (e) {
      console.error(e);
      toaster.create({ description: "Failed to delete budget", type: "error" });
    }
  };

  const handleClearFilters = () => {
    setFilterCategoryId(''); setFilterAssetId(''); setFilterPeriod('');
    setFilterIsActive(''); setSortBy(''); setSortDir('asc'); setPage(1);
  };

  const hasFilters = filterCategoryId || filterAssetId || filterPeriod || filterIsActive || sortBy;

  // Derived stats
  const stats = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + (b.amount || 0), 0);
    const totalSpent  = budgets.reduce((s, b) => s + (b.spent_amount || 0), 0);
    const exceeded    = budgets.filter(b => (b.percentage_used || 0) >= 100).length;
    return { totalBudget, totalSpent, exceeded };
  }, [budgets]);

  // Pagination helpers
  const pageNums = useMemo(() => {
    const total = Math.min(5, totalPages);
    return [...Array(total)].map((_, i) => {
      if (totalPages <= 5) return i + 1;
      if (page <= 3) return i + 1;
      if (page >= totalPages - 2) return totalPages - 4 + i;
      return page - 2 + i;
    });
  }, [page, totalPages]);

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
                Budget Infrastructure
              </Text>
            </Flex>
            <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
              Budget Management
            </Heading>
            <Text color={subtitleColor} fontSize="md">
              Set, track, and control spending limits across categories and accounts.
            </Text>
          </Box>

          <Button
            onClick={handleAddNew}
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            size="md"
            borderRadius="xl"
            px={5}
            fontWeight="600"
            boxShadow="xs"
          >
            <FaPlus style={{ marginRight: '6px' }} />
            Create Budget
          </Button>
        </Flex>

        {/* Summary Stat Cards Grid */}
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} mb={8}>
          <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                Total Budget
              </Text>
              <Flex w={9} h={9} align="center" justify="center" borderRadius="xl" bg={useColorModeValue('blue.50', 'blue.950/50')}>
                <FaChartPie color="var(--chakra-colors-blue-500)" size={16} />
              </Flex>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
              {formatIDR(stats.totalBudget)}
            </Text>
            <Text fontSize="xs" color={subtitleColor} mt={1}>
              Allocated across active budgets
            </Text>
          </Box>

          <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                Total Spent
              </Text>
              <Flex w={9} h={9} align="center" justify="center" borderRadius="xl" bg={useColorModeValue('orange.50', 'orange.950/50')}>
                <FaArrowTrendDown color="var(--chakra-colors-orange-500)" size={16} />
              </Flex>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={useColorModeValue('orange.600', 'orange.300')}>
              {formatIDR(stats.totalSpent)}
            </Text>
            <Text fontSize="xs" color={subtitleColor} mt={1}>
              Total current expenditure
            </Text>
          </Box>

          <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                Exceeded Limits
              </Text>
              <Flex w={9} h={9} align="center" justify="center" borderRadius="xl" bg={useColorModeValue('red.50', 'red.950/50')}>
                <FaArrowTrendUp color="var(--chakra-colors-red-500)" size={16} />
              </Flex>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={useColorModeValue(stats.exceeded > 0 ? 'red.600' : 'green.600', stats.exceeded > 0 ? 'red.300' : 'green.300')}>
              {stats.exceeded} {stats.exceeded === 1 ? 'budget' : 'budgets'}
            </Text>
            <Text fontSize="xs" color={subtitleColor} mt={1}>
              {stats.exceeded > 0 ? 'Requires limit review' : 'All budgets within limit'}
            </Text>
          </Box>
        </SimpleGrid>

        {/* Filter Toolbar */}
        <Box
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          p={5}
          shadow="xs"
          mb={8}
        >
          <Flex gap={3} wrap="wrap" align="center">
            <HStack gap={2} color={subtitleColor}>
              <FaFilter size={13} />
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider">Filters:</Text>
            </HStack>

            {/* Category Filter */}
            <Box bg={useColorModeValue('gray.50', 'gray.900')} px={3} py={1.5} borderRadius="xl" border="1px solid" borderColor={borderColor}>
              <select
                value={filterCategoryId}
                onChange={(e) => { setFilterCategoryId(e.target.value); setPage(1); }}
                style={{ background: 'transparent', border: 'none', fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </Box>

            {/* Period Filter */}
            <Box bg={useColorModeValue('gray.50', 'gray.900')} px={3} py={1.5} borderRadius="xl" border="1px solid" borderColor={borderColor}>
              <select
                value={filterPeriod}
                onChange={(e) => { setFilterPeriod(e.target.value); setPage(1); }}
                style={{ background: 'transparent', border: 'none', fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">All Periods</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </Box>

            {/* Asset Filter */}
            <Box bg={useColorModeValue('gray.50', 'gray.900')} px={3} py={1.5} borderRadius="xl" border="1px solid" borderColor={borderColor}>
              <select
                value={filterAssetId}
                onChange={(e) => { setFilterAssetId(e.target.value); setPage(1); }}
                style={{ background: 'transparent', border: 'none', fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">All Assets</option>
                {assets.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </Box>

            {/* Status Filter */}
            <Box bg={useColorModeValue('gray.50', 'gray.900')} px={3} py={1.5} borderRadius="xl" border="1px solid" borderColor={borderColor}>
              <select
                value={filterIsActive}
                onChange={(e) => { setFilterIsActive(e.target.value); setPage(1); }}
                style={{ background: 'transparent', border: 'none', fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </Box>

            {hasFilters && (
              <Button size="sm" variant="ghost" bg="blue.500" color="white" borderRadius="xl" onClick={handleClearFilters}>
                <FaXmark style={{ marginRight: '4px' }} size={12} />
                Clear
              </Button>
            )}

            <Spacer />

            <HStack gap={2}>
              <Text fontSize="xs" fontWeight="600" color={subtitleColor}>Show</Text>
              <Box bg={useColorModeValue('gray.50', 'gray.900')} px={2} py={1} borderRadius="lg" border="1px solid" borderColor={borderColor}>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  style={{ background: 'transparent', border: 'none', fontSize: '13px', fontWeight: '600', outline: 'none', cursor: 'pointer' }}
                >
                  {[6, 12, 24, 48].map(n => <option key={n} value={n}>{n} per page</option>)}
                </select>
              </Box>
            </HStack>
          </Flex>

          {/* Active Filter Badges */}
          {hasFilters && (
            <Flex gap={2} flexWrap="wrap" mt={3} pt={3} borderTop="1px solid" borderColor={borderColor}>
              <Text fontSize="xs" fontWeight="700" color={subtitleColor}>Active filters:</Text>
              {filterCategoryId && (
                <Badge colorPalette="purple" variant="subtle" size="sm" borderRadius="full">
                  Category: {categories.find(c => c.value == filterCategoryId)?.label}
                </Badge>
              )}
              {filterAssetId && (
                <Badge colorPalette="cyan" variant="subtle" size="sm" borderRadius="full">
                  Asset: {assets.find(a => a.value == filterAssetId)?.label}
                </Badge>
              )}
              {filterPeriod && (
                <Badge colorPalette="green" variant="subtle" size="sm" borderRadius="full">
                  Period: {filterPeriod}
                </Badge>
              )}
              {filterIsActive && (
                <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">
                  {filterIsActive === 'true' ? 'Active' : 'Inactive'}
                </Badge>
              )}
            </Flex>
          )}
        </Box>

        {/* Loading State */}
        {loading && (
          <Flex justify="center" align="center" py={16}>
            <VStack gap={3}>
              <Spinner size="xl" color="blue.500" />
              <Text color={subtitleColor} fontSize="sm">Loading budgets...</Text>
            </VStack>
          </Flex>
        )}

        {/* Error Alert */}
        {error && !loading && (
          <Box p={4} borderRadius="2xl" bg="red.50" border="1px solid" borderColor="red.200" mb={6}>
            <Text color="red.600" fontSize="sm" textAlign="center">
              Error fetching budgets: {error}
            </Text>
          </Box>
        )}

        {/* Budget Cards Grid */}
        {!loading && budgets.length > 0 ? (
          <>
            <MotionGrid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
              gap={6}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              mb={8}
            >
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </MotionGrid>

            {/* Pagination Controls */}
            <Box
              bg={cardBg}
              borderRadius="2xl"
              border="1px solid"
              borderColor={borderColor}
              p={4}
              shadow="xs"
            >
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Text fontSize="xs" color={subtitleColor}>
                  Showing <Text as="span" fontWeight="700">{((page - 1) * pageSize) + 1}</Text> to <Text as="span" fontWeight="700">{Math.min(page * pageSize, totalItems)}</Text> of <Text as="span" fontWeight="700">{totalItems}</Text> budgets
                </Text>

                <HStack gap={1.5}>
                  <Button
                    size="xs"
                    onClick={() => setPage(1)}
                    isDisabled={page === 1}
                    variant="outline"
                    borderRadius="lg"
                  >
                    First
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => setPage(p => p - 1)}
                    isDisabled={page === 1}
                    variant="outline"
                    borderRadius="lg"
                  >
                    <FaChevronLeft size={10} />
                  </Button>

                  {pageNums.map(n => (
                    <Button
                      key={n}
                      size="xs"
                      w="7"
                      h="7"
                      bg="blue.500"
                      onClick={() => setPage(n)}
                      color="white"
                      variant={page === n ? 'solid' : 'ghost'}
                      borderRadius="lg"
                      fontWeight={page === n ? '700' : '500'}
                    >
                      {n}
                    </Button>
                  ))}

                  <Button
                    size="xs"
                    onClick={() => setPage(p => p + 1)}
                    isDisabled={page === totalPages}
                    variant="outline"
                    borderRadius="lg"
                  >
                    <FaChevronRight size={10} />
                  </Button>
                  <Button
                    size="xs"
                    onClick={() => setPage(totalPages)}
                    isDisabled={page === totalPages}
                    variant="outline"
                    borderRadius="lg"
                  >
                    Last
                  </Button>
                </HStack>
              </Flex>
            </Box>
          </>
        ) : !loading && (
          /* Empty State */
          <Box
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            p={12}
            textAlign="center"
            shadow="xs"
          >
            <VStack gap={3}>
              <Flex w={12} h={12} align="center" justify="center" borderRadius="2xl" bg={useColorModeValue('blue.50', 'blue.950/50')}>
                <FaLayerGroup size={24} color="var(--chakra-colors-blue-500)" />
              </Flex>
              <Heading size="sm" fontWeight="700">
                {hasFilters ? 'No Matching Budgets' : 'No Budgets Created Yet'}
              </Heading>
              <Text fontSize="xs" color={subtitleColor} maxW="sm">
                {hasFilters
                  ? 'Try clearing or adjusting your filter criteria to see more budget entries.'
                  : 'Start controlling your finances by setting your first spending limit.'}
              </Text>
              <HStack gap={3} mt={2}>
                {hasFilters && (
                  <Button variant="outline" size="sm" borderRadius="xl" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
                <Button
                  onClick={handleAddNew}
                  bg="blue.500"
                  color="white"
                  _hover={{ bg: "blue.600" }}
                  size="sm"
                  borderRadius="xl"
                  fontWeight="600"
                >
                  <FaPlus style={{ marginRight: '6px' }} />
                  Create Budget
                </Button>
              </HStack>
            </VStack>
          </Box>
        )}
      </Box>
    </Box>
  );
}
