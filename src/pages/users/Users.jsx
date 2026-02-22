import React, { useState, useEffect, useCallback } from 'react';
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
  Stack,
  Badge,
  Card,
  NativeSelect
} from "@chakra-ui/react";
import Config from '../../components/axios/Config';
import axios from 'axios';
import { toaster } from "./../../components/ui/toaster";
import { FiSearch, FiEdit2, FiTrash2, FiChevronUp, FiChevronDown, FiX, FiUser } from 'react-icons/fi';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Pagination, Search, Filter, Sort states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterIsAdmin, setFilterIsAdmin] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      
      if (search) params.append('search', search);
      if (filterName) params.append('name', filterName);
      if (filterIsAdmin) params.append('is_admin', filterIsAdmin);
      if (sortBy) {
        params.append('sort_by', sortBy);
        params.append('sort_dir', sortDir);
      }

      const url = import.meta.env.VITE_API_URL + `users?${params.toString()}`;
      
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      
      setUsers(response.data.data?.data || []);
      setTotalPages(response.data.data?.total_pages || 1);
      setTotalItems(response.data.data?.total_items || 0);
    } catch (error) {
      console.error(error);
      setError(error.message);
      toaster.create({
        description: "Failed to fetch users",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, filterName, filterIsAdmin, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}users/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      toaster.create({
        description: "User deleted successfully",
        type: "success",
      });
      fetchUsers();
    } catch (error) {
      setError(error.message);
      toaster.create({
        description: "Failed to delete user",
        type: "error",
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(id);
    }
  };

  const handleEditOpen = (user) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setModal(true);
  };
  
  const handleUpdate = async () => {
    if (!name || !email) {
      toaster.create({ description: "Name and email are required", type: "error" });
      return;
    }
    
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}users/${editingId}`,
        { name, email },
        Config({ Authorization: `Bearer ${token}` })
      );
      toaster.create({ description: "User updated successfully", type: "success" });
      setModal(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toaster.create({ description: "Failed to update user", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
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
    setFilterName('');
    setFilterIsAdmin('');
    setSortBy('');
    setSortDir('asc');
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  return (
    <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} py={8}>
      {/* Header Section */}
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'start', sm: 'center' }} mb={8} gap={4}>
        <Box>
          <Heading as="h1" size="2xl" mb={2} color={{ base: 'gray.900', _dark: 'white' }} fontWeight="bold" letterSpacing="tight">
            User Management
          </Heading>
          <Text color={{ base: 'gray.500', _dark: 'gray.400' }} fontSize="md">
            View, search, and manage user accounts across the platform.
          </Text>
        </Box>
        <Badge size="lg" colorScheme="blue" variant="subtle" px={4} py={2} rounded="full" fontWeight="bold">
          {totalItems} Total Users
        </Badge>
      </Flex>

      {/* Modern Filter Toolbar */}
      <Card.Root mb={8} border="none" shadow="sm" rounded="2xl" bg={{ base: 'white', _dark: 'gray.800' }}>
        <Stack p={5} gap={5}>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} align={{ base: 'stretch', md: 'center' }}>
            <Flex flex={1} position="relative" align="center">
              <Box position="absolute" left={3} color="gray.400" zIndex={1}>
                <FiSearch />
              </Box>
              <Input
                placeholder="Search users by name or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                pl={10}
                size="lg"
                rounded="xl"
                variant="outline"
                focusRingColor="blue.500"
              />
            </Flex>
            <Flex gap={3} w={{ base: 'full', md: 'auto' }}>
              <Button onClick={handleSearch} size="lg" rounded="xl" bg="blue.600" color="white" _hover={{ bg: 'blue.700' }} px={8}>
                Search
              </Button>
              <Button size="lg" rounded="xl" variant="ghost" onClick={handleClearFilters} color={{ base: 'gray.600', _dark: 'gray.400' }} _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' }}}>
                <FiX /> Clear
              </Button>
            </Flex>
          </Flex>

          <Flex gap={4} wrap="wrap" align="center" justify="space-between">
            <Flex gap={4} wrap="wrap" flex={1}>
              <Box maxW="sm" w={{ base: 'full', sm: '200px' }}>
                <Input
                  placeholder="Filter by Name"
                  value={filterName}
                  onChange={(e) => {
                    setFilterName(e.target.value);
                    setPage(1);
                  }}
                  rounded="lg"
                  bg={{ base: 'gray.50', _dark: 'gray.900' }}
                  border="none"
                />
              </Box>
              <Box maxW="sm" w={{ base: 'full', sm: '200px' }}>
                <NativeSelect.Root rounded="lg">
                  <NativeSelect.Field
                    value={filterIsAdmin}
                    onChange={(e) => {
                      setFilterIsAdmin(e.target.value);
                      setPage(1);
                    }}
                    bg={{ base: 'gray.50', _dark: 'gray.900' }}
                    border="none"
                  >
                    <option value="">All Roles</option>
                    <option value="true">Admins Only</option>
                    <option value="false">Standard Users</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Box>
            </Flex>
            
            <Flex align="center" gap={3}>
              <Text fontSize="sm" fontWeight="medium" color="gray.500">Show:</Text>
              <NativeSelect.Root maxW="100px" rounded="lg">
                <NativeSelect.Field
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  bg={{ base: 'gray.50', _dark: 'gray.900' }}
                  border="none"
                >
                  <option value={5}>5 files</option>
                  <option value={10}>10 files</option>
                  <option value={20}>20 files</option>
                  <option value={50}>50 files</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </Flex>
          </Flex>

          {/* Active Filters Display */}
          {(search || filterName || filterIsAdmin || sortBy) && (
            <Flex gap={2} flexWrap="wrap" pt={2} borderTop="1px" borderColor={{ base: 'gray.100', _dark: 'gray.700' }}>
              <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wider" color="gray.400" alignSelf="center" mr={2}>
                Active Filters:
              </Text>
              {search && <Badge rounded="md" colorScheme="blue" variant="surface" px={2} py={1}>Search: {search}</Badge>}
              {filterName && <Badge rounded="md" colorScheme="green" variant="surface" px={2} py={1}>Name: {filterName}</Badge>}
              {filterIsAdmin && (
                <Badge rounded="md" colorScheme="purple" variant="surface" px={2} py={1}>
                  Role: {filterIsAdmin === 'true' ? 'Admin' : 'User'}
                </Badge>
              )}
              {sortBy && <Badge rounded="md" colorScheme="orange" variant="surface" px={2} py={1}>Sort: {sortBy} ({sortDir})</Badge>}
            </Flex>
          )}
        </Stack>
      </Card.Root>

      {/* Main Table Area */}
      {loading ? (
        <Card.Root border="none" shadow="sm" rounded="2xl" p={20} bg={{ base: 'white', _dark: 'gray.800' }}>
           <Flex direction="column" justify="center" align="center" gap={4}>
             <Spinner size="xl" color="blue.500" thickness="4px" />
             <Text color="gray.500" fontWeight="medium">Loading users data...</Text>
           </Flex>
        </Card.Root>
      ) : error ? (
        <Card.Root border="none" shadow="sm" rounded="2xl" p={12} bg="red.50" _dark={{ bg: 'red.900/20' }}>
          <Flex direction="column" align="center" gap={2}>
            <FiX size={40} color="var(--chakra-colors-red-500)" />
            <Text color="red.600" _dark={{ color: 'red.400' }} textAlign="center" fontWeight="bold">Oops! Something went wrong.</Text>
            <Text color="red.500" _dark={{ color: 'red.300' }}>{error}</Text>
          </Flex>
        </Card.Root>
      ) : users.length > 0 ? (
        <>
          <Card.Root border="none" shadow="sm" rounded="2xl" overflow="hidden" bg={{ base: 'white', _dark: 'gray.800' }} mb={6}>
            <Box overflowX="auto">
              <Table.Root variant="line">
                <Table.Header bg={{ base: 'gray.50', _dark: 'gray.900' }}>
                  <Table.Row>
                    <Table.ColumnHeader 
                      cursor="pointer" 
                      onClick={() => handleSort('name')}
                      py={4} px={6}
                      _hover={{ bg: { base: 'gray.100', _dark: 'gray.700' } }}
                      transition="background 0.2s"
                    >
                      <Flex align="center" gap={2} fontWeight="bold" textTransform="none" letterSpacing="normal" fontSize="sm" color={{ base: 'gray.500', _dark: 'gray.400' }}>
                        User Info <SortIcon field="name" />
                      </Flex>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader 
                      cursor="pointer" 
                      onClick={() => handleSort('email')}
                      py={4} px={6}
                      _hover={{ bg: { base: "gray.100", _dark: "gray.700" } }}
                      transition="background 0.2s"
                    >
                      <Flex align="center" gap={2} fontWeight="bold" textTransform="none" letterSpacing="normal" fontSize="sm" color={{ base: 'gray.500', _dark: 'gray.400' }}>
                        Email Address <SortIcon field="email" />
                      </Flex>
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py={4} px={6} fontWeight="bold" textTransform="none" letterSpacing="normal" fontSize="sm" color={{ base: 'gray.500', _dark: 'gray.400' }}>
                      Role
                    </Table.ColumnHeader>
                    <Table.ColumnHeader py={4} px={6} textAlign="right" fontWeight="bold" textTransform="none" letterSpacing="normal" fontSize="sm" color={{ base: 'gray.500', _dark: 'gray.400' }}>
                      Actions
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {users.map((user) => (
                    <Table.Row 
                      key={user.id} 
                      _hover={{ bg: { base: 'gray.50/80', _dark: 'whiteAlpha.50' } }}
                      transition="background 0.2s"
                    >
                      <Table.Cell py={4} px={6}>
                        <Flex align="center" gap={4}>
                          <Flex 
                            w={10} h={10} rounded="full" 
                            bg={user.is_admin ? { base: "purple.100", _dark: "purple.900/40" } : { base: "blue.100", _dark: "blue.900/40" }} 
                            color={user.is_admin ? { base: "purple.600", _dark: "purple.300" } : { base: "blue.600", _dark: "blue.300" }}
                            justify="center" align="center"
                            fontWeight="bold" fontSize="sm"
                            shadow="sm"
                          >
                            {getInitials(user.name)}
                          </Flex>
                          <Text fontWeight="semibold" color={{ base: 'gray.900', _dark: 'white' }}>
                            {user.name}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell py={4} px={6} color={{ base: 'gray.500', _dark: 'gray.400' }}>
                        {user.email}
                      </Table.Cell>
                      <Table.Cell py={4} px={6}>
                        {user.is_admin ? (
                          <Badge colorScheme="purple" variant="subtle" size="sm" rounded="full" px={2.5} py={1}>
                            <Box w={1.5} h={1.5} rounded="full" bg="purple.500" mr={1.5} />
                            Admin
                          </Badge>
                        ) : (
                          <Badge colorScheme="gray" variant="subtle" size="sm" rounded="full" px={2.5} py={1}>
                            <Box w={1.5} h={1.5} rounded="full" bg="gray.400" mr={1.5} />
                            Member
                          </Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell py={4} px={6} textAlign="right">
                        <Flex justify="flex-end" gap={2}>
                          <Button
                            variant="ghost"
                            colorScheme="blue"
                            size="sm"
                            rounded="lg"
                            w={9} p={0}
                            onClick={() => handleEditOpen(user)}
                            _hover={{ bg: { base: "blue.50", _dark: "blue.900/30" }, color: { base: "blue.600", _dark: "blue.300" } }}
                          >
                            <FiEdit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            colorScheme="red"
                            size="sm"
                            rounded="lg"
                            w={9} p={0}
                            onClick={() => handleDelete(user.id)}
                            _hover={{ bg: { base: "red.50", _dark: "red.900/30" }, color: { base: "red.600", _dark: "red.300" } }}
                          >
                            <FiTrash2 size={16} />
                          </Button>
                        </Flex>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          </Card.Root>

          {/* Pagination Controls */}
          <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="center" gap={4}>
            <Text fontSize="sm" color={{ base: 'gray.500', _dark: 'gray.400' }} fontWeight="medium">
              Showing <Text as="span" fontWeight="bold" color={{ base: 'gray.900', _dark: 'white' }}>{((page - 1) * pageSize) + 1}</Text> to <Text as="span" fontWeight="bold" color={{ base: 'gray.900', _dark: 'white' }}>{Math.min(page * pageSize, totalItems)}</Text> of <Text as="span" fontWeight="bold" color={{ base: 'gray.900', _dark: 'white' }}>{totalItems}</Text> results
            </Text>
            
            <Flex gap={1} bg={{ base: 'white', _dark: 'gray.800' }} p={1} rounded="xl" shadow="sm">
              <Button size="sm" variant="ghost" rounded="lg" onClick={() => setPage(1)} isDisabled={page === 1} color={{ _dark: 'gray.300' }}>
                First
              </Button>
              <Button size="sm" variant="ghost" rounded="lg" onClick={() => setPage(page - 1)} isDisabled={page === 1} color={{ _dark: 'gray.300' }}>
                Prev
              </Button>
              
              <Flex gap={1} display={{ base: 'none', md: 'flex' }}>
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = idx + 1;
                  else if (page <= 3) pageNum = idx + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + idx;
                  else pageNum = page - 2 + idx;
                  
                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      rounded="lg"
                      onClick={() => setPage(pageNum)}
                      variant={page === pageNum ? 'solid' : 'ghost'}
                      bg={page === pageNum ? 'blue.600' : 'transparent'}
                      color={page === pageNum ? 'white' : { base: 'gray.600', _dark: 'gray.300' }}
                      _hover={page === pageNum ? { bg: 'blue.700' } : { bg: { base: 'gray.100', _dark: 'gray.700' } }}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </Flex>
              
              <Button size="sm" variant="ghost" rounded="lg" onClick={() => setPage(page + 1)} isDisabled={page === totalPages} color={{ _dark: 'gray.300' }}>
                Next
              </Button>
              <Button size="sm" variant="ghost" rounded="lg" onClick={() => setPage(totalPages)} isDisabled={page === totalPages} color={{ _dark: 'gray.300' }}>
                Last
              </Button>
            </Flex>
          </Flex>
        </>
      ) : (
        <Card.Root border="none" shadow="sm" rounded="2xl" p={16} bg={{ base: 'white', _dark: 'gray.800' }}>
          <Flex direction="column" align="center" justify="center" gap={4} textAlign="center">
            <Box p={4} bg={{ base: 'gray.50', _dark: 'gray.700' }} rounded="full">
              <FiUser size={32} color="var(--chakra-colors-gray-400)" />
            </Box>
            <Heading size="md" color={{ base: 'gray.900', _dark: 'white' }}>No users found</Heading>
            <Text color={{ base: 'gray.500', _dark: 'gray.400' }} maxW="sm">
              Try adjusting your search query or filters to find what you're looking for.
            </Text>
            <Button onClick={handleClearFilters} mt={2} colorScheme="blue" variant="surface" rounded="xl">
              Clear all filters
            </Button>
          </Flex>
        </Card.Root>
      )}

      {/* Edit User Modal */}
      <Dialog.Root lazyMount open={modal} onOpenChange={(e) => setModal(e.open)}>
        <Portal>
          <Dialog.Backdrop bg="blackAlpha.400" backdropFilter="blur(4px)" />
          <Dialog.Positioner>
            <Dialog.Content rounded="2xl" shadow="xl" border="none" bg={{ base: 'white', _dark: 'gray.800' }}>
              <Dialog.Header pt={6} pb={4} px={6}>
                <Dialog.Title fontSize="xl" fontWeight="bold" color={{ base: 'gray.900', _dark: 'white' }}>Edit User Details</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body px={6} py={4}>
                <Stack gap={5}>
                  <Field.Root required>
                    <Field.Label fontWeight="medium" color={{ base: 'gray.700', _dark: 'gray.300' }}>Full Name</Field.Label>
                    <Input 
                      placeholder="Enter user's name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)} 
                      size="lg"
                      rounded="xl"
                      focusRingColor="blue.500"
                    />
                  </Field.Root>
                  <Field.Root required>
                    <Field.Label fontWeight="medium" color={{ base: 'gray.700', _dark: 'gray.300' }}>Email Address</Field.Label>
                    <Input 
                      type="email"
                      placeholder="Enter user's email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)} 
                      size="lg"
                      rounded="xl"
                      focusRingColor="blue.500"
                    />
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer pt={4} pb={6} px={6}>
                <Dialog.ActionTrigger asChild>
                  <Button variant="ghost" rounded="xl" size="lg" color={{ _dark: 'gray.300' }}>Cancel</Button>
                </Dialog.ActionTrigger>
                <Button 
                  bg="blue.600" color="white" _hover={{ bg: "blue.700" }} 
                  onClick={handleUpdate} 
                  loading={loading}
                  rounded="xl" size="lg" px={8}
                >
                  Save Changes
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="md" position="absolute" top={4} right={4} color="gray.400" _hover={{ color: 'gray.600', _dark: { color: 'gray.300' } }} />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

    </Box>
  );
}
