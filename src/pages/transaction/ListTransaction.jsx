import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Heading,
    Spinner,
    Text,
    Button,
    Flex,
    Stack,
    VStack,
    Badge,
    Input,
    Icon,
    HStack,
    Circle,
    Separator,
    Grid,
    Spacer,
    SimpleGrid
} from "@chakra-ui/react";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "../../components/ui/toaster";
import { useColorModeValue } from '../../components/ui/color-mode';
import { FiCalendar, FiFilter, FiArrowUp, FiArrowDown, FiRefreshCw, FiPieChart, FiSearch, FiPlus, FiTrendingUp, FiTrendingDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function ListTransaction() {
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination states
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [assetId, setAssetId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Colors
    const pageBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const subtitleColor = useColorModeValue('gray.600', 'gray.400');
    const incomeColor = useColorModeValue('green.600', 'green.400');
    const expenseColor = useColorModeValue('red.600', 'red.400');
    const incomeBg = useColorModeValue('green.50', 'green.950/50');
    const expenseBg = useColorModeValue('red.50', 'red.950/50');
    const inputBg = useColorModeValue('gray.50', 'gray.900');

    // Calendar icon filter - makes calendar picker visible in dark mode
    const calendarIconFilter = useColorModeValue("none", "invert(1)");
    const netBalanceBg = useColorModeValue('blue.50', 'blue.950/50');

    // Helper function to navigate to add transaction page
    const navigateToAddTransaction = () => {
        navigate('/transaction');
    };

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, startDate, endDate, transactionType, categoryId, assetId]);

    useEffect(() => {
        fetchCategories();
        fetchWallets();
    }, []);

    const fetchTransactions = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
            if (transactionType) params.append('transaction_type', transactionType);
            if (categoryId) params.append('category_id', categoryId);
            if (assetId) params.append('asset_id', assetId);

            const url = import.meta.env.VITE_API_URL + `v2/transactions?${params.toString()}`;
            const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
            setTransactions(response.data.data || []);
            setTotalPages(response.data.pagination?.total_pages || 1);
            setTotalItems(response.data.pagination?.total_items || 0);
        } catch (err) {
            console.error(err);
            setError(err.message);
            toaster.create({
                description: "Failed to fetch transactions",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = import.meta.env.VITE_API_URL + 'categories';
            const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
            const categoriesData = response.data.data || [];
            setCategories(categoriesData.map(cat => ({
                label: cat.CategoryName,
                value: String(cat.ID)
            })));
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchWallets = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = import.meta.env.VITE_API_URL + 'wallets';
            const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
            const walletsData = response.data.data || [];
            setWallets(walletsData.map(wallet => ({
                label: wallet.name,
                value: String(wallet.id),
                bankName: wallet.asset_name
            })));
        } catch (err) {
            console.error('Error fetching wallets:', err);
        }
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setTransactionType('');
        setCategoryId('');
        setAssetId('');
        setSearchQuery('');
        setPage(1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Quick date filter functions
    const setDateToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setPage(1);
    };

    const setDateThisWeek = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const firstDay = new Date(today);
        firstDay.setDate(today.getDate() - dayOfWeek);
        const lastDay = new Date(today);
        lastDay.setDate(today.getDate() - dayOfWeek + 6);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
        setPage(1);
    };

    const setDateThisMonth = () => {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setStartDate(firstDay.toISOString().split('T')[0]);
        setEndDate(lastDay.toISOString().split('T')[0]);
        setPage(1);
    };

    // Filter transactions based on search query
    const filteredTransactions = transactions.filter(transaction => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            transaction.description?.toLowerCase().includes(query) ||
            transaction.category_name?.toLowerCase().includes(query) ||
            transaction.asset_name?.toLowerCase().includes(query) ||
            formatCurrency(transaction.amount).toLowerCase().includes(query)
        );
    });

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
        const date = new Date(transaction.date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {});

    // Calculate summary stats
    const totalIncome = transactions
        .filter(t => t.transaction_type === 1)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
        .filter(t => t.transaction_type === 2)
        .reduce((sum, t) => sum + t.amount, 0);

    const selectStyle = {
        padding: '6px 12px',
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        fontSize: '13px',
        fontWeight: '600',
        backgroundColor: inputBg,
        color: 'inherit',
        outline: 'none',
        cursor: 'pointer'
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
                                Transaction Ledger
                            </Text>
                        </Flex>
                        <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
                            Transaction History
                        </Heading>
                        <Text color={subtitleColor} fontSize="md">
                            Inspect, filter, and analyze all income and expense entries across your accounts.
                        </Text>
                    </Box>

                    <HStack gap={3}>
                        <Button
                            variant="outline"
                            size="md"
                            onClick={fetchTransactions}
                            loading={loading}
                            borderRadius="xl"
                        >
                            <FiRefreshCw style={{ marginRight: '6px' }} />
                            Refresh
                        </Button>
                        <Button
                            onClick={navigateToAddTransaction}
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
                            Add Transaction
                        </Button>
                    </HStack>
                </Flex>

                {/* Summary Cards */}
                {filteredTransactions.length > 0 && (
                    <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} mb={8}>
                        <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs">
                            <Flex justify="space-between" align="center" mb={2}>
                                <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                                    Total Income
                                </Text>
                                <Flex w={9} h={9} align="center" justify="center" borderRadius="xl" bg={incomeBg}>
                                    <FiTrendingUp color="var(--chakra-colors-green-500)" size={16} />
                                </Flex>
                            </Flex>
                            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={incomeColor}>
                                {formatCurrency(totalIncome)}
                            </Text>
                            <Text fontSize="xs" color={subtitleColor} mt={1}>
                                Inflow transactions on page
                            </Text>
                        </Box>

                        <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs">
                            <Flex justify="space-between" align="center" mb={2}>
                                <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                                    Total Expense
                                </Text>
                                <Flex w={9} h={9} align="center" justify="center" borderRadius="xl" bg={expenseBg}>
                                    <FiTrendingDown color="var(--chakra-colors-red-500)" size={16} />
                                </Flex>
                            </Flex>
                            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={expenseColor}>
                                {formatCurrency(totalExpense)}
                            </Text>
                            <Text fontSize="xs" color={subtitleColor} mt={1}>
                                Outflow transactions on page
                            </Text>
                        </Box>

                        <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs">
                            <Flex justify="space-between" align="center" mb={2}>
                                <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                                    Net Balance
                                </Text>
                                <Flex w={9} h={9} align="center" justify="center" borderRadius="xl" bg={netBalanceBg}>
                                    <FiPieChart color="var(--chakra-colors-blue-500)" size={16} />
                                </Flex>
                            </Flex>
                            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={totalIncome - totalExpense >= 0 ? incomeColor : expenseColor}>
                                {formatCurrency(totalIncome - totalExpense)}
                            </Text>
                            <Text fontSize="xs" color={subtitleColor} mt={1}>
                                Net change on current page
                            </Text>
                        </Box>
                    </SimpleGrid>
                )}

                {/* Filter Toolbar */}
                <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs" mb={8}>
                    <Stack gap={4}>
                        {/* Search Input Bar */}
                        <Box position="relative">
                            <Icon 
                                as={FiSearch} 
                                position="absolute" 
                                left={4} 
                                top="50%" 
                                transform="translateY(-50%)" 
                                color="gray.400"
                                zIndex={1}
                            />
                            <Input
                                placeholder="Search transactions by description, category, wallet, or amount..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                size="md"
                                pl={11}
                                borderRadius="xl"
                                bg={inputBg}
                                borderColor={borderColor}
                                _focus={{ borderColor: "blue.500" }}
                            />
                        </Box>

                        {/* Quick Date Pills & Controls */}
                        <Flex gap={3} wrap="wrap" align="center">
                            <HStack gap={2}>
                                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                                    Quick Date:
                                </Text>
                                <Button size="xs" variant="outline" borderRadius="lg" onClick={setDateToday}>Today</Button>
                                <Button size="xs" variant="outline" borderRadius="lg" onClick={setDateThisWeek}>This Week</Button>
                                <Button size="xs" variant="outline" borderRadius="lg" onClick={setDateThisMonth}>This Month</Button>
                            </HStack>

                            <Spacer />

                            {/* Date Pickers */}
                            <HStack gap={2}>
                                <Icon as={FiCalendar} color={subtitleColor} boxSize={4} />
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                    size="sm"
                                    w="140px"
                                    borderRadius="xl"
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    css={{ "&::-webkit-calendar-picker-indicator": { filter: calendarIconFilter } }}
                                />
                                <Text color={subtitleColor} fontSize="xs">to</Text>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                    size="sm"
                                    w="140px"
                                    borderRadius="xl"
                                    bg={inputBg}
                                    borderColor={borderColor}
                                    css={{ "&::-webkit-calendar-picker-indicator": { filter: calendarIconFilter } }}
                                />
                            </HStack>
                        </Flex>

                        {/* Category, Type, Wallet Dropdowns */}
                        <Flex gap={3} wrap="wrap" align="center" pt={3} borderTop="1px solid" borderColor={borderColor}>
                            <select
                                value={transactionType}
                                onChange={(e) => { setTransactionType(e.target.value); setPage(1); }}
                                style={selectStyle}
                            >
                                <option value="">All Types</option>
                                <option value="1">Income</option>
                                <option value="2">Expense</option>
                            </select>

                            <select
                                value={categoryId}
                                onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
                                style={selectStyle}
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>

                            <select
                                value={assetId}
                                onChange={(e) => { setAssetId(e.target.value); setPage(1); }}
                                style={selectStyle}
                            >
                                <option value="">All Wallets</option>
                                {wallets.map(wallet => (
                                    <option key={wallet.value} value={wallet.value}>{wallet.label}</option>
                                ))}
                            </select>

                            {(startDate || endDate || transactionType || categoryId || assetId || searchQuery) && (
                                <Button variant="ghost" colorPalette="red" size="sm" borderRadius="xl" onClick={handleClearFilters}>
                                    <FiFilter style={{ marginRight: '4px' }} />
                                    Clear All
                                </Button>
                            )}

                            <Spacer />

                            {/* Per page count */}
                            <HStack gap={2}>
                                <Text fontSize="xs" fontWeight="600" color={subtitleColor}>Show</Text>
                                <select
                                    value={limit}
                                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                    style={selectStyle}
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={20}>20 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </HStack>
                        </Flex>

                        {/* Active Filter Badges */}
                        {(startDate || endDate || transactionType || categoryId || assetId || searchQuery) && (
                            <Flex gap={2} flexWrap="wrap" align="center" pt={1}>
                                <Text fontSize="xs" fontWeight="700" color={subtitleColor}>Active:</Text>
                                {searchQuery && <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">Search: "{searchQuery}"</Badge>}
                                {startDate && <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">From: {startDate}</Badge>}
                                {endDate && <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">To: {endDate}</Badge>}
                                {transactionType && (
                                    <Badge colorPalette={transactionType === '1' ? 'green' : 'red'} variant="subtle" size="sm" borderRadius="full">
                                        {transactionType === '1' ? 'Income' : 'Expense'}
                                    </Badge>
                                )}
                                {categoryId && (
                                    <Badge colorPalette="purple" variant="subtle" size="sm" borderRadius="full">
                                        Category: {categories.find(c => c.value === categoryId)?.label}
                                    </Badge>
                                )}
                                {assetId && (
                                    <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="full">
                                        Wallet: {wallets.find(w => w.value === assetId)?.label}
                                    </Badge>
                                )}
                            </Flex>
                        )}
                    </Stack>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Flex justify="center" align="center" py={16}>
                        <VStack gap={3}>
                            <Spinner size="xl" color="blue.500" />
                            <Text color={subtitleColor} fontSize="sm">Loading transactions...</Text>
                        </VStack>
                    </Flex>
                )}

                {/* Error Alert */}
                {error && !loading && (
                    <Box p={4} borderRadius="2xl" bg="red.50" border="1px solid" borderColor="red.200" mb={6}>
                        <Text color="red.600" fontSize="sm" textAlign="center">
                            Error fetching transactions: {error}
                        </Text>
                    </Box>
                )}

                {/* Transaction List Grouped by Date */}
                {!loading && filteredTransactions.length > 0 ? (
                    <>
                        <Stack gap={6} mb={8}>
                            {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                                <Box key={date}>
                                    <Flex align="center" mb={3} gap={3}>
                                        <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                                            {date}
                                        </Text>
                                        <Separator flex="1" borderColor={borderColor} />
                                        <Badge colorPalette="blue" variant="subtle" size="xs" borderRadius="full">
                                            {dateTransactions.length} {dateTransactions.length === 1 ? 'entry' : 'entries'}
                                        </Badge>
                                    </Flex>
                                    
                                    <Stack gap={3}>
                                        {dateTransactions.map((transaction) => (
                                            <Box
                                                key={transaction.id}
                                                bg={cardBg}
                                                borderRadius="2xl"
                                                border="1px solid"
                                                borderColor={borderColor}
                                                p={4}
                                                shadow="xs"
                                                transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                                                _hover={{ 
                                                    shadow: 'sm',
                                                    transform: 'translateY(-2px)',
                                                    borderColor: 'blue.300'
                                                }}
                                                cursor="pointer"
                                                onClick={() => navigate(`/transactions/${transaction.id}`)}
                                            >
                                                <Flex 
                                                    direction={{ base: 'column', md: 'row' }} 
                                                    align={{ base: 'flex-start', md: 'center' }} 
                                                    justify="space-between"
                                                    gap={4}
                                                >
                                                    {/* Left Section - Icon, Description, Category & Badges */}
                                                    <Flex align="center" gap={3.5} flex={1}>
                                                        <Flex 
                                                            w={10}
                                                            h={10} 
                                                            borderRadius="xl"
                                                            bg={transaction.transaction_type === 1 ? incomeBg : expenseBg}
                                                            align="center"
                                                            justify="center"
                                                            flexShrink={0}
                                                        >
                                                            <Icon 
                                                                as={transaction.transaction_type === 1 ? FiArrowDown : FiArrowUp} 
                                                                boxSize={5} 
                                                                color={transaction.transaction_type === 1 ? incomeColor : expenseColor}
                                                            />
                                                        </Flex>
                                                        <VStack align="start" gap={1} flex={1}>
                                                            <Text fontSize="sm" fontWeight="700" letterSpacing="tight">
                                                                {transaction.description || 'Uncategorized Transaction'}
                                                            </Text>
                                                            <HStack gap={2} flexWrap="wrap">
                                                                <Text fontSize="xs" color={subtitleColor}>
                                                                    {new Date(transaction.date).toLocaleTimeString('id-ID', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </Text>
                                                                <Badge 
                                                                    colorPalette="purple" 
                                                                    variant="subtle" 
                                                                    size="xs"
                                                                    borderRadius="full"
                                                                    fontWeight="600"
                                                                >
                                                                    {transaction?.category_name || 'General'}
                                                                </Badge>
                                                                <Badge 
                                                                    colorPalette="cyan" 
                                                                    variant="subtle" 
                                                                    size="xs"
                                                                    borderRadius="full"
                                                                    fontWeight="600"
                                                                >
                                                                    {transaction?.asset_name || 'Wallet'}
                                                                </Badge>
                                                                {transaction?.tags && transaction.tags.length > 0 && (
                                                                    <>
                                                                        {transaction.tags.map((tag) => (
                                                                            <Badge
                                                                                key={tag.id}
                                                                                size="xs"
                                                                                px={2}
                                                                                py={0.5}
                                                                                borderRadius="full"
                                                                                style={{
                                                                                    backgroundColor: tag.color + '20',
                                                                                    border: `1px solid ${tag.color}60`,
                                                                                    color: tag.color
                                                                                }}
                                                                            >
                                                                                {tag.icon && <span style={{ marginRight: '3px' }}>{tag.icon}</span>}
                                                                                {tag.name}
                                                                            </Badge>
                                                                        ))}
                                                                    </>
                                                                )}
                                                            </HStack>
                                                        </VStack>
                                                    </Flex>

                                                    {/* Right Section - Amount */}
                                                    <Box textAlign={{ base: 'left', md: 'right' }}>
                                                        <Text
                                                            fontSize="lg"
                                                            fontWeight="800"
                                                            letterSpacing="tight"
                                                            color={transaction.transaction_type === 1 ? incomeColor : expenseColor}
                                                        >
                                                            {transaction.transaction_type === 1 ? '+' : '-'}
                                                            {formatCurrency(transaction.amount)}
                                                        </Text>
                                                        <Text fontSize="xs" color={subtitleColor}>
                                                            {transaction.transaction_type === 1 ? 'Income Inflow' : 'Expense Outflow'}
                                                        </Text>
                                                    </Box>
                                                </Flex>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>

                        {/* Pagination Bar */}
                        <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={4} shadow="xs">
                            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                                <Text fontSize="xs" color={subtitleColor}>
                                    Showing <Text as="span" fontWeight="700">{((page - 1) * limit) + 1}</Text> to <Text as="span" fontWeight="700">{Math.min(page * limit, totalItems)}</Text> of <Text as="span" fontWeight="700">{totalItems}</Text> transactions
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
                                        onClick={() => setPage(page - 1)}
                                        isDisabled={page === 1}
                                        variant="outline"
                                        borderRadius="lg"
                                    >
                                        <FiChevronLeft size={10} />
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
                                                    size="xs"
                                                    w="7"
                                                    h="7"
                                                    onClick={() => setPage(pageNum)}
                                                    colorPalette={page === pageNum ? 'blue' : 'gray'}
                                                    variant={page === pageNum ? 'solid' : 'ghost'}
                                                    borderRadius="lg"
                                                    fontWeight={page === pageNum ? '700' : '500'}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        })}
                                    </Flex>
                                    <Button
                                        size="xs"
                                        onClick={() => setPage(page + 1)}
                                        isDisabled={page === totalPages}
                                        variant="outline"
                                        borderRadius="lg"
                                    >
                                        <FiChevronRight size={10} />
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
                    <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={12} textAlign="center" shadow="xs">
                        <VStack gap={3}>
                            <Flex w={12} h={12} align="center" justify="center" borderRadius="2xl" bg={netBalanceBg}>
                                <FiPieChart boxSize={6} color="var(--chakra-colors-blue-500)" />
                            </Flex>
                            <Heading size="sm" fontWeight="700">
                                {searchQuery ? 'No Matching Transactions' : 'No Transactions Found'}
                            </Heading>
                            <Text color={subtitleColor} fontSize="xs" maxW="sm">
                                {searchQuery ? `No results matching "${searchQuery}".` : 'Try adjusting your filters or record a new transaction to populate your ledger.'}
                            </Text>
                            <HStack gap={3} mt={2}>
                                {searchQuery && (
                                    <Button variant="outline" size="sm" borderRadius="xl" onClick={() => setSearchQuery('')}>
                                        Clear Search
                                    </Button>
                                )}
                                <Button
                                    onClick={navigateToAddTransaction}
                                    bg="blue.500"
                                    color="white"
                                    _hover={{ bg: "blue.600" }}
                                    size="sm"
                                    borderRadius="xl"
                                    fontWeight="600"
                                >
                                    <FiPlus style={{ marginRight: '6px' }} />
                                    Add Transaction
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
