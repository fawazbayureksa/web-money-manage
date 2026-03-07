import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  Separator,
} from '@chakra-ui/react'
import axios from 'axios'
import { toaster } from '../../components/ui/toaster'
import { useColorModeValue } from '../../components/ui/color-mode'
import Config from '../../components/axios/Config'
import {
  FiArrowLeft,
  FiEdit2,
  FiCalendar,
  FiFolder,
  FiCreditCard,
  FiArrowDown,
  FiArrowUp,
  FiX,
  FiPlus,
} from 'react-icons/fi'
import { TagSelector } from '../../components/tags/TagSelector'

export default function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [tagLoading, setTagLoading] = useState(false)
  const [showTagSelector, setShowTagSelector] = useState(false)

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const subtitleColor = useColorModeValue('gray.600', 'gray.400')
  const incomeColor = useColorModeValue('green.600', 'green.400')
  const incomeBg = useColorModeValue('green.50', 'green.900')
  const expenseColor = useColorModeValue('red.600', 'red.400')
  const expenseBg = useColorModeValue('red.50', 'red.900')

  useEffect(() => {
    fetchTransaction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchTransaction = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      const url = import.meta.env.VITE_API_URL + `v2/transactions/${id}`
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }))
      setTransaction(response.data.data)
    } catch {
      toaster.create({
        description: 'Failed to fetch transaction',
        type: 'error',
      })
      navigate('/transactions')
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

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  // Optimistic: add tags via the API
  const handleAddTags = async (newSelectedTags) => {
    const currentTagIds = (transaction?.tags || []).map((t) => t.id)
    const addedTags = newSelectedTags.filter((t) => !currentTagIds.includes(t.id))
    if (addedTags.length === 0) return

    // Optimistic UI update
    setTransaction((prev) => ({
      ...prev,
      tags: [...(prev.tags || []), ...addedTags],
    }))
    setShowTagSelector(false)

    setTagLoading(true)
    const token = localStorage.getItem('token')
    try {
      const url = import.meta.env.VITE_API_URL + `v2/transactions/${id}/tags`
      await axios.post(
        url,
        { tag_ids: addedTags.map((t) => t.id) },
        Config({ Authorization: `Bearer ${token}` })
      )
      toaster.create({ description: 'Tags added', type: 'success' })
    } catch {
      // Rollback
      setTransaction((prev) => ({
        ...prev,
        tags: (prev.tags || []).filter((t) => !addedTags.some((a) => a.id === t.id)),
      }))
      toaster.create({ description: 'Failed to add tags', type: 'error' })
    } finally {
      setTagLoading(false)
    }
  }

  const handleRemoveTag = async (tagId) => {
    const originalTags = transaction?.tags || []

    // Optimistic UI update
    setTransaction((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t.id !== tagId),
    }))

    setTagLoading(true)
    const token = localStorage.getItem('token')
    try {
      const url = import.meta.env.VITE_API_URL + `v2/transactions/${id}/tags/${tagId}`
      await axios.delete(url, Config({ Authorization: `Bearer ${token}` }))
      toaster.create({ description: 'Tag removed', type: 'success' })
    } catch {
      // Rollback
      setTransaction((prev) => ({ ...prev, tags: originalTags }))
      toaster.create({ description: 'Failed to remove tag', type: 'error' })
    } finally {
      setTagLoading(false)
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    )
  }

  if (!transaction) return null

  const isIncome = transaction.transaction_type === 1

  return (
    <Box maxW="2xl" mx="auto" px={4} py={6}>
      {/* Back + Actions */}
      <Flex justify="space-between" align="center" mb={6}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/transactions')}
          borderRadius="lg"
        >
          <Icon as={FiArrowLeft} mr={2} />
          Back
        </Button>
        <Button
          colorPalette="blue"
          size="sm"
          onClick={() => navigate(`/transaction/edit/${id}`)}
          borderRadius="lg"
        >
          <Icon as={FiEdit2} mr={2} />
          Edit
        </Button>
      </Flex>

      <Card.Root
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        borderRadius="2xl"
        overflow="hidden"
        boxShadow="lg"
      >
        {/* Amount Header */}
        <Box
          bg={isIncome ? incomeBg : expenseBg}
          px={8}
          py={6}
          textAlign="center"
        >
          <HStack justify="center" gap={2} mb={2}>
            <Icon
              as={isIncome ? FiArrowDown : FiArrowUp}
              boxSize={6}
              color={isIncome ? incomeColor : expenseColor}
            />
            <Badge
              colorPalette={isIncome ? 'green' : 'red'}
              variant="subtle"
              fontSize="sm"
            >
              {isIncome ? 'Income' : 'Expense'}
            </Badge>
          </HStack>
          <Heading
            as="h2"
            size="3xl"
            fontWeight="bold"
            color={isIncome ? incomeColor : expenseColor}
          >
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
          </Heading>
        </Box>

        <Card.Body p={6}>
          <VStack gap={4} align="stretch">
            {/* Description */}
            <Box>
              <Text fontSize="xs" fontWeight="semibold" color={subtitleColor} textTransform="uppercase" mb={1}>
                Description
              </Text>
              <Text fontSize="md">
                {transaction.description || '—'}
              </Text>
            </Box>

            <Separator />

            {/* Details Grid */}
            <Box>
              <VStack gap={3} align="stretch">
                <Flex justify="space-between" align="center">
                  <HStack color={subtitleColor} gap={2}>
                    <Icon as={FiCalendar} />
                    <Text fontSize="sm">Date</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="medium">
                    {formatDate(transaction.date)}
                  </Text>
                </Flex>

                <Flex justify="space-between" align="center">
                  <HStack color={subtitleColor} gap={2}>
                    <Icon as={FiFolder} />
                    <Text fontSize="sm">Category</Text>
                  </HStack>
                  <Badge colorPalette="purple" variant="subtle">
                    {transaction.category_name || '—'}
                  </Badge>
                </Flex>

                <Flex justify="space-between" align="center">
                  <HStack color={subtitleColor} gap={2}>
                    <Icon as={FiCreditCard} />
                    <Text fontSize="sm">Wallet / Asset</Text>
                  </HStack>
                  <Badge colorPalette="orange" variant="subtle">
                    {transaction.asset_name || '—'}
                  </Badge>
                </Flex>
              </VStack>
            </Box>

            <Separator />

            {/* Tags section with inline editing */}
            <Box>
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontSize="xs" fontWeight="semibold" color={subtitleColor} textTransform="uppercase">
                  Tags
                </Text>
                <Button
                  size="xs"
                  variant="ghost"
                  colorPalette="blue"
                  borderRadius="md"
                  onClick={() => setShowTagSelector((v) => !v)}
                  loading={tagLoading}
                >
                  <Icon as={FiPlus} mr={1} />
                  Add Tag
                </Button>
              </Flex>

              {/* Existing tags */}
              {transaction.tags && transaction.tags.length > 0 ? (
                <Flex gap={2} flexWrap="wrap" mb={showTagSelector ? 3 : 0}>
                  {transaction.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      px={2}
                      py={1}
                      borderRadius="md"
                      display="inline-flex"
                      alignItems="center"
                      gap={1}
                      style={{
                        backgroundColor: tag.color + '20',
                        border: `1px solid ${tag.color}60`,
                        color: tag.color,
                      }}
                    >
                      {tag.icon && <span>{tag.icon}</span>}
                      {tag.name}
                      <Box
                        as="button"
                        onClick={() => handleRemoveTag(tag.id)}
                        ml={1}
                        cursor="pointer"
                        aria-label={`Remove tag ${tag.name}`}
                      >
                        <Icon as={FiX} boxSize="10px" />
                      </Box>
                    </Badge>
                  ))}
                </Flex>
              ) : (
                !showTagSelector && (
                  <Text fontSize="sm" color={subtitleColor}>
                    No tags attached yet.
                  </Text>
                )
              )}

              {/* Inline tag selector */}
              {showTagSelector && (
                <Box mt={2}>
                  <TagSelector
                    selectedTags={transaction.tags || []}
                    onTagsChange={handleAddTags}
                    categoryId={transaction.category_id}
                    description={transaction.description}
                  />
                </Box>
              )}
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
