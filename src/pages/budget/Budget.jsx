import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  Flex,
  Badge,
  Card,
  Grid,
  HStack,
  VStack,
  Circle,
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
  FaLayerGroup,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";
import { useNavigate } from 'react-router-dom';

const MotionBox = motion(Box);
const MotionGrid = motion(Grid);

// ─── Animation Variants ──────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardVariants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 260, damping: 20 } },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getProgressColor = (pct) => {
  if (pct >= 100) return '#EF4444';
  if (pct >= 80)  return '#F97316';
  if (pct >= 60)  return '#EAB308';
  return '#22C55E';
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'safe':     return { color: 'green',  bg: 'rgba(34,197,94,0.12)',  label: 'Safe' };
    case 'warning':  return { color: 'orange', bg: 'rgba(249,115,22,0.12)', label: 'Warning' };
    case 'exceeded': return { color: 'red',    bg: 'rgba(239,68,68,0.12)',  label: 'Exceeded' };
    default:         return { color: 'gray',   bg: 'rgba(107,114,128,0.1)', label: status || 'Unknown' };
  }
};

const formatIDR = (val) =>
  val != null ? `Rp ${Number(val).toLocaleString('id-ID')}` : 'Rp 0';

// ─── Styled Select ────────────────────────────────────────────────────────────
function FilterSelect({ value, onChange, children, minW = '160px' }) {
  return (
    <Box position="relative">
      <select
        value={value}
        onChange={onChange}
        style={{
          appearance: 'none',
          WebkitAppearance: 'none',
          padding: '8px 36px 8px 14px',
          borderRadius: '12px',
          border: '1.5px solid',
          borderColor: value ? '#6366F1' : 'rgba(99,102,241,0.2)',
          fontSize: '13px',
          fontWeight: 500,
          minWidth: minW,
          background: value
            ? 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))'
            : 'rgba(255,255,255,0.05)',
          color: 'inherit',
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s',
        }}
      >
        {children}
      </select>
      <Box
        position="absolute"
        right="10px"
        top="50%"
        transform="translateY(-50%)"
        pointerEvents="none"
        color={value ? '#6366F1' : 'gray'}
        fontSize="11px"
      >
        ▼
      </Box>
    </Box>
  );
}


