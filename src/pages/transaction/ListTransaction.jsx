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
} from "@chakra-ui/react";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "../../components/ui/toaster";
import { useColorModeValue } from '../../components/ui/color-mode';
import { FiCalendar, FiFilter, FiArrowUp, FiArrowDown, FiRefreshCw,FiPieChart } from 'react-icons/fi';

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

    // Colors
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const incomeColor = useColorModeValue('green.600', 'green.400');
    const expenseColor = useColorModeValue('red.600', 'red.400');
    const incomeBg = useColorModeValue('green.50', 'green.900');
    const expenseBg = useColorModeValue('red.50', 'red.900');
    const headerBg = useColorModeValue('gray.50', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
    const selectBg = useColorModeValue('white', 'gray.700');
    const selectColor = useColorModeValue('gray.800', 'white');
    const selectBorderColor = useColorModeValue('#E2E8F0', '#4A5568');

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
        setPage(1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

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
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Heading as="h3" size="lg" mb={2} fontWeight="bold">
                        Transaction History
                    </Heading>
                    <HStack gap={4}>
                        <Text color="gray.500" fontSize="sm">
                            Total: {totalItems} transactions
                        </Text>
                        {transactions.length > 0 && (
                            <Badge colorPalette="blue" variant="subtle" px={2} py={1}>
                                Page {page} of {totalPages}
                            </Badge>
                        )}
                    </HStack>
                </Box>
                <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<FiRefreshCw />}
                    onClick={fetchTransactions}
                    isLoading={loading}
                >
                    Refresh
                </Button>
            </Flex>

            {/* Filters Card */}
            <Card.Root mb={6} p={4} bg={cardBg} borderColor={borderColor}>
                <Stack gap={4}>
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
                                        filter: useColorModeValue("none", "invert(1)")
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
                                        filter: useColorModeValue("none", "invert(1)")
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

                        <Button variant="outline" onClick={handleClearFilters} size="sm">
                            <Icon as={FiFilter} mr={2} />
                            Clear Filters
                        </Button>

                        <Box flex={1} />

                        {/* Items per page */}
                        <Flex gap={2} align="center">
                            <Text fontSize="sm" color="gray.600">Items per page:</Text>
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
                    {(startDate || endDate || transactionType || categoryId || assetId) && (
                        <Flex gap={2} flexWrap="wrap" align="center">
                            <Text fontSize="sm" fontWeight="medium">Active filters:</Text>
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

            {/* Table */}
            {!loading && transactions.length > 0 ? (
                <>
                    <Card.Root mb={4} overflow="hidden" bg={cardBg} borderColor={borderColor} shadow="sm">
                        <Table.Root>
                            <Table.Header>
                                <Table.Row bg={headerBg}>
                                    <Table.ColumnHeader width="200px">Date & Time</Table.ColumnHeader>
                                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                                    <Table.ColumnHeader>Category</Table.ColumnHeader>
                                    <Table.ColumnHeader>Wallet / Asset</Table.ColumnHeader>
                                    <Table.ColumnHeader textAlign="right">Amount</Table.ColumnHeader>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {transactions.map((transaction) => (
                                    <Table.Row
                                        key={transaction.id}
                                        _hover={{ bg: hoverBg }}
                                        transition="background 0.2s"
                                    >
                                        <Table.Cell>
                                            <VStack align="start" gap={0}>
                                                <Text fontSize="sm" fontWeight="medium">
                                                    {new Date(transaction.date).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </Text>
                                                <Text fontSize="xs" color="gray.500">
                                                    {new Date(transaction.date).toLocaleTimeString('id-ID', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </Text>
                                            </VStack>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontWeight="medium" fontSize="sm">
                                                {transaction.description || '-'}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge 
                                                colorPalette="purple" 
                                                variant="subtle" 
                                                px={2} 
                                                py={1}
                                                borderRadius="md"
                                            >
                                                {transaction?.category_name || '-'}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Flex align="center" gap={2}>
                                                <Circle size="24px" bg="orange.100" color="orange.600">
                                                    <Icon as={FiPieChart} boxSize={5} />
                                                </Circle>
                                                <VStack align="start" gap={0} flex={1}>
                                                    <Text fontSize="sm" fontWeight="medium">
                                                        {transaction?.asset_name || '-'}
                                                    </Text>
                                                    {/* {transaction?.asset_balance !== undefined && (
                                                        <Text fontSize="xs" color="gray.500">
                                                            Balance: {formatCurrency(transaction.asset_balance)}
                                                        </Text>
                                                    )} */}
                                                </VStack>
                                            </Flex>
                                        </Table.Cell>
                                        <Table.Cell textAlign="right">
                                            <Flex 
                                                align="center" 
                                                justify="flex-end" 
                                                gap={2}
                                                bg={transaction.transaction_type === 1 ? incomeBg : expenseBg}
                                                py={2}
                                                px={3}
                                                borderRadius="lg"
                                            >
                                                <Circle 
                                                    size="24px" 
                                                    bg={transaction.transaction_type === 1 ? 'green.00' : 'red.500'} 
                                                    color="white"
                                                >
                                                    <Icon 
                                                        as={transaction.transaction_type === 1 ? FiArrowDown : FiArrowUp} 
                                                        boxSize={3} 
                                                    />
                                                </Circle>
                                                <VStack align="end" gap={0}>
                                                    <Text
                                                        fontSize="lg"
                                                        fontWeight="bold"
                                                        color={transaction.transaction_type === 1 ? incomeColor : expenseColor}
                                                    >
                                                        {transaction.transaction_type === 1 ? '+' : '-'}
                                                        {formatCurrency(transaction.amount)}
                                                    </Text>
                                                    <Text fontSize="xs" color="gray.500">
                                                        {transaction.transaction_type === 1 ? 'Income' : 'Expense'}
                                                    </Text>
                                                </VStack>
                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Card.Root>

                    {/* Pagination */}
                    <Flex justify="space-between" align="center" mt={4} flexWrap="wrap" gap={2}>
                        <Text fontSize="sm" color="gray.600">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} transactions
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
                                            minW="32px"
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
                </>
            ) : !loading && (
                <Card.Root p={12} bg={cardBg} borderColor={borderColor} textAlign="center">
                    <VStack gap={4}>
                        <Icon as={FiPieChart} boxSize={12} color="gray.300" />
                        <Box>
                            <Heading size="md" color="gray.600" mb={2}>
                                No transactions found
                            </Heading>
                            <Text color="gray.500">
                                Try adjusting your filters or add a new transaction to get started.
                            </Text>
                        </Box>
                        <Button 
                            colorPalette="blue" 
                            onClick={() => window.location.href = '/transaction'}
                        >
                            Add Transaction
                        </Button>
                    </VStack>
                </Card.Root>
            )}
        </Box>
    );
}
