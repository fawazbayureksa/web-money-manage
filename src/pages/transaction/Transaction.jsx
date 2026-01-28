import React, { useState, useEffect } from 'react'
import {
  Box,
  Input,
  Button,
  VStack,
  Field,
  Heading,
  Container,
  Card,
  Grid,
  Text,
  Icon,
  Flex,
  Badge,
} from '@chakra-ui/react'
import axios from 'axios'
import { toaster } from '../../components/ui/toaster'
import { useColorModeValue } from '../../components/ui/color-mode'
import { SelectComponent } from '../../components/form/SelectComponent'
import Config from '../../components/axios/Config'
import { 
  FaMoneyBillWave, 
  FaWallet, 
  FaTag, 
  FaAlignLeft, 
  FaCalendarAlt, 
  FaArrowDown, 
  FaArrowUp 
} from 'react-icons/fa'

export default function Transaction() {
  const [wallets, setWallets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    asset_id: '',
    category_id: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    transaction_type: ''
  })

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const incomeColor = useColorModeValue('green.500', 'green.400')
  const incomeBg = useColorModeValue('green.50', 'green.900')
  const expenseColor = useColorModeValue('red.500', 'red.400')
  const expenseBg = useColorModeValue('red.50', 'red.900')

  useEffect(() => {
    fetchWallets()
    fetchCategories()
  }, [])

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fetchWallets = async () => {
    setLoading(true)
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(import.meta.env.VITE_API_URL + 'wallets', Config({ Authorization: `Bearer ${token}` }));
      const walletsData = response.data.data || []
      const walletOptions = walletsData.map(wallet => ({
        label: wallet.name,
        value: String(wallet.id),
        balance: wallet.balance,
        bankName: wallet.bank_name,
        accountNo: wallet.account_no
      }))
      setWallets(walletOptions)
    } catch (error) {
      console.error('Error fetching wallets:', error)
      toaster.create({
        description: "Failed to fetch wallets",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      let arr = []
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'categories';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }))
      const categoriesData = response.data.data || []
      categoriesData.map(category => {
        arr.push({
          label: category.CategoryName,
          value: String(category.ID)
        })
      })
      setCategories(arr)
    } catch (error) {
      console.error('Error fetching categories:', error)
      toaster.create({
        description: "Failed to fetch categories",
        type: "error",
      })
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

  const handleSelectChange = (field, val) => {
    setFormData(prevData => ({
      ...prevData,
      [field]: val[0] ? parseInt(val[0]) : ''
    }))
  }

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, transaction_type: type }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.amount || !formData.asset_id || !formData.category_id || !formData.transaction_type) {
      toaster.create({
        description: "Please fill in all required fields",
        type: "error",
      })
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_API_URL + 'v2/transactions';

    const payload = {
      description: formData.description,
      category_id: formData.category_id,
      asset_id: formData.asset_id,
      amount: parseInt(formData.amount),
      transaction_type: formData.transaction_type,
      date: formData.date
    }
    console.log('Submitting transaction with payload:', payload)
    try {
      const response = await axios.post(url, payload, Config({ 
        Authorization: `Bearer ${token}`
      }))
      
      console.log('Transaction response:', response.data)
      toaster.create({
        description: "Transaction recorded successfully",
        type: "success",
      })
      
      setFormData({
        asset_id: '',
        category_id: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        transaction_type: ''
      })
    } catch (error) {
      console.error(error);
      toaster.create({
        description: "Failed to record transaction",
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="calc(100vh - 80px)" bg={bgColor} py={{ base: 4, md: 8 }} px={{ base: 4, md: 8 }}>
      <Container maxW="2xl" p={0}>
        <VStack gap={6} align="stretch">
          
          <Box textAlign="center" mb={2}>
            <Heading size="2xl" fontWeight="bold" letterSpacing="tight">
              New Transaction
            </Heading>
            <Text color="gray.500" fontSize="lg" mt={2}>
              Track your financial activity
            </Text>
          </Box>

          <Card.Root 
            bg={cardBg} 
            boxShadow="lg" 
            borderRadius="2xl" 
            border="1px solid" 
            borderColor={borderColor}
            overflow="hidden"
          >
            <Card.Body p={{ base: 6, md: 8 }}>
              <VStack gap={6}>
                
                {/* Transaction Type Toggle */}
                <Grid templateColumns="1fr 1fr" gap={4} w="full">
                  <Button
                    height="60px"
                    variant={formData.transaction_type === "Income" ? "solid" : "outline"}
                    bg={formData.transaction_type === "Income" ? incomeBg : "transparent"}
                    borderColor={formData.transaction_type === "Income" ? incomeColor : borderColor}
                    color={formData.transaction_type === "Income" ? incomeColor : "gray.500"}
                    _hover={{ 
                      borderColor: incomeColor, 
                      bg: formData.transaction_type === "Income" ? incomeBg : { base: "gray.50", _dark: "whiteAlpha.100" } 
                    }}
                    onClick={() => handleTypeSelect("Income")}
                    borderRadius="xl"
                    borderWidth={formData.transaction_type === "Income" ? "2px" : "1px"}
                  >
                    <VStack gap={0}>
                      <Icon as={FaArrowDown} fontSize="lg" mb={1} />
                      <Text fontSize="sm" fontWeight="bold">Income</Text>
                    </VStack>
                  </Button>
                  <Button
                    height="60px"
                    variant={formData.transaction_type === "Expense" ? "solid" : "outline"}
                    bg={formData.transaction_type === "Expense" ? expenseBg : "transparent"}
                    borderColor={formData.transaction_type === "Expense" ? expenseColor : borderColor}
                    color={formData.transaction_type === "Expense" ? expenseColor : "gray.500"}
                    _hover={{ 
                      borderColor: expenseColor, 
                      bg: formData.transaction_type === "Expense" ? expenseBg : { base: "gray.50", _dark: "whiteAlpha.100" }
                    }}
                    onClick={() => handleTypeSelect("Expense")}
                    borderRadius="xl"
                    borderWidth={formData.transaction_type === "Expense" ? "2px" : "1px"}
                  >
                    <VStack gap={0}>
                      <Icon as={FaArrowUp} fontSize="lg" mb={1} />
                      <Text fontSize="sm" fontWeight="bold">Expense</Text>
                    </VStack>
                  </Button>
                </Grid>

                {/* Amount Input */}
                <Field.Root required>
                  <Field.Label display="flex" alignItems="center" gap={2}>
                    <Icon as={FaMoneyBillWave} color="blue.500" />
                    Amount
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    type="number"
                    name="amount"
                    placeholder="0"
                    value={formData.amount}
                    onChange={handleInputChange}
                    size="xl"
                    fontSize="2xl"
                    fontWeight="bold"
                    textAlign="center"
                    py={6}
                    borderRadius="xl"
                    _focus={{ borderColor: "blue.500", boxShadow: "0 0 0 1px var(--chakra-colors-blue-500)" }}
                  />
                </Field.Root>

                {/* Date Input */}
                <Field.Root required>
                  <Field.Label display="flex" alignItems="center" gap={2}>
                    <Icon as={FaCalendarAlt} color="purple.500" />
                    Date
                    <Field.RequiredIndicator />
                  </Field.Label>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    size="lg"
                    borderRadius="xl"
                    css={{
                        "&::-webkit-calendar-picker-indicator": {
                          filter: useColorModeValue("none", "invert(1)")
                        }
                    }}
                  />
                </Field.Root>

                {/* Wallet and Category Grid */}
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} w="full">
                  <Field.Root required>
                    <Field.Label display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Icon as={FaWallet} color="orange.500" />
                      Wallet / Asset
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <SelectComponent 
                      options={wallets}
                      value={formData.asset_id ? [formData.asset_id.toString()] : []}
                      label=""
                      placeholder="Select Wallet"
                      onChange={(val) => handleSelectChange('asset_id', val)}
                      width="100%"
                      size="lg"
                    />
                    {formData.asset_id && (
                      <Box mt={2}>
                        <Text fontSize="xs" color="gray.500">Balance:</Text>
                        <Flex align="center" gap={2}>
                          <Text fontSize="sm" fontWeight="bold" color="blue.500">
                            {formatCurrency(wallets.find(w => parseInt(w.value) === formData.asset_id)?.balance || 0)}
                          </Text>
                          <Badge fontSize="xs" colorPalette="blue">
                            {wallets.find(w => parseInt(w.value) === formData.asset_id)?.bankName}
                          </Badge>
                        </Flex>
                      </Box>
                    )}
                  </Field.Root>

                  <Field.Root required>
                     <Field.Label display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Icon as={FaTag} color="pink.500" />
                      Category
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <SelectComponent 
                      options={categories}
                      value={formData.category_id ? [formData.category_id.toString()] : []}
                      label=""
                      placeholder="Select Category"
                      onChange={(val) => handleSelectChange('category_id', val)}
                      width="100%"
                      size="lg"
                    />
                  </Field.Root>
                </Grid>

                {/* Description */}
                <Field.Root>
                  <Field.Label display="flex" alignItems="center" gap={2}>
                    <Icon as={FaAlignLeft} color="gray.500" />
                    Description
                  </Field.Label>
                  <Input
                    name="description"
                    placeholder="What is this transaction for?"
                    value={formData.description}
                    onChange={handleInputChange}
                    size="lg"
                    borderRadius="xl"
                  />
                </Field.Root>

                {/* Submit Button */}
                <Button 
                  onClick={handleSubmit} 
                  type="submit" 
                  size="xl"
                  w="full"
                  mt={4}
                  bg={{ base: 'blue.600', _dark: 'blue.500' }}
                  color="white"
                  fontSize="lg"
                  borderRadius="xl"
                  loading={loading}
                  _hover={{ 
                    bg: { base: 'blue.700', _dark: 'blue.600' },
                    transform: "translateY(-2px)",
                    boxShadow: "lg"
                  }}
                  transition="all 0.2s"
                >
                  Save Transaction
                </Button>

              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Container>
    </Box>
  )
}
