import React from 'react'
import { useState, useEffect, useCallback } from 'react'
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
  SimpleGrid,
  VStack,
  HStack,
  Spacer,
} from "@chakra-ui/react";
import { toaster } from "./../../components/ui/toaster"
import { useColorModeValue } from '../../components/ui/color-mode';
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


     const fetchBanks = useCallback(async () => {
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
     }, [page, pageSize, search, filterBankName, filterColor, sortBy, sortDir]);

   useEffect(() => {
     fetchBanks();
   }, [fetchBanks]);

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

    // const handleSort = (field) => {
    //   if (sortBy === field) {
    //     setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    //   } else {
    //     setSortBy(field);
    //     setSortDir('asc');
    //   }
    //   setPage(1);
    // };

    const handleClearFilters = () => {
      setSearch('');
      setSearchInput('');
      setFilterBankName('');
      setFilterColor('');
      setSortBy('');
      setSortDir('asc');
      setPage(1);
    };

    const bgGradient = useColorModeValue('linear(to-br, blue.50, purple.50)', 'linear(to-br, gray.900, blue.900)');
    const cardBg = useColorModeValue('white', 'gray.800');
    const textGray600 = useColorModeValue('gray.600', 'gray.400');
    // const textGray400 = useColorModeValue('gray.400', 'gray.400');
    const textGray500 = useColorModeValue('gray.500', 'gray.400');
    const textGray700 = useColorModeValue('gray.700', 'gray.300');
    const textGray900 = useColorModeValue('gray.900', 'gray.100');
    // const textGray300 = useColorModeValue('gray.300', 'gray.300');

    return (
      <>
        <Box 
          maxW="7xl" 
          mx="auto" 
          px={{ base: 4, md: 8 }} 
          py={{ base: 6, md: 10 }}
          bgGradient={bgGradient}
          minH="100vh"
        >
          <Stack spacing={8}>
            <Flex justify="space-between" align="center" pb={4}>
              <Box>
                <Heading 
                  as="h3" 
                  size="2xl" 
                  fontWeight="bold" 
                  bgGradient="to-r" 
                  gradientFrom="blue.600" 
                  gradientTo="purple.600"
                  bgClip="text"
                >
                  Bank Management
                </Heading>
                <Text color="gray.500" fontSize="md" mt={2}>
                  {totalItems} {totalItems === 1 ? 'bank' : 'banks'} in your portfolio
                </Text>
              </Box>
              <Button 
                size="lg"
                onClick={() => setModal(true)}
                bgGradient="to-r"
                gradientFrom="blue.500"
                gradientTo="purple.500"
                color="white"
                _hover={{ 
                  bgGradient: "to-r",
                  gradientFrom: "blue.600",
                  gradientTo: "purple.600",
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                transition="all 0.3s"
                boxShadow="md"
                rounded="xl"
                px={8}
              >
                Add New Bank
              </Button>
            </Flex>

            <Card.Root p={6} rounded="2xl" boxShadow="xl" bg={cardBg}>
              <VStack spacing={6}>
                <HStack w="full" spacing={3}>
                  <Input
                    placeholder="Search banks by name or color..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    flex={1}
                    size="lg"
                    rounded="xl"
                    focusBorderColor="blue.500"
                    _focus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                  />
                  <Button 
                    onClick={handleSearch}
                    bgGradient="to-r"
                    gradientFrom="blue.500"
                    gradientTo="blue.600"
                    color="white"
                    size="lg"
                    px={8}
                    rounded="xl"
                    _hover={{ 
                      transform: "translateY(-1px)",
                      boxShadow: "md"
                    }}
                    transition="all 0.2s"
                  >
                    Search
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    size="lg"
                    px={6}
                    rounded="xl"
                    _hover={{ bg: "gray.100" }}
                  >
                    Clear
                  </Button>
                </HStack>

                <HStack w="full" spacing={4} wrap="wrap">
                  <VStack align="start" spacing={1} flex={{ base: 1, md: "unset" }}>
                    <Text fontSize="sm" color={textGray600} fontWeight="medium">Filter by Name</Text>
                    <Input
                      placeholder="Bank name..."
                      value={filterBankName}
                      onChange={(e) => {
                        setFilterBankName(e.target.value);
                        setPage(1);
                      }}
                      w={{ base: "full", md: "220px" }}
                      size="md"
                      rounded="lg"
                    />
                  </VStack>
                  <VStack align="start" spacing={1} flex={{ base: 1, md: "unset" }}>
                    <Text fontSize="sm" color={textGray600} fontWeight="medium">Filter by Color</Text>
                    <Input
                      placeholder="Color..."
                      value={filterColor}
                      onChange={(e) => {
                        setFilterColor(e.target.value);
                        setPage(1);
                      }}
                      w={{ base: "full", md: "180px" }}
                      size="md"
                      rounded="lg"
                    />
                  </VStack>
                  <Spacer />
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" color={textGray600} fontWeight="medium">Items per page</Text>
                    <Box
                      bg="gray.100"
                      p={2}
                      rounded="lg"
                      _hover={{ bg: "gray.200" }}
                      transition="all 0.2s"
                    >
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setPage(1);
                        }}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          fontSize: '14px',
                          fontWeight: '500',
                          background: 'transparent',
                          cursor: 'pointer'
                        }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </Box>
                  </VStack>
                </HStack>

                {(search || filterBankName || filterColor || sortBy) && (
                  <HStack w="full" spacing={3} flexWrap="wrap">
                    <Text fontSize="sm" fontWeight="bold" color={textGray700}>Active filters:</Text>
                    {search && (
                      <Badge 
                        px={3} 
                        py={1} 
                        rounded="full" 
                        bg="blue.100" 
                        color="blue.700"
                        fontSize="sm"
                      >
                        Search: {search}
                      </Badge>
                    )}
                    {filterBankName && (
                      <Badge 
                        px={3} 
                        py={1} 
                        rounded="full" 
                        bg="green.100" 
                        color="green.700"
                        fontSize="sm"
                      >
                        Name: {filterBankName}
                      </Badge>
                    )}
                    {filterColor && (
                      <Badge 
                        px={3} 
                        py={1} 
                        rounded="full" 
                        bg="purple.100" 
                        color="purple.700"
                        fontSize="sm"
                      >
                        Color: {filterColor}
                      </Badge>
                    )}
                    {sortBy && (
                      <Badge 
                        px={3} 
                        py={1} 
                        rounded="full" 
                        bg="orange.100" 
                        color="orange.700"
                        fontSize="sm"
                      >
                        Sort: {sortBy} {sortDir === 'asc' ? '↑' : '↓'}
                      </Badge>
                    )}
                  </HStack>
                )}
              </VStack>
            </Card.Root>

            {loading && (
              <Flex justify="center" align="center" py={16}>
                <Stack align="center" spacing={4}>
                  <Spinner 
                    size="xl" 
                    thickness="4px"
                    color="blue.500"
                    emptyColor="gray.200"
                  />
                  <Text color="gray.500" fontSize="md">Loading banks...</Text>
                </Stack>
              </Flex>
            )}

            {error && (
              <Card.Root p={8} rounded="2xl" bg="red.50" borderColor="red.200">
                <Text color="red.600" textAlign="center" fontSize="lg" fontWeight="medium">
                  Error: {error}
                </Text>
              </Card.Root>
            )}

            {!loading && banks.length > 0 ? (
              <>
                <SimpleGrid 
                  columns={{ base: 1, md: 2, lg: 3 }} 
                  spacing={8}
                  gap={8}
                >
                  {banks.map((item) => (
                    <Card.Root 
                      key={item.id}
                      rounded="2xl"
                      overflow="hidden"
                      boxShadow="lg"
                      bg={cardBg}
                      transition="all 0.3s"
                      _hover={{ 
                        transform: "translateY(-4px)", 
                        boxShadow: "2xl" 
                      }}
                      m={0}
                    >
                      <Box 
                        h="100" 
                        bgGradient="to-r"
                        gradientFrom={item.color || "gray.400"}
                        gradientTo={item.color ? `${item.color}cc` : "gray.300"}
                        opacity={0.9}
                      />
                      <Box p={6}>
                        <VStack align="start" spacing={4}>
                           <Box w="full">
                             <Text 
                               fontSize="sm" 
                               color={textGray500} 
                               fontWeight="medium" 
                               mb={1}
                             >
                               Bank Name
                             </Text>
                             <Text 
                               fontSize="xl" 
                               fontWeight="bold" 
                               color={textGray900}
                             >
                               {item.bank_name}
                             </Text>
                           </Box>
                          
                          {/* <Divider /> */}

                           <Box w="full">
                             <Text 
                               fontSize="sm" 
                               color={textGray500} 
                               fontWeight="medium" 
                               mb={2}
                             >
                               Brand Color
                             </Text>
                             <HStack>
                               <Box
                                 w="12"
                                 h="12"
                                 rounded="xl"
                                 bg={item.color || "gray.300"}
                                 border="2px solid"
                                 borderColor="gray.200"
                                 shadow="md"
                               />
                                <Text fontSize="md" color={textGray700} fontFamily="mono">
                                 {item.color || 'N/A'}
                               </Text>
                             </HStack>
                           </Box>

                           <Box w="full">
                             <Text 
                               fontSize="sm" 
                               color={textGray500} 
                               fontWeight="medium" 
                               mb={2}
                             >
                               Logo Reference
                             </Text>
                            <Badge 
                              px={3} 
                              py={1} 
                              rounded="md" 
                              bg="gray.100" 
                              color="gray.700"
                              fontSize="sm"
                            >
                              {item.image || 'No logo'}
                            </Badge>
                          </Box>

                          <HStack w="full" pt={2}>
                            <Button
                              variant="outline"
                              colorScheme="red"
                              size="md"
                              onClick={() => handleDelete(item.id)}
                              w="full"
                              rounded="xl"
                              _hover={{ 
                                bg: "red.50",
                                transform: "translateY(-1px)"
                              }}
                              transition="all 0.2s"
                            >
                              Delete Bank
                            </Button>
                          </HStack>
                        </VStack>
                      </Box>
                    </Card.Root>
                  ))}
                </SimpleGrid>

                <Card.Root p={6} rounded="2xl" boxShadow="md" bg={cardBg}>
                  <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                    <Text fontSize="sm" color={textGray600}>
                      <Text as="span" fontWeight="bold" color={textGray900}>
                        {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalItems)}
                      </Text>
                      {' '}of{' '}
                      <Text as="span" fontWeight="bold" color={textGray900}>
                        {totalItems}
                      </Text>
                      {' '}entries
                    </Text>
                    <HStack spacing={2} flexWrap="wrap">
                      <Button
                        size="sm"
                        onClick={() => setPage(1)}
                        isDisabled={page === 1}
                        variant="outline"
                        rounded="lg"
                        _hover={{ bg: "gray.100" }}
                      >
                        First
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setPage(page - 1)}
                        isDisabled={page === 1}
                        variant="outline"
                        rounded="lg"
                        _hover={{ bg: "gray.100" }}
                      >
                        Prev
                      </Button>
                      <HStack spacing={1}>
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
                              w="10"
                              h="10"
                              onClick={() => setPage(pageNum)}
                              variant={page === pageNum ? 'solid' : 'outline'}
                              rounded="lg"
                              bg={page === pageNum ? 'blue.500' : undefined}
                              color={page === pageNum ? 'white' : undefined}
                              _hover={
                                page === pageNum 
                                  ? { bg: 'blue.600' } 
                                  : { bg: 'gray.100' }
                              }
                              fontWeight={page === pageNum ? 'bold' : 'normal'}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </HStack>
                      <Button
                        size="sm"
                        onClick={() => setPage(page + 1)}
                        isDisabled={page === totalPages}
                        variant="outline"
                        rounded="lg"
                        _hover={{ bg: "gray.100" }}
                      >
                        Next
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setPage(totalPages)}
                        isDisabled={page === totalPages}
                        variant="outline"
                        rounded="lg"
                        _hover={{ bg: "gray.100" }}
                      >
                        Last
                      </Button>
                    </HStack>
                  </Flex>
                </Card.Root>
              </>
            ) : !loading && (
              <Card.Root 
                p={16} 
                rounded="2xl" 
                boxShadow="lg"
                bg={cardBg}
                textAlign="center"
              >
                <VStack spacing={4}>
                  <Box
                    w="20"
                    h="20"
                    rounded="full"
                    bg="gray.100"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="4xl" color="gray.400">
                      🏦
                    </Text>
                  </Box>
                  <VStack spacing={2}>
                    <Text fontSize="xl" fontWeight="bold" color={textGray700}>
                      No banks found
                    </Text>
                    <Text fontSize="md" color={textGray500} maxW="md">
                      Try adjusting your filters or add a new bank to get started
                    </Text>
                  </VStack>
                  <Button
                    size="lg"
                    onClick={() => setModal(true)}
                    bgGradient="to-r"
                    gradientFrom="blue.500"
                    gradientTo="purple.500"
                    color="white"
                    rounded="xl"
                    px={8}
                    _hover={{ 
                      transform: "translateY(-2px)",
                      boxShadow: "lg"
                    }}
                    transition="all 0.3s"
                  >
                    Add Your First Bank
                  </Button>
                </VStack>
              </Card.Root>
            )}
          </Stack>
        </Box>
         <>
            <Dialog.Root lazyMount open={modal} onOpenChange={(e) => setModal(e.open)}>
                    <Portal>
                      <Dialog.Backdrop />
                      <Dialog.Positioner>
                        <Dialog.Content 
                          rounded="2xl" 
                          boxShadow="2xl"
                          bg={cardBg}
                          maxW="md"
                        >
                          <Dialog.Header p={6} pb={4}>
                            <Dialog.Title 
                              fontSize="2xl" 
                              fontWeight="bold"
                              bgGradient="to-r" 
                              gradientFrom="blue.500" 
                              gradientTo="purple.500"
                              bgClip="text"
                            >
                              Add New Bank
                            </Dialog.Title>
                          </Dialog.Header>
                          <Dialog.Body p={6}>
                            <VStack spacing={5}>
                              <Field.Root required>
                                <Field.Label 
                                  fontSize="sm" 
                                  fontWeight="medium" 
                                  mb={2}
                                  color={textGray700}
                                >
                                  Bank Name <Field.RequiredIndicator />
                                </Field.Label>
                                <Input 
                                  placeholder="Enter bank name" 
                                  value={bankName}
                                  onChange={(e) => setBankName(e.target.value)}
                                  size="lg"
                                  rounded="xl"
                                  focusBorderColor="blue.500"
                                  _focus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                                />
                              </Field.Root>
                              <Field.Root required>
                                <Field.Label 
                                  fontSize="sm" 
                                  fontWeight="medium" 
                                  mb={2}
                                  color={textGray700}
                                >
                                  Logo <Field.RequiredIndicator />
                                </Field.Label>
                                <Input 
                                  placeholder="Enter logo URL" 
                                  value={logo}
                                  onChange={(e) => setLogo(e.target.value)}
                                  size="lg"
                                  rounded="xl"
                                  focusBorderColor="blue.500"
                                  _focus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                                />
                              </Field.Root>
                              <Field.Root required>
                                <Field.Label 
                                  fontSize="sm" 
                                  fontWeight="medium" 
                                  mb={2}
                                  color={textGray700}
                                >
                                  Color <Field.RequiredIndicator />
                                </Field.Label>
                                <HStack w="full" spacing={3}>
                                  <Input 
                                    placeholder="Enter color code" 
                                    value={color}
                                    onChange={(e) => setColor(e.target.value)}
                                    size="lg"
                                    rounded="xl"
                                    focusBorderColor="blue.500"
                                    _focus={{ boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.2)" }}
                                  />
                                  <Box
                                    w="12"
                                    h="12"
                                    rounded="xl"
                                    bg={color || "gray.200"}
                                    border="2px solid"
                                    borderColor="gray.200"
                                    shadow="sm"
                                  />
                                </HStack>
                              </Field.Root>
                            </VStack>
                          </Dialog.Body>
                          <Dialog.Footer p={6} pt={4}>
                            <HStack w="full" justify="flex-end" spacing={3}>
                              <Dialog.ActionTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="lg"
                                  px={6}
                                  rounded="xl"
                                  _hover={{ bg: "gray.100" }}
                                >
                                  Cancel
                                </Button>
                              </Dialog.ActionTrigger>
                              <Button 
                                bgGradient="to-r"
                                gradientFrom="blue.500"
                                gradientTo="purple.500"
                                color="white"
                                size="lg"
                                px={8}
                                rounded="xl"
                                onClick={handleAddBank}
                                _hover={{ 
                                  transform: "translateY(-1px)",
                                  boxShadow: "md"
                                }}
                                transition="all 0.2s"
                              >
                                Save Bank
                              </Button>
                            </HStack>
                          </Dialog.Footer>
                          <Dialog.CloseTrigger asChild>
                            <CloseButton size="md" />
                          </Dialog.CloseTrigger>
                        </Dialog.Content>
                      </Dialog.Positioner>
                    </Portal>
            </Dialog.Root>
            </>
        </>
  );
}
