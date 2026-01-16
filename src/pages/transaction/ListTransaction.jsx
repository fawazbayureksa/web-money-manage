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
    Badge,
    Card,
    Input,
    Icon,
} from "@chakra-ui/react";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "../../components/ui/toaster";
import { useColorModeValue } from '../../components/ui/color-mode';
import { FiCalendar, FiFilter, FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function ListTransaction() {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [banks, setBanks] = useState([]);
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
    const [bankId, setBankId] = useState('');

    // Colors
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    const incomeColor = useColorModeValue('green.600', 'green.400');
    const expenseColor = useColorModeValue('red.600', 'red.400');
    const headerBg = useColorModeValue('gray.50', 'gray.700');
    const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100');
    const selectBg = useColorModeValue('white', 'gray.700');
    const selectColor = useColorModeValue('gray.800', 'white');
    const selectBorderColor = useColorModeValue('#E2E8F0', '#4A5568');

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, limit, startDate, endDate, transactionType, categoryId, bankId]);

    useEffect(() => {
        fetchCategories();
        fetchBanks();
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
            if (bankId) params.append('bank_id', bankId);

            const url = import.meta.env.VITE_API_URL + `transactions?${params.toString()}`;
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

    const fetchBanks = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = import.meta.env.VITE_API_URL + 'banks?page=1&page_size=100';
            const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
            const banksData = response.data.data?.data || response.data.data || [];
            setBanks(banksData.map(bank => ({
                label: bank.bank_name,
                value: String(bank.id)
            })));
        } catch (error) {
            console.error('Error fetching banks:', error);
        }
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setTransactionType('');
        setCategoryId('');
        setBankId('');
        setPage(1);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
                    <Heading as="h3" size="lg" mb={2}>
                        Transaction History
                    </Heading>
                    <Text color="gray.500" fontSize="sm">
                        Total: {totalItems} transactions
                    </Text>
                </Box>
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

                        {/* Bank */}
                        <select
                            value={bankId}
                            onChange={(e) => {
                                setBankId(e.target.value);
                                setPage(1);
                            }}
                            style={selectStyle}
                        >
                            <option value="">All Banks</option>
                            {banks.map(bank => (
                                <option key={bank.value} value={bank.value}>{bank.label}</option>
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
                    {(startDate || endDate || transactionType || categoryId || bankId) && (
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
                            {bankId && (
                                <Badge colorPalette="orange">
                                    Bank: {banks.find(b => b.value === bankId)?.label}
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
                    <Card.Root mb={4} overflow="hidden" bg={cardBg} borderColor={borderColor}>
                        <Table.Root>
                            <Table.Header>
                                <Table.Row bg={headerBg}>
                                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                                    <Table.ColumnHeader>Description</Table.ColumnHeader>
                                    <Table.ColumnHeader>Category</Table.ColumnHeader>
                                    <Table.ColumnHeader>Bank</Table.ColumnHeader>
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
                                            <Text fontSize="sm" fontWeight="medium">
                                                {formatDate(transaction.date)}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontWeight="medium">
                                                {transaction.description || '-'}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Badge colorPalette="gray" variant="subtle">
                                                {transaction?.category_name || '-'}
                                            </Badge>
                                        </Table.Cell>
                                        <Table.Cell>
                                            <Text fontSize="sm" color="gray.600">
                                                {transaction?.bank_name || '-'}
                                            </Text>
                                        </Table.Cell>
                                        <Table.Cell textAlign="right">
                                            <Flex align="center" justify="flex-end" gap={2}>
                                                <Icon
                                                    as={transaction.transaction_type === 1 ? FiArrowDown : FiArrowUp}
                                                    color={transaction.transaction_type === 1 ? incomeColor : expenseColor}
                                                />
                                                <Text
                                                    fontWeight="bold"
                                                    color={transaction.transaction_type === 1 ? incomeColor : expenseColor}
                                                >
                                                    {transaction.transaction_type === 1 ? '+' : '-'}
                                                    {formatCurrency(transaction.amount)}
                                                </Text>
                                            </Flex>
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Card.Root>

                    {/* Pagination */}
                    <Flex justify="space-between" align="center" mt={4}>
                        <Text fontSize="sm" color="gray.600">
                            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalItems)} of {totalItems} entries
                        </Text>
                        <Flex gap={2}>
                            <Button
                                size="sm"
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                variant="outline"
                            >
                                First
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
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
                                            colorPalette={page === pageNum ? 'blue' : 'gray'}
                                            variant={page === pageNum ? 'solid' : 'outline'}
                                            color={page === pageNum ? 'blue.500' : undefined}
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
                            >
                                Next
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                variant="outline"
                            >
                                Last
                            </Button>
                        </Flex>
                    </Flex>
                </>
            ) : !loading && (
                <Card.Root p={12} bg={cardBg} borderColor={borderColor}>
                    <Text textAlign="center" fontSize="lg" color="gray.500">
                        No transactions found. Try adjusting your filters or add a new transaction.
                    </Text>
                </Card.Root>
            )}
        </Box>
    );
}
