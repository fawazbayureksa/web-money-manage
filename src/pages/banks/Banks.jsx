import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  Dialog,
  Portal,
  CloseButton,
  Field,
  Input,
  Flex,
  Badge,
  SimpleGrid,
  VStack,
  HStack,
  Image,
} from "@chakra-ui/react";
import { toaster } from "./../../components/ui/toaster";
import { useColorModeValue } from '../../components/ui/color-mode';
import { FiPlus, FiSearch, FiTrash2, FiCreditCard, FiEdit2 } from 'react-icons/fi';

// --- Custom Hook for Business Logic ---
export function useBankManagement(initialOptions = {}) {
  const initialPageSize = typeof initialOptions === 'number'
    ? initialOptions
    : (initialOptions?.pageSize || 10);
  const initialSortBy = (typeof initialOptions === 'object' && initialOptions?.sortBy) || '';
  const initialSortDir = (typeof initialOptions === 'object' && initialOptions?.sortDir) || 'asc';

  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [filterBankName, setFilterBankName] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState(initialSortDir);

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      if (search) params.append('search', search);
      if (filterBankName) params.append('bank_name', filterBankName);
      if (filterColor) params.append('color', filterColor);
      if (sortBy) {
        params.append('sort_by', sortBy);
        params.append('sort_dir', sortDir);
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}banks?${params.toString()}`);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json();
      setBanks(result.data.data || []);
      setTotalPages(result.data.total_pages || 1);
      setTotalItems(result.data.total_items || 0);
    } catch (err) {
      setError(err.message);
      toaster.create({ description: "Failed to fetch banks", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filterBankName, filterColor, sortBy, sortDir]);

  useEffect(() => {
    fetchBanks();
  }, [fetchBanks]);

  const saveBank = async (bankData, id = null) => {
    const token = localStorage.getItem('token');
    const url = id 
      ? `${import.meta.env.VITE_API_URL}banks/${id}`
      : `${import.meta.env.VITE_API_URL}banks`;
      
    const response = await fetch(url, {
      method: id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(bankData),
    });

    if (!response.ok) throw new Error('Network response was not ok');
    toaster.create({
      description: `Bank successfully ${id ? 'updated' : 'created'}`,
      type: "success",
    });
    fetchBanks();
  };

  const deleteBank = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}banks/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Network response was not ok');
      toaster.create({ description: "Bank successfully deleted", type: "success" });
      fetchBanks();
    } catch (err) {
      setError(err.message);
      toaster.create({ description: "Failed to delete bank", type: "error" });
    }
  };

  return {
    banks, loading, error, fetchBanks, saveBank, deleteBank,
    pagination: { page, setPage, pageSize, setPageSize, totalPages, totalItems },
    filters: { search, setSearch, filterBankName, setFilterBankName, filterColor, setFilterColor, sortBy, setSortBy, sortDir, setSortDir }
  };
}

// --- UI Components ---

const BankCard = ({ bank, onEdit, onDelete }) => {
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  
  return (
    <Flex 
      align="center" 
      justify="space-between" 
      p={4} 
      borderBottom="1px solid" 
      borderColor={useColorModeValue('gray.100', 'gray.800')}
      _hover={{ bg: useColorModeValue('gray.50', 'whiteAlpha.50') }}
      transition="background 0.2s"
    >
      <Flex align="center" gap={4}>
        {bank.image ? (
          <Image
            src={bank.image}
            alt={bank.bank_name}
            boxSize="40px"
            objectFit="contain"
            fallback={<FiCreditCard size={24} color="gray" />}
          />
        ) : (
          <Flex boxSize="40px" align="center" justify="center" bg={useColorModeValue('gray.100', 'gray.700')} borderRadius="md">
            <FiCreditCard size={20} color="gray" />
          </Flex>
        )}
        <Box>
          <Text fontWeight="600" fontSize="md">{bank.bank_name}</Text>
          <Flex align="center" gap={2} mt={0.5}>
            <Box w={2} h={2} borderRadius="full" bg={bank.color || 'gray.400'} />
            <Text fontSize="sm" color={subtitleColor} fontFamily="mono">
              {bank.color || 'No color'}
            </Text>
          </Flex>
        </Box>
      </Flex>
      
      <HStack gap={2}>
        <Button size="sm" variant="ghost" bg="blue.500" color="white" onClick={() => onEdit(bank)}>
          <FiEdit2 />
        </Button>
        <Button size="sm" variant="ghost" bg="blue.500" color="white" onClick={() => onDelete(bank.id)}>
          <FiTrash2 />
        </Button>
      </HStack>
    </Flex>
  );
};

const FilterBar = ({ filters, pagination }) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  const handleSearch = () => {
    filters.setSearch(searchInput);
    pagination.setPage(1);
  };

  const handleClear = () => {
    setSearchInput('');
    filters.setSearch('');
    filters.setFilterBankName('');
    filters.setFilterColor('');
    pagination.setPage(1);
  };

  return (
    <VStack align="stretch" gap={4} mb={8}>
      <Flex gap={4} wrap="wrap">
        <Input
          placeholder="Search banks..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          maxW="300px"
          variant="flushed"
          borderBottomColor={borderColor}
        />
        <Button onClick={handleSearch} variant="ghost" bg="blue.500" color="white">
          <FiSearch /> Search
        </Button>
        <Button onClick={handleClear} variant="ghost" bg="blue.500" color="white">
          Clear
        </Button>
      </Flex>
      
      {/* Active Filters */}
      {(filters.search || filters.filterBankName || filters.filterColor) && (
        <Flex gap={2}>
          {filters.search && <Badge colorPalette="blue">Search: {filters.search}</Badge>}
          {filters.filterBankName && <Badge colorPalette="green">Name: {filters.filterBankName}</Badge>}
          {filters.filterColor && <Badge colorPalette="purple">Color: {filters.filterColor}</Badge>}
        </Flex>
      )}
    </VStack>
  );
};

import BaseModal from '../../components/BaseModal';

const BankModal = ({ isOpen, onClose, onSave, editingBank }) => {
  const [bankName, setBankName] = useState('');
  const [logo, setLogo] = useState('');
  const [color, setColor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setBankName(editingBank?.bank_name || '');
      setLogo(editingBank?.image || '');
      setColor(editingBank?.color || '');
    }
  }, [isOpen, editingBank]);

  const handleSubmit = async () => {
    if (!bankName.trim()) {
      toaster.create({ description: "Please enter a bank name", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      await onSave({ bank_name: bankName, image: logo, color }, editingBank?.id);
      onClose();
    } catch (err) {
      // Error is handled in useBankManagement
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={editingBank ? 'Edit Bank Account' : 'Add New Bank Account'}
      confirmText={editingBank ? 'Save Changes' : 'Create Bank'}
      onConfirm={handleSubmit}
      isLoading={submitting}
    >
      <VStack gap={4}>
        <Field.Root required>
          <Field.Label>Bank Name</Field.Label>
          <Input value={bankName} onChange={(e) => setBankName(e.target.value)} variant="flushed" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Logo Image URL</Field.Label>
          <Input value={logo} onChange={(e) => setLogo(e.target.value)} variant="flushed" />
        </Field.Root>
        <Field.Root>
          <Field.Label>Brand Color Code</Field.Label>
          <Flex gap={4} align="center" w="full">
            <Input value={color} onChange={(e) => setColor(e.target.value)} variant="flushed" flex={1} />
            <Box w={8} h={8} borderRadius="md" bg={color || 'gray.100'} border="1px solid" borderColor="gray.200" />
          </Flex>
        </Field.Root>
      </VStack>
    </BaseModal>
  );
};

// --- Main Page Component ---
export default function Banks() {
  const { banks, loading, error, deleteBank, saveBank, pagination, filters } = useBankManagement();
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);

  const openAddModal = () => {
    setEditingBank(null);
    setModalOpen(true);
  };

  const openEditModal = (bank) => {
    setEditingBank(bank);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this bank?')) {
      deleteBank(id);
    }
  };

  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box minH="100vh" bg={useColorModeValue('white', 'gray.900')}>
      <Box maxW="5xl" mx="auto" px={{ base: 4, md: 8 }} py={12}>
          <Box>
            <Flex align="center" gap={2} mb={2}>
              {/* <Box w={2} h={2} borderRadius="full" bg="blue.500" /> */}
              <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="widest" color={subtitleColor}>
                Account Infrastructure
              </Text>
            </Flex>
            <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
             Bank Portfolio
            </Heading>
          </Box>

        {/* Filters */}
        <FilterBar filters={filters} pagination={pagination} />
         <Flex align="center" justify="end" gap={2} mb={2}>
          <Button onClick={openAddModal}  bg="blue.600" color="white"  borderRadius="md">
                <FiPlus style={{ marginRight: '8px' }} /> Add Bank
          </Button>
        </Flex>
        {/* Content */}
        {loading ? (
          <Flex justify="center" py={12}><Spinner size="xl" /></Flex>
        ) : error ? (
          <Text color="red.500">Error: {error}</Text>
        ) : banks.length > 0 ? (
          <Box mb={8}>
            {banks.map(bank => (
              <BankCard key={bank.id} bank={bank} onEdit={openEditModal} onDelete={handleDelete} />
            ))}
          </Box>
        ) : (
          <Flex direction="column" align="center" py={16} color="gray.500">
            <FiCreditCard size={48} opacity={0.5} style={{ marginBottom: '16px' }} />
            <Text fontSize="lg">No banks found.</Text>
          </Flex>
        )}

        {/* Pagination - Simplified */}
        {banks.length > 0 && (
          <Flex justify="space-between" align="center" mt={8} pt={4}>
            <Text fontSize="sm" color="gray.500">
              Showing {(pagination.page - 1) * pagination.pageSize + 1} to {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} banks
            </Text>
            <HStack gap={2}>
              <Button size="sm" variant="ghost" disabled={pagination.page === 1} onClick={() => pagination.setPage(p => p - 1)}>Previous</Button>
              <Text fontSize="sm" fontWeight="600" px={2}>{pagination.page}</Text>
              <Button size="sm" variant="ghost" disabled={pagination.page === pagination.totalPages} onClick={() => pagination.setPage(p => p + 1)}>Next</Button>
            </HStack>
          </Flex>
        )}
      </Box>

      <BankModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={saveBank} 
        editingBank={editingBank} 
      />
    </Box>
  );
}
