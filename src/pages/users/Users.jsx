import React from 'react'
import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Spinner,
  Table,
  Text,
  Button,
  useDisclosure,
  Dialog,
  Portal,
  CloseButton,
  Field,
  Input,
  Flex,
  Stack,
  Badge,
  Card
} from "@chakra-ui/react";
import Config from '../../components/axios/Config';
import axios from 'axios';
import { toaster } from "./../../components/ui/toaster";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
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
  
  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, search, filterName, filterIsAdmin, sortBy, sortDir]);

    const fetchUsers = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
     
      try {
        // Build query parameters
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
        
        let axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${token}` }))

        await axiosInstance.then(response => {
            setUsers(response.data.data.data || []);
            setTotalPages(response.data.data.total_pages || 1);
            setTotalItems(response.data.data.total_items || 0);
          }).catch(error => {
            console.error(error);
            setError(error.message);
            toaster.create({
              description: "Failed to fetch users",
              type: "error",
            });
          }).finally(() => {
            setLoading(false);
          });
      } catch (error) {
        console.error(error);
        setError(error.message);
        setLoading(false);
      }
    };

    const deleteUser = async (id) => {
      try {
        const response = await fetch(`http://localhost:8080/api/users/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        fetchUsers();
      } catch (error) {
        setError(error.message);
      }
    };

    const handleDelete = (id) => {
      if (window.confirm('Are you sure you want to delete this user?')) {
        deleteUser(id);
      }
    }

    const handleEdit = (id, data) => {
      setModal(true)
      setName(data.name)
      setEmail(data.email)
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
      setFilterName('');
      setFilterIsAdmin('');
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
            User Management
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Total: {totalItems} users
          </Text>
        </Box>
      </Flex>

      {/* Search and Filters Card */}
      <Card.Root mb={6} p={4}>
        <Stack gap={4}>
          {/* Search Bar */}
          <Flex gap={2}>
            <Input
              placeholder="Search users by name or email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              flex={1}
            />
            <Button colorScheme="blue" onClick={handleSearch}>
              Search
            </Button>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </Flex>

          {/* Filters Row */}
          <Flex gap={3} wrap="wrap">
            <Input
              placeholder="Filter by name"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                setPage(1);
              }}
              maxW="250px"
            />
            <select
              value={filterIsAdmin}
              onChange={(e) => {
                setFilterIsAdmin(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                fontSize: '14px',
                minWidth: '150px'
              }}
            >
              <option value="">All Users</option>
              <option value="true">Admin Only</option>
              <option value="false">Non-Admin</option>
            </select>
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
          {(search || filterName || filterIsAdmin || sortBy) && (
            <Flex gap={2} flexWrap="wrap">
              <Text fontSize="sm" fontWeight="medium">Active filters:</Text>
              {search && (
                <Badge colorScheme="blue">Search: {search}</Badge>
              )}
              {filterName && (
                <Badge colorScheme="green">Name: {filterName}</Badge>
              )}
              {filterIsAdmin && (
                <Badge colorScheme="purple">
                  {filterIsAdmin === 'true' ? 'Admin Only' : 'Non-Admin'}
                </Badge>
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

      {!loading && users.length > 0 ? (
        <>
          <Card.Root mb={4}>
            <Table.Root>
              <Table.Header>
                <Table.Row bg="gray.50">
                  <Table.ColumnHeader 
                    cursor="pointer" 
                    onClick={() => handleSort('name')}
                    _hover={{ bg: 'gray.100' }}
                  >
                    <Flex align="center" gap={2}>
                      Name
                      {sortBy === 'name' && (
                        <Text fontSize="xs">{sortDir === 'asc' ? '↑' : '↓'}</Text>
                      )}
                    </Flex>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader 
                    cursor="pointer" 
                    onClick={() => handleSort('email')}
                    _hover={{ bg: 'gray.100' }}
                  >
                    <Flex align="center" gap={2}>
                      Email
                      {sortBy === 'email' && (
                        <Text fontSize="xs">{sortDir === 'asc' ? '↑' : '↓'}</Text>
                      )}
                    </Flex>
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="center">Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.map((user) => (
                  <Table.Row key={user.id} _hover={{ bg: 'gray.50' }}>
                    <Table.Cell fontWeight="medium">{user.name}</Table.Cell>
                    <Table.Cell color="gray.600">{user.email}</Table.Cell>
                    <Table.Cell>
                      {user.is_admin ? (
                        <Badge colorScheme="purple">Admin</Badge>
                      ) : (
                        <Badge colorScheme="gray">User</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      {/* <Button
                        variant="ghost"
                        colorScheme="blue"
                        size="sm"
                        mr={2}
                        onClick={() => handleEdit(user.id, {name: user.name, email: user.email})}
                      >
                        Edit
                      </Button> */}
                      <Button
                        variant="ghost"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
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
                      colorScheme={page === pageNum ? 'blue' : 'gray'}
                      variant={page === pageNum ? 'solid' : 'outline'}
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
              No users found. Try adjusting your filters.
            </Text>
          </Card.Root>
      )}
    </Box>
  {/* {modal && ( */}
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
                            Name <Field.RequiredIndicator />
                        </Field.Label>
                        <Input placeholder="Enter your name" value={name}
                        onChange={(e) => setName(e.target.value)} />
                    </Field.Root>
                      <Field.Root required marginBottom={'20px'}>
                        <Field.Label>
                            Email <Field.RequiredIndicator />
                        </Field.Label>
                        <Input placeholder="Enter your email" value={email}
                        onChange={(e) => setEmail(e.target.value)} />
                    </Field.Root>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </Dialog.ActionTrigger>
                    <Button variant="outline" colorScheme="blue" type="submit">Save</Button>
                  </Dialog.Footer>
                  <Dialog.CloseTrigger asChild>
                    <CloseButton size="sm" />
                  </Dialog.CloseTrigger>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
    </Dialog.Root>
    </>
  {/* )} */}
  </>
  );

}
