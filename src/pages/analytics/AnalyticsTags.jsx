import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  Flex,
  VStack,
  HStack,
  Icon,
  Card,
  Badge,
  Input,
  Grid,
  Separator,
} from '@chakra-ui/react'
import axios from 'axios'
import { toaster } from '../../components/ui/toaster'
import { useColorModeValue } from '../../components/ui/color-mode'
import Config from '../../components/axios/Config'
import { FiTag, FiCalendar, FiTrendingDown } from 'react-icons/fi'

export default function AnalyticsTags() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const subtitleColor = useColorModeValue('gray.600', 'gray.400')
  const calendarFilter = useColorModeValue('none', 'invert(1)')
  const progressTrackBg = useColorModeValue('gray.100', 'gray.700')

  useEffect(() => {
    fetchAnalytics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const url = import.meta.env.VITE_API_URL + `v2/analytics/spending-by-tag?${params.toString()}`
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }))
      setData(response.data.data || [])
    } catch {
      toaster.create({
        description: 'Failed to fetch tag analytics',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)

  const maxSpending = data.length > 0 ? Math.max(...data.map(d => d.total_spending || 0)) : 1

  return (
    <Box maxW="4xl" mx="auto" px={4} py={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Box>
          <Flex align="center" gap={3}>
            <Icon as={FiTrendingDown} boxSize={6} color="blue.500" />
            <Heading as="h1" size="xl" fontWeight="bold">
              Spending by Tag
            </Heading>
          </Flex>
          <Text color={subtitleColor} mt={1}>
            See which tags are consuming the most budget
          </Text>
        </Box>

        {/* Date Range Picker */}
        <Flex align="center" gap={2} flexWrap="wrap">
          <Icon as={FiCalendar} color="gray.400" />
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            size="sm"
            borderRadius="lg"
            borderColor={borderColor}
            w="150px"
            css={{
              '&::-webkit-calendar-picker-indicator': { filter: calendarFilter }
            }}
          />
          <Text color={subtitleColor} fontSize="sm">to</Text>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            size="sm"
            borderRadius="lg"
            borderColor={borderColor}
            w="150px"
            css={{
              '&::-webkit-calendar-picker-indicator': { filter: calendarFilter }
            }}
          />
          <Button
            size="sm"
            colorPalette="blue"
            borderRadius="lg"
            onClick={fetchAnalytics}
            loading={loading}
          >
            Apply
          </Button>
        </Flex>
      </Flex>

      {loading ? (
        <Flex justify="center" py={16}>
          <Spinner size="xl" color="blue.500" />
        </Flex>
      ) : data.length > 0 ? (
        <VStack gap={3} align="stretch">
          {data.map((item) => (
            <Card.Root
              key={item.tag_id}
              bg={cardBg}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="2xl"
              overflow="hidden"
            >
              <Card.Body p={5}>
                <Flex justify="space-between" align="center" mb={3} flexWrap="wrap" gap={2}>
                  {/* Tag Identity */}
                  <HStack gap={3}>
                    {item.icon && <Text fontSize="xl">{item.icon}</Text>}
                    <Box
                      w="12px"
                      h="12px"
                      borderRadius="full"
                      bg={item.color || 'blue.400'}
                      flexShrink={0}
                    />
                    <Text fontWeight="semibold" fontSize="md">
                      {item.tag_name}
                    </Text>
                  </HStack>

                  {/* Stats */}
                  <HStack gap={4} flexWrap="wrap">
                    <Box textAlign="right">
                      <Text fontSize="xs" color={subtitleColor}>Transactions</Text>
                      <Badge colorPalette="blue" variant="subtle">
                        {item.transaction_count ?? 0}
                      </Badge>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color={subtitleColor}>Avg</Text>
                      <Text fontSize="sm" fontWeight="medium">
                        {formatCurrency(item.average_amount ?? 0)}
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="xs" color={subtitleColor}>Total</Text>
                      <Text fontSize="lg" fontWeight="bold" color="red.500">
                        {formatCurrency(item.total_spending ?? 0)}
                      </Text>
                    </Box>
                  </HStack>
                </Flex>

                {/* Progress bar */}
                <Box
                  h="6px"
                  borderRadius="full"
                  bg={progressTrackBg}
                  overflow="hidden"
                >
                  <Box
                    h="full"
                    borderRadius="full"
                    bg={item.color || 'blue.400'}
                    w={`${Math.round(((item.total_spending ?? 0) / maxSpending) * 100)}%`}
                    transition="width 0.5s ease"
                  />
                </Box>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      ) : (
        <Box
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          p={12}
          textAlign="center"
        >
          <VStack gap={4}>
            <Box
              w="16"
              h="16"
              borderRadius="full"
              bg="blue.50"
              _dark={{ bg: 'blue.900' }}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiTag} boxSize={8} color="blue.500" />
            </Box>
            <VStack gap={2}>
              <Text fontSize="xl" fontWeight="bold">No spending data</Text>
              <Text color={subtitleColor} maxW="sm">
                No tag spending found for the selected date range. Try tagging some transactions first.
              </Text>
            </VStack>
            <Button colorPalette="blue" onClick={fetchAnalytics} borderRadius="lg">
              Refresh
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  )
}
