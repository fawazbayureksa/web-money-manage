import React, { useState, useEffect } from 'react'
import {
  Box,
  Input,
  Select,
  Button,
  VStack,
  Field,
  Heading,
  Stack,
  Portal,
} from '@chakra-ui/react'
import axios from 'axios'
import { toaster } from '../../components/ui/toaster'
import { useColorModeValue } from '../../components/ui/color-mode'
import { SelectComponent } from '../../components/form/SelectComponent'
import Config from '../../components/axios/Config'

export default function Transaction() {
  const [banks, setBanks] = useState([])
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    BankID: '',
    CategoryID: '',
    Amount: '',
    Description: '',
    Date: '',
    TransactionType: ''
  })

  useEffect(() => {
    fetchBanks()
    fetchCategories()
  }, [])

  const fetchBanks = async () => {
    try {
    let arr = []
    let url = import.meta.env.VITE_API_URL + 'banks';
      const response = await axios.get(url)
      console.log(response.data.data.data)
        response?.data?.data?.data?.map(bank => {
            arr.push({
                label: bank.bank_name,
                value: bank.id
            })
        })
        console.log(arr)
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
        let  arr = [];
    let url = import.meta.env.VITE_API_URL + 'categories';
      const response = await axios.get(url)
      console.log(response.data.data)
      response?.data?.data.map(category => {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_API_URL + 'transaction';

    let axiosInstance = axios.post(url, formData, Config({ 
      Authorization: `Bearer ${token}`
     }))
        
    axiosInstance.then(response => {
          console.log('Transaction response:', response.data)
          toaster.create({
            description: "Transaction recorded successfully",
            type: "success",
          })
            // Reset form after successful submission
            setFormData({
              BankID: '',
              CategoryID: '',
              Amount: '',
              Description: '',
              Date: '',
              TransactionType: ''
            })
      }).catch(error => {
        console.error(error);
      }).finally(() => {
        console.log('Transaction submission completed');
      });
  }

  const transactionTypes = [
    { value: 1, label: "Income" },
    { value: 2, label: "Expense" }
  ];

  return (
    <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
            <Heading fontSize={'2xl'}>Record Transaction</Heading>
        </Stack>
        <Box rounded={'lg'} boxShadow={'xs'} p={5} bg={useColorModeValue('white', 'gray.700')}>
        <Field.Root required marginBottom="20px">
            <SelectComponent 
            options={transactionTypes} 
            label='Transaction Type'  
            onChange={(val) => handleSelectChange('TransactionType', val)}
            placeholder='Select Type' />
        </Field.Root>
        <Field.Root required marginBottom="20px">
            <SelectComponent 
            options={banks} 
            label='Bank'  
            onChange={(val) => handleSelectChange('BankID', val)}
            placeholder='Select Bank' />
        </Field.Root>
        <Field.Root required marginBottom="20px">
            <SelectComponent 
            options={categories} 
            label='Category'  
            placeholder='Select Category'
            onChange={(val) => handleSelectChange('CategoryID', val)}
            />
        </Field.Root>
        <Field.Root required marginBottom="20px">
            <Field.Label> Amount <Field.RequiredIndicator /> </Field.Label>
            <Input
                type="number"
                name="Amount"
                placeholder="Enter amount"
                value={formData.Amount}
                onChange={handleInputChange}
            />
        </Field.Root>
        <Field.Root marginBottom="20px">
            <Field.Label>Description</Field.Label>
            <Input
                name="Description"
                placeholder="Enter description"
                value={formData.Description}
                onChange={handleInputChange}
            />
        </Field.Root>
              <Field.Root required marginBottom="20px">
                <Field.Label>
                    Date <Field.RequiredIndicator />
                </Field.Label>
                <Input
                    type="date"
                    name="Date"
                    value={formData.Date}
                    onChange={handleInputChange}
                />
            </Field.Root>
        <Button colorPalette="teal" onClick={handleSubmit} variant="outline" type="submit" colorScheme="blue">
            Record Transaction
        </Button>
    </Box>
    </Stack>)
}