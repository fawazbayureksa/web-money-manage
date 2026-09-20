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
  FiTag,
} from 'react-icons/fi'
import { TagSelector } from '../../components/tags/TagSelector'
import { SelectComponent } from '../../components/form/SelectComponent'

export default function TransactionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [transaction, setTransaction] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [updatingMeta, setUpdatingMeta] = useState(false)
  const [showMetaEditor, setShowMetaEditor] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState([])

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const subtitleColor = useColorModeValue('gray.600', 'gray.400')
  const incomeColor = useColorModeValue('green.600', 'green.400')
  const incomeBg = useColorModeValue('green.50', 'green.900')
  const expenseColor = useColorModeValue('red.600', 'red.400')
  const expenseBg = useColorModeValue('red.50', 'red.900')

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchTransaction(), fetchCategories()])
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchTransaction = async () => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      const url = import.meta.env.VITE_API_URL + `v2/transactions/${id}`
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }))
      const detail = response.data.data
      setTransaction(detail)
      setSelectedCategoryId(detail?.category_id ? String(detail.category_id) : '')
      setSelectedTags(detail?.tags || [])
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

  const fetchCategories = async () => {
    const token = localStorage.getItem('token')
    try {
      const url = import.meta.env.VITE_API_URL + 'categories'
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }))
      const categoriesData = response.data.data || []
      setCategories(
        categoriesData.map((category) => ({
          label: category.CategoryName,
          value: String(category.ID),
        }))
      )
    } catch {
      toaster.create({
        description: 'Failed to fetch categories',
        type: 'error',
      })
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

  const handleSaveCategoryAndTags = async () => {
    if (!transaction) return

    setUpdatingMeta(true)
    const token = localStorage.getItem('token')
    try {
      const url = import.meta.env.VITE_API_URL + `v2/transactions/${id}`
      const payload = {
        category_id: selectedCategoryId ? parseInt(selectedCategoryId, 10) : null,
        tag_ids: selectedTags.map((tag) => tag.id),
      }

      const response = await axios.put(
        url,
        payload,
        Config({ Authorization: `Bearer ${token}` })
      )

      const updated = response?.data?.data
      if (updated) {
        setTransaction(updated)
      } else {
        setTransaction((prev) => ({
          ...prev,
          category_id: selectedCategoryId ? parseInt(selectedCategoryId, 10) : null,
          category_name: selectedCategoryId
            ? categories.find((category) => category.value === selectedCategoryId)?.label || prev.category_name
            : null,
          tags: selectedTags,
        }))
      }

      setShowMetaEditor(false)
      toaster.create({ description: 'Category and tags updated', type: 'success' })
    } catch (error) {
      toaster.create({
        description: error.response?.data?.message || 'Failed to update category and tags',
        type: 'error',
      })
    } finally {
      setUpdatingMeta(false)
    }
  }

  const handleCancelMetaEdit = () => {
    setSelectedCategoryId(transaction?.category_id ? String(transaction.category_id) : '')
    setSelectedTags(transaction?.tags || [])
    setShowMetaEditor(false)
  }

  const openMetaEditor = () => {
    setSelectedCategoryId(transaction?.category_id ? String(transaction.category_id) : '')
    setSelectedTags(transaction?.tags || [])
    setShowMetaEditor(true)
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
          color="blue.500"
          size="sm"
          onClick={() => navigate(`/transaction/edit/${id}`)}
          borderRadius="lg"
          className="hover:bg-warning-600 hover:text-white transition-colors duration-200"
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
                  {showMetaEditor ? (
                    <HStack gap={2}>
                      <Box minW="220px">
                        <SelectComponent
                          options={categories}
                          value={selectedCategoryId ? [selectedCategoryId] : []}
                          label=""
                          placeholder="No category"
                          onChange={(value) => setSelectedCategoryId(value[0] || '')}
                          width="100%"
                          size="sm"
                        />
                      </Box>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => setSelectedCategoryId('')}
                      >
                        Clear
                      </Button>
                    </HStack>
                  ) : (
                    <Badge colorPalette="purple" variant="subtle">
                      {transaction.category_name || '—'}
                    </Badge>
                  )}
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
                <HStack color={subtitleColor} gap={2}>
                  <Icon as={FiTag} />
                  <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase">
                    Tags
                  </Text>
                </HStack>
                {showMetaEditor ? (
                  <HStack gap={2}>
                    <Button
                      size="xs"
                      variant="outline"
                      borderRadius="md"
                      onClick={handleCancelMetaEdit}
                      disabled={updatingMeta}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="xs"
                      bg="blue.500" color="white"
                      borderRadius="md"
                      onClick={handleSaveCategoryAndTags}
                      loading={updatingMeta}
                    >
                      Save Changes
                    </Button>
                  </HStack>
                ) : (
                  <Button
                    size="xs"
                    variant="ghost"
                    bg="blue.500" color="white"
                    borderRadius="md"
                    onClick={openMetaEditor}
                  >
                    Edit Category & Tags
                  </Button>
                )}
              </Flex>

              {/* Existing tags */}
              {selectedTags && selectedTags.length > 0 ? (
                <Flex gap={2} flexWrap="wrap" mb={showMetaEditor ? 3 : 0}>
                  {selectedTags.map((tag) => (
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
                    </Badge>
                  ))}
                </Flex>
              ) : (
                !showMetaEditor && (
                  <Text fontSize="sm" color={subtitleColor}>
                    No tags attached yet.
                  </Text>
                )
              )}

              {/* Inline tag selector */}
              {showMetaEditor && (
                <Box mt={2}>
                  <TagSelector
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    categoryId={selectedCategoryId || ''}
                    description={transaction.description}
                  />
                  <Text fontSize="xs" color={subtitleColor} mt={2}>
                    Saving will replace the transaction tag list with the selected tags.
                  </Text>
                </Box>
              )}
            </Box>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
