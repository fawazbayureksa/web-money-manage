import React, { useState, useEffect } from 'react';
import {
    Box,
    Heading,
    Spinner,
    Table,
    Text,
    Button,
    Flex,
    Stack,
    VStack,
    Badge,
    Card,
    Input,
    Icon,
    HStack,
    Circle,
    Separator,
    IconButton,
    Group,
    Grid,
} from "@chakra-ui/react";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "../../components/ui/toaster";
import { useColorModeValue } from '../../components/ui/color-mode';
import { FiCalendar, FiFilter, FiArrowUp, FiArrowDown, FiRefreshCw, FiPieChart, FiSearch, FiDownload, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export default function ListTransaction() {
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
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const incomeColor = useColorModeValue('green.600', 'green.400');
    const expenseColor = useColorModeValue('red.600', 'red.400');
    const incomeBg = useColorModeValue('green.50', 'green.900');
    const expenseBg = useColorModeValue('red.50', 'red.900');
    const selectBg = useColorModeValue('white', 'gray.700');
    const selectColor = useColorModeValue('gray.800', 'white');
    const selectBorderColor = useColorModeValue('#E2E8F0', '#4A5568');
    const calendarIconFilter = useColorModeValue("none", "invert(1)");
    const netBalanceBg = useColorModeValue('blue.50', 'blue.900');

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
                page_size: limit.toString(),
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
        } catch (error) {
            console.error(error);
            setError(error.message);
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
        } catch (error) {
            console.error('Error fetching categories:', error);
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
        } catch (error) {
            console.error('Error fetching wallets:', error);
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
        const firstDay = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6));
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
    const totalIncome = filteredTransactions
        .filter(t => t.transaction_type === 1)
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filteredTransactions
        .filter(t => t.transaction_type === 2)
        .reduce((sum, t) => sum + t.amount, 0);

    const selectStyle = {
        padding: '8px 12px',
        borderRadius: '8px',
        border: `1px solid ${selectBorderColor}`,
        fontSize: '14px',
        minWidth: '150px',
        backgroundColor: selectBg,
        color: selectColor,
    };

    return (
        <Box maxW="7xl" mx="auto" px={4} py={8}>
            {/* Header with Stats */}
            <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'stretch', lg: 'center' }} mb={8} gap={4}>
                <Box>
                    <Heading as="h3" size="2xl" mb={2} fontWeight="bold" letterSpacing="tight">
                        Transactions
                    </Heading>
                    <HStack gap={4} flexWrap="wrap">
                        <Text color="gray.500" fontSize="sm">
                            {totalItems} transactions found
                        </Text>
                        {transactions.length > 0 && (
                            <Badge colorPalette="blue" variant="subtle" px={2} py={1}>
                                Page {page} of {totalPages}
                            </Badge>
                        )}
                    </HStack>
                </Box>
                <Group gap={2}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchTransactions}
                        isLoading={loading}
                    >
                        <Icon as={FiRefreshCw} />
                        Refresh
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = '/transaction'}
                        colorPalette="blue"
                    >
                        Add Transaction
                    </Button>
                </Group>
            </Flex>

            {/* Summary Cards */}
            {filteredTransactions.length > 0 && (
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={6}>
                    <Card.Root bg={cardBg} borderColor={borderColor} shadow="sm">
                        <Card.Body p={4}>
                            <Flex align="center" justify="space-between">
                                <Box>
                                    <Text fontSize="sm" color="gray.500" mb={1}>Total Income</Text>
                                    <Text fontSize="xl" fontWeight="bold" color={incomeColor}>
                                        {formatCurrency(totalIncome)}
                                    </Text>
                                </Box>
                                <Circle size="48px" bg={incomeBg}>
                                    <Icon as={FiTrendingUp} boxSize={6} color={incomeColor} />
                                </Circle>
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                    
                    <Card.Root bg={cardBg} borderColor={borderColor} shadow="sm">
                        <Card.Body p={4}>
                            <Flex align="center" justify="space-between">
                                <Box>
                                    <Text fontSize="sm" color="gray.500" mb={1}>Total Expense</Text>
                                    <Text fontSize="xl" fontWeight="bold" color={expenseColor}>
                                        {formatCurrency(totalExpense)}
                                    </Text>
                                </Box>
                                <Circle size="48px" bg={expenseBg}>
                                    <Icon as={FiTrendingDown} boxSize={6} color={expenseColor} />
                                </Circle>
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                    
                    <Card.Root bg={cardBg} borderColor={borderColor} shadow="sm">
                        <Card.Body p={4}>
                            <Flex align="center" justify="space-between">
                                <Box>
                                    <Text fontSize="sm" color="gray.500" mb={1}>Net Balance</Text>
                                    <Text fontSize="xl" fontWeight="bold" color={totalIncome - totalExpense >= 0 ? incomeColor : expenseColor}>
                                        {formatCurrency(totalIncome - totalExpense)}
                                    </Text>
                                </Box>
                                <Circle size="48px" bg={netBalanceBg}>
                                    <Icon as={FiPieChart} boxSize={6} color="blue.500" />
                                </Circle>
                            </Flex>
                        </Card.Body>
                    </Card.Root>
                </Grid>
            )}

            {/* Filters Card */}
            <Card.Root mb={6} p={5} bg={cardBg} borderColor={borderColor} shadow="sm">
                <Stack gap={5}>
                    {/* Search Bar */}
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
                            size="lg"
                            pl={12}
                            borderRadius="xl"
                            bg={selectBg}
                            borderColor={selectBorderColor}
                            _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                        />
                    </Box>

                    {/* Quick Date Filters */}
                    <Box>
                        <Text fontSize="sm" fontWeight="medium" mb={2}>Quick filters:</Text>
                        <Flex gap={2} flexWrap="wrap">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={setDateToday}
                                borderRadius="lg"
                            >
                                Today
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={setDateThisWeek}
                                borderRadius="lg"
                            >
                                This Week
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={setDateThisMonth}
                                borderRadius="lg"
                            >
                                This Month
                            </Button>
                        </Flex>
                    </Box>

                    <Separator />

                    <Flex gap={3} wrap="wrap" align="center">
                        {/* Date Range */}
                        <Flex align="center" gap={2}>
                            <Icon as={FiCalendar} color="gray.500" />
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(1);
                                }}
                                size="sm"
                                borderRadius="lg"
                                placeholder="Start Date"
                                bg={selectBg}
                                borderColor={selectBorderColor}
                                css={{
                                    "&::-webkit-calendar-picker-indicator": {
                                        filter: calendarIconFilter
                                    }
                                }}
                            />
                            <Text color="gray.500">to</Text>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPage(1);
                                }}
                                size="sm"
                                borderRadius="lg"
                                placeholder="End Date"
                                bg={selectBg}
                                borderColor={selectBorderColor}
                                css={{
                                    "&::-webkit-calendar-picker-indicator": {
                                        filter: calendarIconFilter
                                    }
                                }}
                            />
                        </Flex>

                        {/* Transaction Type */}
                        <select
                            value={transactionType}
                            onChange={(e) => {
                                setTransactionType(e.target.value);
                                setPage(1);
                            }}
                            style={selectStyle}
                        >
                            <option value="">All Types</option>
                            <option value="1">Income</option>
                            <option value="2">Expense</option>
                        </select>

                        {/* Category */}
                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                setPage(1);
                            }}
                            style={selectStyle}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>

                        {/* Wallet/Asset */}
                        <select
                            value={assetId}
                            onChange={(e) => {
                                setAssetId(e.target.value);
                                setPage(1);
                            }}
                            style={selectStyle}
                        >
                            <option value="">All Wallets</option>
                            {wallets.map(wallet => (
                                <option key={wallet.value} value={wallet.value}>{wallet.label}</option>
                            ))}
                        </select>

                        <Button variant="outline" onClick={handleClearFilters} size="sm" borderRadius="lg">
                            <Icon as={FiFilter} mr={2} />
                            Clear All
                        </Button>

                        <Box flex={1} />

                        {/* Items per page */}
                        <Flex gap={2} align="center">
                            <Text fontSize="sm" color="gray.600">Show:</Text>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
                                }}
                                style={selectStyle}
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                        </Flex>
                    </Flex>

                    {/* Active Filters */}
                    {(startDate || endDate || transactionType || categoryId || assetId || searchQuery) && (
                        <Flex gap={2} flexWrap="wrap" align="center">
                            <Text fontSize="sm" fontWeight="medium">Active filters:</Text>
                            {searchQuery && (
                                <Badge colorPalette="blue">Search: "{searchQuery}"</Badge>
                            )}
                            {startDate && (
                                <Badge colorPalette="blue">From: {startDate}</Badge>
                            )}
                            {endDate && (
                                <Badge colorPalette="blue">To: {endDate}</Badge>
                            )}
                            {transactionType && (
                                <Badge colorPalette={transactionType === '1' ? 'green' : 'red'}>
                                    {transactionType === '1' ? 'Income' : 'Expense'}
                                </Badge>
                            )}
                            {categoryId && (
                                <Badge colorPalette="purple">
                                    Category: {categories.find(c => c.value === categoryId)?.label}
                                </Badge>
                            )}
                            {assetId && (
                                <Badge colorPalette="orange">
                                    Wallet: {wallets.find(w => w.value === assetId)?.label}
                                </Badge>
                            )}
                        </Flex>
                    )}
                </Stack>
            </Card.Root>

            {/* Loading */}
            {loading && (
                <Flex justify="center" align="center" py={12}>
                    <Spinner size="xl" color="blue.500" />
                </Flex>
            )}

            {/* Error */}
            {error && (
                <Text color="red.500" textAlign="center">
                    Error: {error}
                </Text>
            )}

            {/* Transaction List - Grouped by Date */}
            {!loading && filteredTransactions.length > 0 ? (
                <>
                    <Stack gap={4} mb={4}>
                        {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                            <Box key={date}>
                                <Flex align="center" mb={3} gap={3}>
                                    <Text fontSize="sm" fontWeight="bold" color="gray.600">
                                        {date}
                                    </Text>
                                    <Separator flex="1" />
                                    <Badge colorPalette="gray" variant="subtle" size="sm">
                                        {dateTransactions.length} {dateTransactions.length === 1 ? 'transaction' : 'transactions'}
                                    </Badge>
                                </Flex>
                                
                                <Stack gap={2}>
                                    {dateTransactions.map((transaction) => (
                                        <Card.Root
                                            key={transaction.id}
                                            bg={cardBg}
                                            borderColor={borderColor}
                                            shadow="sm"
                                            _hover={{ 
                                                shadow: 'md',
                                                transform: 'translateY(-2px)',
                                                borderColor: 'blue.300'
                                            }}
                                            transition="all 0.2s"
                                            cursor="pointer"
                                        >
                                            <Card.Body p={4}>
                                                <Flex 
                                                    direction={{ base: 'column', md: 'row' }} 
                                                    align={{ base: 'stretch', md: 'center' }} 
                                                    justify="space-between"
                                                    gap={4}
                                                >
                                                    {/* Left Section - Time & Description */}
                                                    <Flex align="center" gap={3} flex={1}>
                                                        <Circle 
                                                            size="48px" 
                                                            bg={transaction.transaction_type === 1 ? incomeBg : expenseBg}
                                                        >
                                                            <Icon 
                                                                as={transaction.transaction_type === 1 ? FiArrowDown : FiArrowUp} 
                                                                boxSize={5} 
                                                                color={transaction.transaction_type === 1 ? incomeColor : expenseColor}
                                                            />
                                                        </Circle>
                                                        <VStack align="start" gap={1} flex={1}>
                                                            <Text fontSize="md" fontWeight="semibold">
                                                                {transaction.description || 'No description'}
                                                            </Text>
                                                            <HStack gap={2} flexWrap="wrap">
                                                                <Text fontSize="xs" color="gray.500">
                                                                    {new Date(transaction.date).toLocaleTimeString('id-ID', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </Text>
                                                                <Badge 
                                                                    colorPalette="purple" 
                                                                    variant="subtle" 
                                                                    size="sm"
                                                                >
                                                                    {transaction?.category_name || '-'}
                                                                </Badge>
                                                                <Badge 
                                                                    colorPalette="orange" 
                                                                    variant="subtle" 
                                                                    size="sm"
                                                                >
                                                                    {transaction?.asset_name || '-'}
                                                                </Badge>
                                                            </HStack>
                                                        </VStack>
                                                    </Flex>

                                                    {/* Right Section - Amount */}
                                                    <Box textAlign={{ base: 'left', md: 'right' }}>
                                                        <Text
                                                            fontSize="2xl"
                                                            fontWeight="bold"
                                                            color={transaction.transaction_type === 1 ? incomeColor : expenseColor}
                                                        >
                                                            {transaction.transaction_type === 1 ? '+' : '-'}
                                                            {formatCurrency(transaction.amount)}
                                                        </Text>
                                                        <Text fontSize="xs" color="gray.500">
                                                            {transaction.transaction_type === 1 ? 'Income' : 'Expense'}
                                                        </Text>
                                                    </Box>
                                                </Flex>
                                            </Card.Body>
                                        </Card.Root>
                                    ))}
                                </Stack>
                            </Box>
                        ))}
                    </Stack>

                    {/* Pagination */}
                    <Card.Root p={4} bg={cardBg} borderColor={borderColor} shadow="sm">
                        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                            <Text fontSize="sm" color="gray.600">
                                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems}
                            </Text>
                            <Flex gap={2} flexWrap="wrap">
                                <Button
                                    size="sm"
                                    onClick={() => setPage(1)}
                                    disabled={page === 1}
                                    variant="outline"
                                    borderRadius="lg"
                                >
                                    First
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    variant="outline"
                                    borderRadius="lg"
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
                                                colorPalette={page === pageNum ? 'blue' : 'gray'}
                                                variant={page === pageNum ? 'solid' : 'outline'}
                                                borderRadius="lg"
                                                minW="40px"
                                                fontWeight={page === pageNum ? 'bold' : 'normal'}
                                            >
                                                {pageNum}
                                            </Button>
                                        );
                                    })}
                                </Flex>
                                <Button
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    variant="outline"
                                    borderRadius="lg"
                                >
                                    Next
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setPage(totalPages)}
                                    disabled={page === totalPages}
                                    variant="outline"
                                    borderRadius="lg"
                                >
                                    Last
                                </Button>
                            </Flex>
                        </Flex>
                    </Card.Root>
                </>
            ) : !loading && (
                <Card.Root p={12} bg={cardBg} borderColor={borderColor} textAlign="center" shadow="sm">
                    <VStack gap={4}>
                        <Circle size="80px" bg="gray.100" color="gray.300">
                            <Icon as={FiPieChart} boxSize={10} />
                        </Circle>
                        <Box>
                            <Heading size="lg" color="gray.600" mb={2}>
                                No transactions found
                            </Heading>
                            <Text color="gray.500" fontSize="md" mb={1}>
                                {searchQuery ? `No results matching "${searchQuery}"` : 'Try adjusting your filters or add a new transaction to get started.'}
                            </Text>
                            {searchQuery && (
                                <Button 
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSearchQuery('')}
                                    mt={2}
                                >
                                    Clear search
                                </Button>
                            )}
                        </Box>
                        <Button 
                            colorPalette="blue" 
                            onClick={() => window.location.href = '/transaction'}
                            size="lg"
                            borderRadius="xl"
                        >
                            Add Transaction
                        </Button>
                    </VStack>
                </Card.Root>
            )}
        </Box>
    );
}
