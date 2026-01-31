import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  Field,
  Input,
  Flex,
  Stack,
  Card
} from "@chakra-ui/react";
import axios from 'axios';
import Config from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";
import { SelectComponent } from '../../components/form/SelectComponent';
import { useNavigate, useParams } from 'react-router-dom';

export default function BudgetForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    period: 'monthly',
    start_date: '',
    alert_at: 80,
    description: ''
  });

   const fetchBudget = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const url = import.meta.env.VITE_API_URL + `budgets/${id}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      
      const budget = response.data.data;
      setFormData({
        category_id: budget.category_id,
        amount: parseInt(budget.amount) || 0,
        period: budget.period,
        start_date: budget.start_date ? budget.start_date.split('T')[0] : '',
        alert_at: parseInt(budget.alert_at) || 80,
        description: budget.description
      });
    } catch (error) {
      console.error(error);
      toaster.create({
        description: "Failed to fetch budget",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchBudget();
    }
  }, [isEditMode, fetchBudget]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'categories';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      const categoriesData = response.data.data || [];
      setCategories(categoriesData.map(cat => ({
        label: cat.CategoryName,
        value: cat.ID
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'amount' || name === 'alert_at') && value !== '' ? parseInt(value) : value
    }));
  };

  const handleSelectChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'period' ? val[0] : parseInt(val[0])
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_API_URL + (isEditMode ? `budgets/${id}` : 'budgets');

    const submitData = {
      ...formData,
      amount: parseInt(formData.amount) || 0,
      alert_at: parseInt(formData.alert_at) || 80,
      category_id: parseInt(formData.category_id)
    };

    try {
      const method = isEditMode ? 'put' : 'post';
      await axios[method](url, submitData, Config({ Authorization: `Bearer ${token}` }));

      toaster.create({
        description: `Budget ${isEditMode ? 'updated' : 'created'} successfully`,
        type: "success",
      });

      navigate('/budget');
    } catch (error) {
      console.error(error);
      toaster.create({
        description: `Failed to ${isEditMode ? 'update' : 'create'} budget`,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  if (loading && isEditMode) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box maxW="600px" mx="auto" px={4} py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h3" size="lg">
          {isEditMode ? 'Edit Budget' : 'Create Budget'}
        </Heading>
        <Button variant="outline" onClick={() => navigate('/budget')}>
          Back to List
        </Button>
      </Flex>

      <Card.Root p={6} bg={{ base: 'white', _dark: 'gray.800' }}>
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            <Field.Root required>
              <Field.Label>Category <Field.RequiredIndicator /></Field.Label>
              <SelectComponent
                options={categories}
                label=''
                onChange={(val) => handleSelectChange('category_id', val)}
                placeholder='Select Category'
                value={formData.category_id ? [formData.category_id] : []}
                width="100%"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Amount <Field.RequiredIndicator /></Field.Label>
              <Input
                type="number"
                name="amount"
                placeholder="Enter budget amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Period <Field.RequiredIndicator /></Field.Label>
              <SelectComponent
                options={periodOptions}
                label=''
                onChange={(val) => handleSelectChange('period', val)}
                placeholder='Select Period'
                value={formData.period ? [formData.period] : []}
                width="100%"
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Start Date <Field.RequiredIndicator /></Field.Label>
              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>Alert At (%) <Field.RequiredIndicator /></Field.Label>
              <Input
                type="number"
                name="alert_at"
                placeholder="Enter alert threshold (e.g., 80)"
                value={formData.alert_at}
                onChange={handleInputChange}
                min="1"
                max="100"
                required
              />
              <Text fontSize="xs" color={{ base: 'gray.600', _dark: 'gray.400' }} mt={1}>
                You'll be alerted when spending reaches this percentage
              </Text>
            </Field.Root>

            <Field.Root>
              <Field.Label>Description</Field.Label>
              <Input
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Field.Root>

            <Flex gap={3} justify="flex-end" mt={4}>
              <Button variant="outline" onClick={() => navigate('/budget')}>
                Cancel
              </Button>
              <Button 
                type="submit"
                isLoading={loading}
                bg={{ base: 'blue.500', _dark: 'blue.600' }}
                color="white"
                _hover={{ bg: { base: 'blue.600', _dark: 'blue.700' } }}
              >
                {isEditMode ? 'Update' : 'Create'} Budget
              </Button>
            </Flex>
          </Stack>
        </form>
      </Card.Root>
    </Box>
  );
}
