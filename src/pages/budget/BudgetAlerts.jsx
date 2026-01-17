import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  Flex,
  Stack,
  Badge,
  Card,
  Grid,
  GridItem,
  Circle,
  VStack,
  HStack,
  Input
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTriangleExclamation, 
  FaCircleInfo, 
  FaBell,
  FaArrowRight,
  FaCheckDouble
} from "react-icons/fa6";
import { api } from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";

const MotionBox = motion(Box);
const MotionStack = motion(Stack);

export default function BudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Sort states
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    fetchAlerts();
  }, [showUnreadOnly, page, pageSize, sortBy, sortDir]);

  const fetchAlerts = async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        sort_by: sortBy,
        sort_dir: sortDir
      });
      
      if (showUnreadOnly) {
        params.append('unread_only', 'true');
      }

      const response = await api.get(`budget-alerts?${params.toString()}`);

      setAlerts(response.data.data?.data || []);
      setTotalPages(response.data.data?.total_pages || 1);
      setTotalItems(response.data.data?.total_items || 0);
    } catch (error) {
      console.error(error);
      setError(error.message);
      toaster.create({
        description: "Failed to fetch alerts",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (alertId) => {
    try {
      await api.put(`budget-alerts/${alertId}/read`, {});

      toaster.create({
        description: "Alert marked as read",
        type: "success",
      });

      // Optimistic update
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, is_read: true } : a));
    } catch (error) {
      console.error(error);
      toaster.create({
        description: "Failed to mark alert as read",
        type: "error",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(alert => !alert.is_read);
      
      await Promise.all(
        unreadAlerts.map(alert =>
          api.put(`budget-alerts/${alert.id}/read`, {})
        )
      );

      toaster.create({
        description: "All alerts marked as read",
        type: "success",
      });

      fetchAlerts();
    } catch (error) {
      console.error(error);
      toaster.create({
        description: "Failed to mark all alerts as read",
        type: "error",
      });
    }
  };

  const getAlertConfig = (percentage) => {
    if (percentage >= 100) return { color: 'red', icon: FaTriangleExclamation, label: 'Critical' };
    if (percentage >= 90) return { color: 'orange', icon: FaBell, label: 'Warning' };
    return { color: 'blue', icon: FaCircleInfo, label: 'Info' };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = useMemo(() => {
    const total = totalItems;
    const unread = alerts.filter(a => !a.is_read).length;
    const critical = alerts.filter(a => a.percentage >= 100).length;
    return { total, unread, critical };
  }, [alerts, totalItems]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <Box maxW="7xl" mx="auto" px={4} py={8}>
      {/* Header Section */}
      <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={8} gap={4}>
        <Box>
          <HStack gap={3} mb={1}>
            <Circle size="40px" bg="blue.500" color="white">
              <FaBell size={20} />
            </Circle>
            <Heading as="h3" size="xl" fontWeight="black" letterSpacing="tight">
              Budget Alerts
            </Heading>
          </HStack>
          <Text color={{ base: 'gray.500', _dark: 'gray.400' }} fontSize="md">
            Manage and track your spending notifications
          </Text>
        </Box>
        <Flex gap={3} w={{ base: 'full', md: 'auto' }}>
          <Button
            flex={{ base: 1, md: 'initial' }}
            variant={showUnreadOnly ? 'solid' : 'surface'}
            colorPalette={showUnreadOnly ? 'blue' : 'gray'}
            size="md"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          >
            {showUnreadOnly ? 'Showing Unread' : 'Filter Unread'}
          </Button>
          {stats.unread > 0 && (
            <Button
              flex={{ base: 1, md: 'initial' }}
              variant="subtle"
              colorPalette="green"
              size="md"
              onClick={markAllAsRead}
            >
              <HStack gap={2}>
                <FaCheckDouble />
                <Text>Mark All Read</Text>
              </HStack>
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Stats Section */}
      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6} mb={10}>
        <GridItem>
          <Card.Root bg={{ base: 'white', _dark: 'gray.800' }} border="none" shadow="sm" borderRadius="2xl" overflow="hidden">
            <Card.Body p={5}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={1}>Total Alerts</Text>
                  <Text fontSize="3xl" fontWeight="black">{stats.total}</Text>
                </Box>
                <Circle size="50px" bg="blue.50" color="blue.500" _dark={{ bg: 'blue.900/30' }}>
                  <FaBell size={24} />
                </Circle>
              </Flex>
            </Card.Body>
          </Card.Root>
        </GridItem>
        <GridItem>
          <Card.Root bg={{ base: 'white', _dark: 'gray.800' }} border="none" shadow="sm" borderRadius="2xl" overflow="hidden">
            <Card.Body p={5}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={1}>Unread</Text>
                  <Text fontSize="3xl" fontWeight="black" color="orange.500">{stats.unread}</Text>
                </Box>
                <Circle size="50px" bg="orange.50" color="orange.500" _dark={{ bg: 'orange.900/30' }}>
                  <FaCircleInfo size={24} />
                </Circle>
              </Flex>
            </Card.Body>
          </Card.Root>
        </GridItem>
        <GridItem>
          <Card.Root bg={{ base: 'white', _dark: 'gray.800' }} border="none" shadow="sm" borderRadius="2xl" overflow="hidden">
            <Card.Body p={5}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="sm" fontWeight="bold" color="gray.500" mb={1}>Critical</Text>
                  <Text fontSize="3xl" fontWeight="black" color="red.500">{stats.critical}</Text>
                </Box>
                <Circle size="50px" bg="red.50" color="red.500" _dark={{ bg: 'red.900/30' }}>
                  <FaTriangleExclamation size={24} />
                </Circle>
              </Flex>
            </Card.Body>
          </Card.Root>
        </GridItem>
      </Grid>

      {loading && (
        <Flex justify="center" align="center" py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" thickness="4px" />
            <Text fontWeight="medium" color="gray.500">Fetching your alerts...</Text>
          </VStack>
        </Flex>
      )}

      {error && (
        <Box textAlign="center" py={10} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.100">
          <Text color="red.600" fontWeight="bold">Error: {error}</Text>
          <Button mt={4} colorPalette="red" variant="subtle" onClick={fetchAlerts}>Try Again</Button>
        </Box>
      )}

      {!loading && alerts.length > 0 ? (
        <>
        <MotionStack 
          gap={4}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {alerts.map((alert) => {
            const config = getAlertConfig(alert.percentage);
            return (
              <MotionBox key={alert.id} variants={itemVariants}>
                <Card.Root
                  overflow="hidden"
                  variant="elevated"
                  bg={{ 
                    base: alert.is_read ? 'white' : `${config.color}.50`, 
                    _dark: alert.is_read ? 'gray.800' : `${config.color}.900/20` 
                  }}
                  border="1px solid"
                  borderColor={{
                    base: alert.is_read ? 'gray.100' : `${config.color}.200`,
                    _dark: alert.is_read ? 'gray.700' : `${config.color}.800`
                  }}
                  borderRadius="2xl"
                  transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
                  _hover={{ 
                    transform: 'translateY(-4px)',
                    shadow: 'xl',
                    borderColor: `${config.color}.400`
                  }}
                  position="relative"
                >
                  {!alert.is_read && (
                    <Box 
                      position="absolute" 
                      top={0} 
                      left={0} 
                      bottom={0} 
                      w="5px" 
                      bg={`${config.color}.500`}
                    />
                  )}
                  <Card.Body p={5}>
                    <Flex justify="space-between" align={{ base: 'flex-start', sm: 'center' }} direction={{ base: 'column', sm: 'row' }} gap={4}>
                      <Flex align="flex-start" gap={4} flex={1}>
                        <Circle size="48px" bg={`${config.color}.100`} color={`${config.color}.600`} _dark={{ bg: `${config.color}.900/40`, color: `${config.color}.300` }}>
                          <config.icon size={22} />
                        </Circle>
                        <Box>
                          <HStack gap={2} mb={1} flexWrap="wrap">
                            <Badge colorPalette={config.color} variant="solid" borderRadius="full" px={3}>
                              {alert.percentage.toFixed(1)}% Used
                            </Badge>
                            {config.label === 'Critical' && (
                              <Badge colorPalette="red" variant="subtle" borderRadius="full">Over Budget</Badge>
                            )}
                            {!alert.is_read && (
                              <Badge colorPalette="blue" variant="outline" borderRadius="full">New</Badge>
                            )}
                          </HStack>
                          
                          <Text fontWeight="bold" fontSize="lg" mb={1} color={alert.is_read ? 'gray.600' : 'inherit'} _dark={{ color: alert.is_read ? 'gray.400' : 'white' }}>
                            {alert.message}
                          </Text>
                          
                          <Flex gap={4} fontSize="sm" color="gray.500" fontWeight="medium">
                            <Text display="flex" align="center" gap={1}>
                              Spent: <Text as="span" color="gray.900" _dark={{ color: 'gray.100' }}>Rp {alert.spent_amount?.toLocaleString('id-ID')}</Text>
                            </Text>
                            <Text>•</Text>
                            <Text>{formatDate(alert.created_at)}</Text>
                          </Flex>
                        </Box>
                      </Flex>

                      <Flex gap={2} alignSelf={{ base: 'flex-end', sm: 'center' }}>
                        {!alert.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            colorPalette={config.color}
                            onClick={() => markAsRead(alert.id)}
                            borderRadius="lg"
                            _hover={{ bg: `${config.color}.50`, _dark: { bg: `${config.color}.900/30` } }}
                          >
                            Mark as Read
                          </Button>
                        )}
                      </Flex>
                    </Flex>
                  </Card.Body>
                </Card.Root>
              </MotionBox>
            );
          })}
        </MotionStack>
        
        {/* Pagination */}
        {totalPages > 0 && (
          <Card.Root mt={6} p={4} bg={{ base: 'white', _dark: 'gray.800' }} borderRadius="2xl">
            <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color="gray.500">
                  Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems} alerts
                </Text>
              </Flex>
              
              <Flex align="center" gap={2}>
                <Text fontSize="sm" color="gray.600">Items per page:</Text>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px',
                    background: 'transparent'
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </Flex>

              <Flex gap={2}>
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
                        variant={page === pageNum ? 'solid' : 'outline'}
                        colorPalette={page === pageNum ? 'blue' : 'gray'}
                        color={page === pageNum ? 'blue' : 'gray'}
                        borderRadius="lg"
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
        )}
      </>
      ) : !loading && (
        <AnimatePresence mode="wait">
          <MotionBox
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card.Root p={16} bg={{ base: 'white', _dark: 'gray.800' }} border="none" shadow="sm" borderRadius="3xl">
              <VStack gap={6} align="center">
                <Box position="relative">
                  <Circle size="100px" bg="green.50" color="green.500" _dark={{ bg: 'green.900/20' }}>
                    <FaCircleInfo size={48} />
                  </Circle>
                  <MotionBox
                    position="absolute"
                    top="-10px"
                    right="-10px"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Circle size="40px" bg="yellow.400" color="white" shadow="md">
                      <Text fontSize="xl">✨</Text>
                    </Circle>
                  </MotionBox>
                </Box>
                <Box textAlign="center">
                  <Text fontSize="2xl" fontWeight="black" mb={2}>
                    All Caught Up!
                  </Text>
                  <Text color="gray.500" maxW="400px" fontSize="lg">
                    {showUnreadOnly 
                      ? 'You have no unread alerts at the moment. Excellent financial management!'
                      : 'Your budgets are healthy and no alerts have been triggered yet.'}
                  </Text>
                </Box>
                {showUnreadOnly && (
                  <Button 
                    colorPalette="blue" 
                    variant="subtle" 
                    size="lg" 
                    borderRadius="2xl"
                    onClick={() => setShowUnreadOnly(false)}
                  >
                    View All History
                  </Button>
                )}
              </VStack>
            </Card.Root>
          </MotionBox>
        </AnimatePresence>
      )}
    </Box>
  );
}
