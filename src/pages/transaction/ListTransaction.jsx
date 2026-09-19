import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Flex, HStack, Heading, Spinner, Stack, Text, Button, VStack } from '@chakra-ui/react';
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from '../../components/ui/toaster';
import { useColorModeValue } from '../../components/ui/color-mode';
import { FiRefreshCw, FiPlus } from 'react-icons/fi';

import TransactionSummaryCards from './components/TransactionSummaryCards';
import TransactionFilters from './components/TransactionFilters';
import TransactionGroup from './components/TransactionGroup';
import TransactionPagination from './components/TransactionPagination';
import TransactionEmptyState from './components/TransactionEmptyState';

export default function ListTransaction() {
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [transactionType, setTransactionType] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [assetId, setAssetId] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const pageBg = useColorModeValue('gray.50', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const subtitleColor = useColorModeValue('gray.600', 'gray.400');

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
            const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
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
            toaster.create({ description: 'Failed to fetch transactions', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = import.meta.env.VITE_API_URL + 'categories';
            const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
            setCategories((response.data.data || []).map(cat => ({ label: cat.CategoryName, value: String(cat.ID) })));
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const fetchWallets = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = import.meta.env.VITE_API_URL + 'wallets';
            const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
            setWallets((response.data.data || []).map(w => ({ label: w.name, value: String(w.id), bankName: w.asset_name })));
        } catch (err) {
            console.error('Error fetching wallets:', err);
        }
    };

    const handleClearFilters = () => {
        setStartDate(''); setEndDate(''); setTransactionType('');
        setCategoryId(''); setAssetId(''); setSearchQuery(''); setPage(1);
    };

    const handleDatePreset = (preset) => {
        const today = new Date();
        if (preset === 'today') {
            const d = today.toISOString().split('T')[0];
            setStartDate(d); setEndDate(d);
        } else if (preset === 'week') {
            const dow = today.getDay();
            const first = new Date(today); first.setDate(today.getDate() - dow);
            const last = new Date(today); last.setDate(today.getDate() - dow + 6);
            setStartDate(first.toISOString().split('T')[0]);
            setEndDate(last.toISOString().split('T')[0]);
        } else if (preset === 'month') {
            const first = new Date(today.getFullYear(), today.getMonth(), 1);
            const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            setStartDate(first.toISOString().split('T')[0]);
            setEndDate(last.toISOString().split('T')[0]);
        }
        setPage(1);
    };

    const handlePageChange = (newPage) => setPage(newPage);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

    const filteredTransactions = transactions.filter((t) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            t.description?.toLowerCase().includes(q) ||
            t.category_name?.toLowerCase().includes(q) ||
            t.asset_name?.toLowerCase().includes(q) ||
            formatCurrency(t.amount).toLowerCase().includes(q)
        );
    });

    const groupedTransactions = filteredTransactions.reduce((groups, t) => {
        const date = new Date(t.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        if (!groups[date]) groups[date] = [];
        groups[date].push(t);
        return groups;
    }, {});

    const totalIncome = transactions.filter(t => t.transaction_type === 1).reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter(t => t.transaction_type === 2).reduce((s, t) => s + t.amount, 0);

    return (
        <Box minH="100vh" bg={pageBg}>
            <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>

                {/* Header */}
                <Flex
                    justify="space-between"
                    align={{ base: 'flex-start', sm: 'center' }}
                    direction={{ base: 'column', sm: 'row' }}
                    gap={4} mb={8} pb={6}
                    borderBottom="1px solid" borderColor={borderColor}
                >
                    <Box>
                        <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="widest" color={subtitleColor} mb={2}>
                            Transaction Ledger
                        </Text>
                        <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
                            Transaction History
                        </Heading>
                        <Text color={subtitleColor} fontSize="md">
                            Inspect, filter, and analyze all income and expense entries across your accounts.
                        </Text>
                    </Box>

                    <HStack gap={3}>
                        <Button variant="outline" size="md" onClick={fetchTransactions} loading={loading} borderRadius="xl">
                            <FiRefreshCw style={{ marginRight: '6px' }} />
                            Refresh
                        </Button>
                        <Button
                            onClick={() => navigate('/transaction')}
                            bg="blue.500" color="white" _hover={{ bg: 'blue.600' }}
                            size="md" borderRadius="xl" px={5} fontWeight="600" boxShadow="xs"
                        >
                            <FiPlus style={{ marginRight: '6px' }} />
                            Add Transaction
                        </Button>
                    </HStack>
                </Flex>

                {/* Summary cards */}
                {filteredTransactions.length > 0 && (
                    <TransactionSummaryCards
                        totalIncome={totalIncome}
                        totalExpense={totalExpense}
                        formatCurrency={formatCurrency}
                    />
                )}

                {/* Filters */}
                <TransactionFilters
                    searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                    startDate={startDate} setStartDate={(v) => { setStartDate(v); setPage(1); }}
                    endDate={endDate} setEndDate={(v) => { setEndDate(v); setPage(1); }}
                    transactionType={transactionType} setTransactionType={(v) => { setTransactionType(v); setPage(1); }}
                    categoryId={categoryId} setCategoryId={(v) => { setCategoryId(v); setPage(1); }}
                    assetId={assetId} setAssetId={(v) => { setAssetId(v); setPage(1); }}
                    limit={limit} setLimit={(v) => { setLimit(v); setPage(1); }}
                    categories={categories}
                    wallets={wallets}
                    onClearFilters={handleClearFilters}
                    onDatePreset={handleDatePreset}
                />

                {/* Loading */}
                {loading && (
                    <Flex justify="center" align="center" py={16}>
                        <VStack gap={3}>
                            <Spinner size="xl" color="blue.500" />
                            <Text color={subtitleColor} fontSize="sm">Loading transactions...</Text>
                        </VStack>
                    </Flex>
                )}

                {/* Error */}
                {error && !loading && (
                    <Box p={4} borderRadius="2xl" bg="red.50" border="1px solid" borderColor="red.200" mb={6}>
                        <Text color="red.600" fontSize="sm" textAlign="center">
                            Error fetching transactions: {error}
                        </Text>
                    </Box>
                )}

                {/* Transaction list */}
                {!loading && filteredTransactions.length > 0 ? (
                    <>
                        <Stack gap={6} mb={8}>
                            {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
                                <TransactionGroup
                                    key={date}
                                    date={date}
                                    transactions={dateTransactions}
                                    formatCurrency={formatCurrency}
                                />
                            ))}
                        </Stack>

                        <TransactionPagination
                            page={page}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            limit={limit}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : !loading && (
                    <TransactionEmptyState
                        searchQuery={searchQuery}
                        onClearSearch={() => setSearchQuery('')}
                    />
                )}

            </Box>
        </Box>
    );
}
