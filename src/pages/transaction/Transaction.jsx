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
} from '@chakra-ui/react'
import axios from 'axios'
import { toaster } from '../../components/ui/toaster'
import { useColorModeValue } from '../../components/ui/color-mode'
import { SelectComponent } from '../../components/form/SelectComponent'
import Config from '../../components/axios/Config'
import { 
  FaMoneyBillWave, 
  FaLandmark, 
  FaTag, 
  FaAlignLeft, 
  FaCalendarAlt, 
  FaArrowDown, 
  FaArrowUp 
} from 'react-icons/fa'

export default function Transaction() {
  const [banks, setBanks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    BankID: '',
    CategoryID: '',
    Amount: '',
    Description: '',
    Date: new Date().toISOString().split('T')[0],
    TransactionType: ''
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
    fetchBanks()
    fetchCategories()
  }, [])

  const fetchBanks = async () => {
    try {
      let arr = []
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'banks?page=1&page_size=100';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }))
      const banksData = response.data.data?.data || response.data.data || []
      banksData.map(bank => {
        arr.push({
          label: bank.bank_name,
          value: bank.id
        })
      })
      setBanks(arr)
    } catch (error) {
      console.error('Error fetching banks:', error)
      toaster.create({
        description: "Failed to fetch banks",
        type: "error",
      })
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
          value: category.ID
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
      [field]: parseInt(val[0])
    }))
  }

  const handleTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, TransactionType: type }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.Amount || !formData.BankID || !formData.CategoryID || !formData.TransactionType) {
      toaster.create({
        description: "Please fill in all required fields",
        type: "error",
      })
      return
    }

    setLoading(true)
    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_API_URL + 'transaction';

    try {
      const response = await axios.post(url, formData, Config({ 
        Authorization: `Bearer ${token}`
      }))
      
      console.log('Transaction response:', response.data)
      toaster.create({
        description: "Transaction recorded successfully",
        type: "success",
      })
      
      setFormData({
        BankID: '',
        CategoryID: '',
        Amount: '',
        Description: '',
        Date: new Date().toISOString().split('T')[0],
        TransactionType: ''
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
                    variant={formData.TransactionType === 1 ? "solid" : "outline"}
                    bg={formData.TransactionType === 1 ? incomeBg : "transparent"}
                    borderColor={formData.TransactionType === 1 ? incomeColor : borderColor}
                    color={formData.TransactionType === 1 ? incomeColor : "gray.500"}
                    _hover={{ 
                      borderColor: incomeColor, 
                      bg: formData.TransactionType === 1 ? incomeBg : { base: "gray.50", _dark: "whiteAlpha.100" } 
                    }}
                    onClick={() => handleTypeSelect(1)}
                    borderRadius="xl"
                    borderWidth={formData.TransactionType === 1 ? "2px" : "1px"}
                  >
                    <VStack gap={0}>
                      <Icon as={FaArrowDown} fontSize="lg" mb={1} />
                      <Text fontSize="sm" fontWeight="bold">Income</Text>
                    </VStack>
                  </Button>
                  <Button
                    height="60px"
                    variant={formData.TransactionType === 2 ? "solid" : "outline"}
                    bg={formData.TransactionType === 2 ? expenseBg : "transparent"}
                    borderColor={formData.TransactionType === 2 ? expenseColor : borderColor}
                    color={formData.TransactionType === 2 ? expenseColor : "gray.500"}
                    _hover={{ 
                      borderColor: expenseColor, 
                      bg: formData.TransactionType === 2 ? expenseBg : { base: "gray.50", _dark: "whiteAlpha.100" }
                    }}
                    onClick={() => handleTypeSelect(2)}
                    borderRadius="xl"
                    borderWidth={formData.TransactionType === 2 ? "2px" : "1px"}
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
                    name="Amount"
                    placeholder="0"
                    value={formData.Amount}
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
                    name="Date"
                    value={formData.Date}
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

                {/* Bank and Category Grid */}
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6} w="full">
                  <Field.Root required>
                    <Field.Label display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Icon as={FaLandmark} color="orange.500" />
                      Bank
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <SelectComponent 
                      options={banks}
                      value={formData.BankID ? [formData.BankID.toString()] : []}
                      label=""
                      placeholder="Select Bank"
                      onChange={(val) => handleSelectChange('BankID', val)}
                      width="100%"
                      size="lg"
                    />
                  </Field.Root>

                  <Field.Root required>
                     <Field.Label display="flex" alignItems="center" gap={2} mb={1.5}>
                      <Icon as={FaTag} color="pink.500" />
                      Category
                      <Field.RequiredIndicator />
                    </Field.Label>
                    <SelectComponent 
                      options={categories}
                      value={formData.CategoryID ? [formData.CategoryID.toString()] : []}
                      label=""
                      placeholder="Select Category"
                      onChange={(val) => handleSelectChange('CategoryID', val)}
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
                    name="Description"
                    placeholder="What is this transaction for?"
                    value={formData.Description}
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