// ─── Budget Card ──────────────────────────────────────────────────────────────
function BudgetCard({ budget, onEdit, onDelete }) {
  const pct = budget.percentage_used || 0;
  const progressColor = getProgressColor(pct);
  const statusCfg = getStatusConfig(budget.status);
  const remaining = (budget.amount || 0) - (budget.spent_amount || 0);

  return (
    <MotionBox variants={cardVariants}>
      <Card.Root
        borderRadius="2xl"
        overflow="hidden"
        border="1.5px solid"
        borderColor={{ base: 'gray.100', _dark: 'whiteAlpha.100' }}
        bg={{ base: 'white', _dark: 'gray.800' }}
        shadow="sm"
        _hover={{ shadow: 'xl', transform: 'translateY(-4px)', borderColor: 'purple.200' }}
        transition="all 0.3s cubic-bezier(0.175,0.885,0.32,1.275)"
        position="relative"
      >
        {/* Top accent bar */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          style={{
            background: `linear-gradient(90deg, ${progressColor}, ${progressColor}88)`,
          }}
        />

        <Card.Body p={5} pt={6}>
          {/* Header row */}
          <Flex justify="space-between" align="flex-start" mb={4}>
            <Box flex={1} mr={3}>
              <Text fontWeight="black" fontSize="lg" lineHeight="tight" mb={1}>
                {budget.category_name || 'Uncategorized'}
              </Text>
              <HStack gap={2} flexWrap="wrap">
                <Badge
                  borderRadius="full"
                  px={3}
                  py={0.5}
                  fontSize="xs"
                  fontWeight="bold"
                  textTransform="capitalize"
                  style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                    color: '#6366F1',
                    border: '1px solid rgba(99,102,241,0.25)',
                  }}
                >
                  {budget.period}
                </Badge>
                {budget.asset_name ? (
                  <Badge
                    borderRadius="full"
                    px={3}
                    py={0.5}
                    fontSize="xs"
                    fontWeight="bold"
                    style={{
                      background: 'rgba(6,182,212,0.12)',
                      color: '#06B6D4',
                      border: '1px solid rgba(6,182,212,0.25)',
                    }}
                  >
                    {budget.asset_name}
                  </Badge>
                ) : (
                  <Badge
                    borderRadius="full"
                    px={3}
                    py={0.5}
                    fontSize="xs"
                    style={{
                      background: 'rgba(107,114,128,0.1)',
                      color: '#6B7280',
                    }}
                  >
                    All Assets
                  </Badge>
                )}
              </HStack>
            </Box>
            <Badge
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
              fontWeight="bold"
              textTransform="capitalize"
              style={{
                background: statusCfg.bg,
                color: statusCfg.color === 'green' ? '#16A34A'
                  : statusCfg.color === 'orange' ? '#EA580C'
                  : statusCfg.color === 'red' ? '#DC2626'
                  : '#6B7280',
                border: `1px solid ${statusCfg.bg}`,
              }}
            >
              {statusCfg.label}
            </Badge>
          </Flex>

          {/* Progress section */}
          <Box mb={4}>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wider">
                Budget Usage
              </Text>
              <Text
                fontSize="sm"
                fontWeight="black"
                style={{ color: progressColor }}
              >
                {pct.toFixed(1)}%
              </Text>
            </Flex>
            <Box
              h="8px"
              borderRadius="full"
              bg={{ base: 'gray.100', _dark: 'whiteAlpha.100' }}
              overflow="hidden"
            >
              <MotionBox
                h="100%"
                borderRadius="full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(pct, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                style={{ background: `linear-gradient(90deg, ${progressColor}aa, ${progressColor})` }}
              />
            </Box>
          </Box>

          {/* Amount grid */}
          <Grid templateColumns="repeat(3, 1fr)" gap={3} mb={4}>
            <Box
              p={3}
              borderRadius="xl"
              bg={{ base: 'gray.50', _dark: 'whiteAlpha.50' }}
              textAlign="center"
            >
              <Text fontSize="xs" color="gray.500" fontWeight="medium" mb={1}>Budget</Text>
              <Text fontSize="sm" fontWeight="black" noOfLines={1}>
                {formatIDR(budget.amount)}
              </Text>
            </Box>
            <Box
              p={3}
              borderRadius="xl"
              bg={{ base: 'orange.50', _dark: 'rgba(249,115,22,0.08)' }}
              textAlign="center"
            >
              <Text fontSize="xs" color="orange.500" fontWeight="medium" mb={1}>Spent</Text>
              <Text fontSize="sm" fontWeight="black" color="orange.600" noOfLines={1}>
                {formatIDR(budget.spent_amount)}
              </Text>
            </Box>
            <Box
              p={3}
              borderRadius="xl"
              bg={{ base: remaining >= 0 ? 'green.50' : 'red.50', _dark: remaining >= 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }}
              textAlign="center"
            >
              <Text fontSize="xs" color={remaining >= 0 ? 'green.500' : 'red.500'} fontWeight="medium" mb={1}>
                {remaining >= 0 ? 'Left' : 'Over'}
              </Text>
              <Text fontSize="sm" fontWeight="black" color={remaining >= 0 ? 'green.600' : 'red.600'} noOfLines={1}>
                {formatIDR(Math.abs(remaining))}
              </Text>
            </Box>
          </Grid>

          {/* Actions */}
          <Flex gap={2} justify="flex-end">
            <Button
              size="sm"
              variant="ghost"
              borderRadius="xl"
              onClick={() => onEdit(budget)}
              _hover={{ bg: 'rgba(99,102,241,0.1)', color: '#6366F1' }}
            >
              <HStack gap={1.5}>
                <FaPencil size={12} />
                <Text>Edit</Text>
              </HStack>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              borderRadius="xl"
              onClick={() => onDelete(budget.id)}
              _hover={{ bg: 'rgba(239,68,68,0.1)', color: '#EF4444' }}
            >
              <HStack gap={1.5}>
                <FaTrash size={12} />
                <Text>Delete</Text>
              </HStack>
            </Button>
          </Flex>
        </Card.Body>
      </Card.Root>
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
    <Box maxW="7xl" mx="auto" px={4} py={8}>

      {/* ── Gradient Header ─────────────────────────────────────────────── */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
        borderRadius="3xl"
        overflow="hidden"
        position="relative"
        style={{
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #9333EA 100%)',
        }}
        p={{ base: 6, md: 8 }}
      >
        {/* Decorative blobs */}
        <Box
          position="absolute" top="-40px" right="-40px"
          w="200px" h="200px" borderRadius="full"
          bg="whiteAlpha.100" pointerEvents="none"
        />
        <Box
          position="absolute" bottom="-60px" left="30%"
          w="250px" h="250px" borderRadius="full"
          bg="whiteAlpha.50" pointerEvents="none"
        />

        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          position="relative"
        >
          <Box>
            <HStack gap={3} mb={2}>
              <Circle size="44px" bg="whiteAlpha.200">
                <FaWallet size={20} color="white" />
              </Circle>
              <Box>
                <Heading as="h1" size="xl" color="white" fontWeight="black" letterSpacing="tight">
                  Budget Management
                </Heading>
                <Text color="whiteAlpha.800" fontSize="sm">
                  {totalItems} budget{totalItems !== 1 ? 's' : ''} · Track & control your spending
                </Text>
              </Box>
            </HStack>
          </Box>

          <Button
            onClick={handleAddNew}
            size="md"
            borderRadius="2xl"
            fontWeight="bold"
            bg="white"
            color="#4F46E5"
            _hover={{ bg: 'whiteAlpha.900', transform: 'scale(1.03)' }}
            transition="all 0.2s"
            shadow="md"
          >
            <HStack gap={2}>
              <FaPlus size={14} />
              <Text>Create Budget</Text>
            </HStack>
          </Button>
        </Flex>

        {/* Mini stat row */}
        <Grid
          templateColumns={{ base: 'repeat(3, 1fr)' }}
          gap={3}
          mt={6}
          position="relative"
        >
          {[
            { label: 'Total Budget', value: formatIDR(stats.totalBudget), icon: FaChartPie },
            { label: 'Total Spent',  value: formatIDR(stats.totalSpent),  icon: FaArrowTrendDown },
            { label: 'Exceeded',     value: `${stats.exceeded} budget${stats.exceeded !== 1 ? 's' : ''}`, icon: FaArrowTrendUp },
          ].map(({ label, value, icon }) => {
            const StatIcon = icon;
            return (
            <Box
              key={label}
              p={4}
              borderRadius="2xl"
              bg="whiteAlpha.200"
              backdropFilter="blur(10px)"
            >
              <HStack gap={2} mb={1}>
                <StatIcon size={14} color="rgba(255,255,255,0.7)" />
                <Text fontSize="xs" color="whiteAlpha.700" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                  {label}
                </Text>
              </HStack>
              <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="black" color="white" noOfLines={1}>
                {value}
              </Text>
            </Box>
          )})}
        </Grid>
      </MotionBox>

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        mb={6}
      >
        <Card.Root
          borderRadius="2xl"
          border="1.5px solid"
          borderColor={{ base: 'gray.100', _dark: 'whiteAlpha.100' }}
          bg={{ base: 'white', _dark: 'gray.800' }}
          shadow="sm"
          p={4}
        >
          <Flex gap={3} wrap="wrap" align="center">
            <HStack gap={2} color="gray.500">
              <FaFilter size={13} />
              <Text fontSize="sm" fontWeight="bold">Filters</Text>
            </HStack>

            <FilterSelect
              value={filterCategoryId}
              onChange={(e) => { setFilterCategoryId(e.target.value); setPage(1); }}
              minW="170px"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </FilterSelect>

            <FilterSelect
              value={filterPeriod}
              onChange={(e) => { setFilterPeriod(e.target.value); setPage(1); }}
              minW="140px"
            >
              <option value="">All Periods</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </FilterSelect>

            <FilterSelect
              value={filterAssetId}
              onChange={(e) => { setFilterAssetId(e.target.value); setPage(1); }}
              minW="170px"
            >
              <option value="">All Assets</option>
              {assets.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
            </FilterSelect>

            <FilterSelect
              value={filterIsActive}
              onChange={(e) => { setFilterIsActive(e.target.value); setPage(1); }}
              minW="130px"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </FilterSelect>

            {hasFilters && (
              <Button
                size="sm"
                variant="ghost"
                borderRadius="xl"
                onClick={handleClearFilters}
                color="red.400"
                _hover={{ bg: 'red.50', color: 'red.500' }}
              >
                <HStack gap={1.5}>
                  <FaXmark size={12} />
                  <Text>Clear</Text>
                </HStack>
              </Button>
            )}

            <Box flex={1} />

            <HStack gap={2}>
              <Text fontSize="xs" color="gray.500" fontWeight="medium" whiteSpace="nowrap">Per page:</Text>
              <FilterSelect
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                minW="70px"
              >
                {[6, 12, 24, 48].map(n => <option key={n} value={n}>{n}</option>)}
              </FilterSelect>
            </HStack>
          </Flex>

          {/* Active filter chips */}
          <AnimatePresence>
            {hasFilters && (
              <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                overflow="hidden"
              >
                <Flex gap={2} flexWrap="wrap" mt={3} pt={3} borderTop="1px solid" borderColor={{ base: 'gray.100', _dark: 'whiteAlpha.100' }}>
                  <Text fontSize="xs" color="gray.400" fontWeight="medium" alignSelf="center">Active:</Text>
                  {filterCategoryId && (
                    <Badge borderRadius="full" px={3} py={1} fontSize="xs" colorPalette="purple">
                      Category: {categories.find(c => c.value == filterCategoryId)?.label}
                    </Badge>
                  )}
                  {filterAssetId && (
                    <Badge borderRadius="full" px={3} py={1} fontSize="xs" colorPalette="cyan">
                      Asset: {assets.find(a => a.value == filterAssetId)?.label}
                    </Badge>
                  )}
                  {filterPeriod && (
                    <Badge borderRadius="full" px={3} py={1} fontSize="xs" colorPalette="green">
                      Period: {filterPeriod}
                    </Badge>
                  )}
                  {filterIsActive && (
                    <Badge borderRadius="full" px={3} py={1} fontSize="xs" colorPalette="blue">
                      {filterIsActive === 'true' ? 'Active' : 'Inactive'}
                    </Badge>
                  )}
                  {sortBy && (
                    <Badge borderRadius="full" px={3} py={1} fontSize="xs" colorPalette="orange">
                      Sort: {sortBy} ({sortDir})
                    </Badge>
                  )}
                </Flex>
              </MotionBox>
            )}
          </AnimatePresence>
        </Card.Root>
      </MotionBox>

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <Flex justify="center" align="center" py={20}>
          <VStack gap={4}>
            <Spinner
              size="xl"
              thickness="4px"
              style={{ borderColor: 'rgba(99,102,241,0.2)', borderTopColor: '#6366F1' }}
            />
            <Text color="gray.500" fontWeight="medium">Loading budgets...</Text>
          </VStack>
        </Flex>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && !loading && (
        <Box
          textAlign="center" py={10} px={6}
          bg="red.50" borderRadius="2xl"
          border="1px solid" borderColor="red.100"
          mb={6}
        >
          <Text color="red.600" fontWeight="bold" mb={3}>Something went wrong: {error}</Text>
          <Button colorPalette="red" variant="subtle" borderRadius="xl" onClick={fetchBudgets}>
            Try Again
          </Button>
        </Box>
      )}

      {/* ── Budget Cards Grid ─────────────────────────────────────────────── */}
      {!loading && budgets.length > 0 ? (
        <>
          <MotionGrid
            templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(3, 1fr)' }}
            gap={5}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            mb={6}
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

          {/* ── Pagination ─────────────────────────────────────────────── */}
          <Card.Root
            borderRadius="2xl"
            border="1.5px solid"
            borderColor={{ base: 'gray.100', _dark: 'whiteAlpha.100' }}
            bg={{ base: 'white', _dark: 'gray.800' }}
            shadow="sm"
            p={4}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
              <Text fontSize="sm" color="gray.500">
                Showing <Text as="span" fontWeight="bold" color="gray.700">{((page - 1) * pageSize) + 1}</Text>
                {' '}–{' '}
                <Text as="span" fontWeight="bold" color="gray.700">{Math.min(page * pageSize, totalItems)}</Text>
                {' '}of{' '}
                <Text as="span" fontWeight="bold" color="gray.700">{totalItems}</Text> budgets
              </Text>

              <HStack gap={1.5}>
                <Button
                  size="sm" variant="ghost" borderRadius="xl"
                  onClick={() => setPage(1)} disabled={page === 1}
                  _hover={{ bg: 'rgba(99,102,241,0.1)' }}
                >
                  First
                </Button>
                <Button
                  size="sm" variant="ghost" borderRadius="xl"
                  onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  _hover={{ bg: 'rgba(99,102,241,0.1)' }}
                >
                  <FaChevronLeft size={12} />
                </Button>

                {pageNums.map(n => (
                  <Button
                    key={n}
                    size="sm"
                    borderRadius="xl"
                    onClick={() => setPage(n)}
                    style={
                      page === n
                        ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white' }
                        : {}
                    }
                    variant={page === n ? 'solid' : 'ghost'}
                    _hover={page !== n ? { bg: 'rgba(99,102,241,0.1)' } : {}}
                  >
                    {n}
                  </Button>
                ))}

                <Button
                  size="sm" variant="ghost" borderRadius="xl"
                  onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
                  _hover={{ bg: 'rgba(99,102,241,0.1)' }}
                >
                  <FaChevronRight size={12} />
                </Button>
                <Button
                  size="sm" variant="ghost" borderRadius="xl"
                  onClick={() => setPage(totalPages)} disabled={page === totalPages}
                  _hover={{ bg: 'rgba(99,102,241,0.1)' }}
                >
                  Last
                </Button>
              </HStack>
            </Flex>
          </Card.Root>
        </>
      ) : !loading && (
        /* ── Empty State ──────────────────────────────────────────────── */
        <AnimatePresence>
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card.Root
              borderRadius="3xl"
              border="1.5px dashed"
              borderColor={{ base: 'gray.200', _dark: 'whiteAlpha.200' }}
              bg={{ base: 'gray.50', _dark: 'gray.800' }}
              p={16}
            >
              <VStack gap={6} align="center">
                <Box position="relative">
                  <Circle
                    size="100px"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
                    }}
                  >
                    <FaLayerGroup size={40} color="#6366F1" />
                  </Circle>
                  <MotionBox
                    position="absolute" top="-8px" right="-8px"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <Circle size="32px" bg="yellow.400" shadow="md">
                      <Text fontSize="md">✨</Text>
                    </Circle>
                  </MotionBox>
                </Box>

                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="black" mb={2}>
                    {hasFilters ? 'No Matching Budgets' : 'No Budgets Yet'}
                  </Text>
                  <Text color="gray.500" maxW="380px" fontSize="md">
                    {hasFilters
                      ? 'Try adjusting or clearing your filters to see more results.'
                      : 'Start managing your finances by creating your first budget.'}
                  </Text>
                </Box>

                <HStack gap={3}>
                  {hasFilters && (
                    <Button
                      variant="outline"
                      borderRadius="2xl"
                      onClick={handleClearFilters}
                      borderColor="gray.300"
                    >
                      Clear Filters
                    </Button>
                  )}
                  <Button
                    borderRadius="2xl"
                    fontWeight="bold"
                    onClick={handleAddNew}
                    style={{
                      background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                      color: 'white',
                    }}
                    _hover={{ opacity: 0.9, transform: 'scale(1.03)' }}
                    transition="all 0.2s"
                  >
                    <HStack gap={2}>
                      <FaPlus size={14} />
                      <Text>Create Budget</Text>
                    </HStack>
                  </Button>
                </HStack>
              </VStack>
            </Card.Root>
          </MotionBox>
        </AnimatePresence>
      )}
    </Box>
  );
}
