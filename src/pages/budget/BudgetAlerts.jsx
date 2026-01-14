import React, { useState, useEffect } from 'react';
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
  IconButton
} from "@chakra-ui/react";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";

export default function BudgetAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, [showUnreadOnly]);

  const fetchAlerts = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const params = showUnreadOnly ? '?unread_only=true' : '';
      const url = import.meta.env.VITE_API_URL + `budget-alerts${params}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));

      setAlerts(response.data.data || []);
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
    const token = localStorage.getItem('token');

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}budget-alerts/${alertId}/read`,
        {},
        Config({ Authorization: `Bearer ${token}` })
      );

      toaster.create({
        description: "Alert marked as read",
        type: "success",
      });

      fetchAlerts();
    } catch (error) {
      console.error(error);
      toaster.create({
        description: "Failed to mark alert as read",
        type: "error",
      });
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');

    try {
      const unreadAlerts = alerts.filter(alert => !alert.is_read);
      
      await Promise.all(
        unreadAlerts.map(alert =>
          axios.put(
            `${import.meta.env.VITE_API_URL}budget-alerts/${alert.id}/read`,
            {},
            Config({ Authorization: `Bearer ${token}` })
          )
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

  const getSeverityColor = (percentage) => {
    if (percentage >= 100) return 'red';
    if (percentage >= 90) return 'orange';
    return 'yellow';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  return (
    <Box maxW="7xl" mx="auto" px={4} py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading as="h3" size="lg" mb={2}>
            Budget Alerts
          </Heading>
          <Text color={{ base: 'gray.500', _dark: 'gray.400' }} fontSize="sm">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
          </Text>
        </Box>
        <Flex gap={2}>
          <Button
            variant={showUnreadOnly ? 'solid' : 'outline'}
            size="sm"
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            bg={{ base: 'gray.50', _dark: 'gray.700' }}
            // bg={showUnreadOnly ? { base: 'blue.500', _dark: 'blue.600' } : undefined}
            color={showUnreadOnly ? 'white' : undefined}
            _hover={showUnreadOnly ? { bg: { base: 'blue.600', _dark: 'blue.700' } } : undefined}
          >
            {showUnreadOnly ? 'Show All' : 'Unread Only'}
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              colorScheme="green"
              size="sm"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </Flex>
      </Flex>

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

      {!loading && alerts.length > 0 ? (
        <Stack gap={3}>
          {alerts.map((alert) => (
            <Card.Root
              key={alert.id}
              p={4}
              bg={alert.is_read ? { base: 'white', _dark: 'gray.800' } : { base: 'blue.50', _dark: 'blue.900' }}
              borderLeft="4px solid"
              borderColor={alert.is_read ? { base: 'gray.200', _dark: 'gray.600' } : getSeverityColor(alert.percentage)}
              _hover={{ shadow: 'md' }}
              transition="all 0.2s"
            >
              <Flex justify="space-between" align="start">
                <Box flex={1}>
                  <Flex align="center" gap={2} mb={2}>
                    <Badge colorScheme={getSeverityColor(alert.percentage)} fontSize="sm">
                      {alert.percentage}% Used
                    </Badge>
                    {!alert.is_read && (
                      <Badge colorScheme="blue" fontSize="xs">New</Badge>
                    )}
                  </Flex>
                  
                  <Text fontWeight="medium" fontSize="md" mb={2}>
                    {alert.message}
                  </Text>
                  
                  <Flex gap={4} fontSize="sm" color={{ base: 'gray.600', _dark: 'gray.400' }}>
                    <Text>
                      Spent: Rp {alert.spent_amount?.toLocaleString('id-ID')}
                    </Text>
                    <Text>•</Text>
                    <Text>
                      {formatDate(alert.created_at)}
                    </Text>
                  </Flex>
                </Box>

                <Flex gap={2}>
                  {!alert.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => markAsRead(alert.id)}
                    >
                      Mark as Read
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Card.Root>
          ))}
        </Stack>
      ) : !loading && (
        <Card.Root p={12} bg={{ base: 'white', _dark: 'gray.800' }}>
          <Flex direction="column" align="center" gap={2}>
            <Text fontSize="5xl">🎉</Text>
            <Text textAlign="center" fontSize="lg" fontWeight="medium" color={{ base: 'gray.700', _dark: 'gray.200' }}>
              No alerts at the moment
            </Text>
            <Text textAlign="center" fontSize="sm" color={{ base: 'gray.500', _dark: 'gray.400' }}>
              {showUnreadOnly 
                ? 'You have no unread alerts. Switch to "Show All" to view history.'
                : 'Your budgets are looking good! We\'ll notify you when you reach spending thresholds.'}
            </Text>
          </Flex>
        </Card.Root>
      )}
    </Box>
  );
}
