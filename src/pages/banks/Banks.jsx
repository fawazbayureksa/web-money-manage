import React from 'react'
import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Spinner,
  Table,
  Text,
  Button,
  Dialog,
  Portal,
  CloseButton,
  Field,
  Input,
  Flex,
  IconButton,
  Stack,
  Badge,
  Card
} from "@chakra-ui/react";
import { toaster } from "./../../components/ui/toaster"
export default function Banks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState(null);
  const [bankName, setBankName] = useState('');
  const [logo, setLogo] = useState('');
  const [color, setColor] = useState('');
  
  // Pagination, Search, Filter, Sort states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterBankName, setFilterBankName] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');

  
  useEffect(() => {
    fetchBanks();
  }, [page, pageSize, search, filterBankName, filterColor, sortBy, sortDir]);

    const fetchBanks = async () => {
      setLoading(true);
      
      try {
        // Build query parameters
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
        let url = import.meta.env.VITE_API_URL + 'banks';
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setBanks(result.data.data || []);
        setTotalPages(result.data.total_pages || 1);
        setTotalItems(result.data.total_items || 0);
      } catch (error) {
        setError(error.message);
        toaster.create({
          description: "Failed to fetch banks",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    const handleAddBank = async () => {
      try {
        let body = {
          bank_name: bankName,
          image: logo,
          color: color,
        }

        const response = await fetch(import.meta.env.VITE_API_URL + 'banks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        toaster.create({
          description: "Create Bank Successful",
          type: "success",
        })
        setBanks([...banks, data.data]);
        setModal(false);
        setBankName('');
        setLogo('');
        setColor('');
      } catch (error) {
        toaster.create({
          description: "Create Bank Failed",
          type: "error",
        })
        setError(error.message);
      }
    }

    const deleteBank = async (id) => {
      try {
        let url = import.meta.env.VITE_API_URL + 'banks';
        const response = await fetch(`${url}/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        toaster.create({
          description: "Delete Bank Successful",
          type: "success",
        })
        fetchBanks();
      } catch (error) {
        setError(error.message);
      }
    };

    const handleDelete = (id) => {
      if (window.confirm('Are you sure you want to delete this bank?')) {
        deleteBank(id);
      }
    }

    const handleSearch = () => {
      setSearch(searchInput);
      setPage(1); // Reset to first page
    };

    const handleSort = (field) => {
      if (sortBy === field) {
        setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortDir('asc');
      }
      setPage(1);
    };

    const handleClearFilters = () => {
      setSearch('');
      setSearchInput('');
      setFilterBankName('');
      setFilterColor('');
      setSortBy('');
      setSortDir('asc');
      setPage(1);
    };

    return (
      <>
        <Box maxW="7xl" mx="auto" px={4} py={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading as="h3" size="lg" mb={2}>
              Bank Management
            </Heading>
            <Text color="gray.500" fontSize="sm">
              Total: {totalItems} banks
            </Text>
          </Box>
          <Button 
            size="md"
            onClick={() => setModal(true)}
            bg={{ base: 'blue.500', _dark: 'blue.600' }}
            color="white"
            _hover={{ bg: { base: 'blue.600', _dark: 'blue.700' } }}
          >
            + Add New Bank
          </Button>
        </Flex>

        {/* Search and Filters Card */}
        <Card.Root mb={6} p={4}>
          <Stack gap={4}>
            {/* Search Bar */}
            <Flex gap={2}>
              <Input
                placeholder="Search banks by name or color..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                flex={1}
              />
              <Button 
                onClick={handleSearch}
                bg={{ base: 'blue.500', _dark: 'blue.600' }}
                color="white"
                _hover={{ bg: { base: 'blue.600', _dark: 'blue.700' } }}
              >
                Search
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </Flex>

            {/* Filters Row */}
            <Flex gap={3} wrap="wrap">
              <Input
                placeholder="Filter by bank name"
                value={filterBankName}
                onChange={(e) => {
                  setFilterBankName(e.target.value);
                  setPage(1);
                }}
                maxW="250px"
              />
              <Input
                placeholder="Filter by color"
                value={filterColor}
                onChange={(e) => {
                  setFilterColor(e.target.value);
                  setPage(1);
                }}
                maxW="200px"
              />
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
            {(search || filterBankName || filterColor || sortBy) && (
              <Flex gap={2} flexWrap="wrap">
                <Text fontSize="sm" fontWeight="medium">Active filters:</Text>
                {search && (
                  <Badge colorScheme="blue">Search: {search}</Badge>
                )}
                {filterBankName && (
                  <Badge colorScheme="green">Bank: {filterBankName}</Badge>
                )}
                {filterColor && (
                  <Badge colorScheme="purple">Color: {filterColor}</Badge>
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

        {!loading && banks.length > 0 ? (
          <>
            <Card.Root mb={4}>
              <Table.Root>
                <Table.Header>
                  <Table.Row bg={{ base: "gray.50", _dark: "transparent" }}>
                    <Table.ColumnHeader 
                      cursor="pointer" 
                      onClick={() => handleSort('bank_name')}
                      _hover={{ bg: { base: "gray.100", _dark: "whiteAlpha.100" } }}
                    >
                      <Flex align="center" gap={2}>
                        Bank Name
                        {sortBy === 'bank_name' && (
                          <Text fontSize="xs">{sortDir === 'asc' ? '↑' : '↓'}</Text>
                        )}
                      </Flex>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader>Logo</Table.ColumnHeader>
                    <Table.ColumnHeader 
                      cursor="pointer" 
                      onClick={() => handleSort('color')}
                      _hover={{ bg: { base: "gray.100", _dark: "whiteAlpha.100" } }}
                    >
                      <Flex align="center" gap={2}>
                        Color
                        {sortBy === 'color' && (
                          <Text fontSize="xs">{sortDir === 'asc' ? '↑' : '↓'}</Text>
                        )}
                      </Flex>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                {banks.map((item) => (
                    <Table.Row key={item.id} _hover={{ bg: { base: "gray.50", _dark: "whiteAlpha.100" } }}>
                    <Table.Cell fontWeight="medium">{item.bank_name}</Table.Cell>
                    <Table.Cell>
                      <Badge colorScheme="gray" variant="subtle">{item.image || 'N/A'}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Flex align="center" gap={2}>
                        <Box
                          w="20px"
                          h="20px"
                          borderRadius="md"
                          bg={item.color}
                          border="1px solid"
                          borderColor="gray.300"
                        />
                        <Text fontSize="sm">{item.color}</Text>
                      </Flex>
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                        <Button
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
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
                        colorScheme={page === pageNum ? undefined : 'gray'}
                        variant={page === pageNum ? 'solid' : 'outline'}
                        bg={page === pageNum ? { base: 'blue.500', _dark: 'blue.600' } : undefined}
                        color={page === pageNum ? 'white' : undefined}
                        _hover={page === pageNum ? { bg: { base: 'blue.600', _dark: 'blue.700' } } : undefined}
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
                No banks found. Try adjusting your filters or add a new bank.
              </Text>
            </Card.Root>
        )}
        </Box>
         <>
            <Dialog.Root lazyMount open={modal} onOpenChange={(e) => setModal(e.open)}>
                    <Portal>
                      <Dialog.Backdrop />
                      <Dialog.Positioner>
                        <Dialog.Content>
                          <Dialog.Header>
                            <Dialog.Title>Edit</Dialog.Title>
                          </Dialog.Header>
                          <Dialog.Body>
                            <Field.Root required marginBottom={'20px'}>
                                <Field.Label>
                                    Bank Name <Field.RequiredIndicator />
                                </Field.Label>
                                <Input placeholder="Enter bank name" value={bankName}
                                onChange={(e) => setBankName(e.target.value)} />
                            </Field.Root>
                              <Field.Root required marginBottom={'20px'}>
                                <Field.Label>
                                    Logo <Field.RequiredIndicator />
                                </Field.Label>
                                <Input placeholder="Enter logo" value={logo}
                                onChange={(e) => setLogo(e.target.value)} />
                            </Field.Root>
                              <Field.Root required marginBottom={'20px'}>
                                <Field.Label>
                                    Color <Field.RequiredIndicator />
                                </Field.Label>
                                <Input placeholder="Enter Color" value={color}
                                onChange={(e) => setColor(e.target.value)} />
                            </Field.Root>
                          </Dialog.Body>
                          <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button variant="outline" colorScheme="blue" type="submit" onClick={handleAddBank}>Save</Button>
                          </Dialog.Footer>
                          <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                          </Dialog.CloseTrigger>
                        </Dialog.Content>
                      </Dialog.Positioner>
                    </Portal>
            </Dialog.Root>
            </>
        </>
  );
}
