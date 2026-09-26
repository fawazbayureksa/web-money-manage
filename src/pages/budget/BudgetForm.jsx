import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Button,
  Field,
  Input,
  Textarea,
  Flex,
  HStack,
  Stack,
  Card
} from "@chakra-ui/react";
import { FaChevronLeft } from "react-icons/fa6";
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Config from '../../components/axios/Config';
import { toaster } from "./../../components/ui/toaster";
import { SelectComponent } from '../../components/form/SelectComponent';
import { useColorModeValue } from '../../components/ui/color-mode';

const formatIDR = (val) => {
  const num = Number(val);
  if (isNaN(num) || num <= 0) return '';
  return `Rp ${num.toLocaleString('id-ID')}`;
};

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

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  const calendarFilter = useColorModeValue('none', 'invert(1)');

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const url = import.meta.env.VITE_API_URL + `budgets/${id}`;
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      
      const budget = response.data.data;
      setFormData({
        category_id: budget.category_id,
        amount: parseInt(budget.amount, 10) || 0,
        period: budget.period || 'monthly',
        start_date: budget.start_date ? budget.start_date.split('T')[0] : '',
        alert_at: parseInt(budget.alert_at, 10) || 80,
        description: budget.description || ''
      });
    } catch (error) {
      console.error(error);
      toaster.create({
        description: "Failed to fetch budget",
        type: "error",
      });
      navigate('/budget');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'categories';
      const response = await axios.get(url, Config({ Authorization: `Bearer ${token}` }));
      const categoriesData = response.data.data || [];
      setCategories(categoriesData.map(cat => ({
        label: cat.CategoryName,
        value: String(cat.ID)
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchBudget();
    }
  }, [isEditMode, fetchBudget, fetchCategories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'amount' || name === 'alert_at') && value !== '' ? parseInt(value, 10) : value
    }));
  };

  const handleSelectChange = (field, val) => {
    const selectedVal = val && val[0] ? val[0] : '';
    setFormData(prev => ({
      ...prev,
      [field]: field === 'period' ? selectedVal : (selectedVal ? parseInt(selectedVal, 10) : '')
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.category_id) {
      toaster.create({
        description: "Please select a category",
        type: "error",
      });
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toaster.create({
        description: "Please enter a valid amount",
        type: "error",
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_API_URL + (isEditMode ? `budgets/${id}` : 'budgets');

    const submitData = {
      ...formData,
      amount: parseInt(formData.amount, 10) || 0,
      alert_at: parseInt(formData.alert_at, 10) || 80,
      category_id: parseInt(formData.category_id, 10)
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
        <Spinner size="lg" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box maxW="580px" mx="auto" px={4} py={{ base: 6, md: 8 }}>
      {/* Header with h5 */}
      <Flex justify="space-between" align="center" mb={5}>
        <Box>
          <Heading as="h5" size="md" fontWeight="700" letterSpacing="tight">
            {isEditMode ? 'Edit Budget' : 'Create Budget'}
          </Heading>
          <Text fontSize="xs" color={subtitleColor} mt={0.5}>
            {isEditMode ? 'Update spending limit and alert threshold' : 'Set a spending limit and alert threshold for a category'}
          </Text>
        </Box>
        <Button
          variant="outline"
          size="sm"
          borderRadius="lg"
          onClick={() => navigate('/budget')}
        >
          <FaChevronLeft style={{ marginRight: '6px' }} size={10} />
          Back to List
        </Button>
      </Flex>

      {/* Main Card */}
      <Card.Root
        bg={cardBg}
        borderRadius="xl"
        border="1px solid"
        borderColor={borderColor}
        shadow="xs"
        p={{ base: 5, md: 6 }}
      >
        <form onSubmit={handleSubmit}>
          <Stack gap={4}>
            
            {/* Category */}
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight="600">
                Category <Field.RequiredIndicator />
              </Field.Label>
              <SelectComponent
                options={categories}
                label=""
                onChange={(val) => handleSelectChange('category_id', val)}
                placeholder="Select Category"
                value={formData.category_id ? [String(formData.category_id)] : []}
                width="100%"
                size="md"
              />
            </Field.Root>

            {/* Amount */}
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight="600">
                Amount (IDR) <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="number"
                name="amount"
                placeholder="e.g. 1500000"
                value={formData.amount}
                onChange={handleInputChange}
                borderRadius="lg"
                min="0"
                required
              />
              {Number(formData.amount) > 0 && (
                <Text fontSize="xs" color="blue.500" fontWeight="600" mt={1}>
                  {formatIDR(formData.amount)}
                </Text>
              )}
            </Field.Root>

            {/* Period */}
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight="600">
                Period <Field.RequiredIndicator />
              </Field.Label>
              <SelectComponent
                options={periodOptions}
                label=""
                onChange={(val) => handleSelectChange('period', val)}
                placeholder="Select Period"
                value={formData.period ? [formData.period] : []}
                width="100%"
                size="md"
              />
            </Field.Root>

            {/* Start Date */}
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight="600">
                Start Date <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                borderRadius="lg"
                css={{
                  '&::-webkit-calendar-picker-indicator': {
                    filter: calendarFilter,
                  },
                }}
                required
              />
            </Field.Root>

            {/* Alert At */}
            <Field.Root required>
              <Field.Label fontSize="sm" fontWeight="600">
                Alert At (%) <Field.RequiredIndicator />
              </Field.Label>
              <Input
                type="number"
                name="alert_at"
                placeholder="80"
                value={formData.alert_at}
                onChange={handleInputChange}
                borderRadius="lg"
                min="1"
                max="100"
                required
              />
              <Text fontSize="xs" color={subtitleColor} mt={1}>
                Notification sent when spending reaches this threshold percentage
              </Text>
            </Field.Root>

            {/* Description */}
            <Field.Root>
              <Field.Label fontSize="sm" fontWeight="600">
                Description
              </Field.Label>
              <Textarea
                name="description"
                placeholder="Optional budget description"
                value={formData.description}
                onChange={handleInputChange}
                borderRadius="lg"
                rows={2}
              />
            </Field.Root>

            {/* Action Buttons */}
            <HStack gap={3} justify="flex-end" mt={3} pt={4} borderTop="1px solid" borderColor={borderColor}>
              <Button
                type="button"
                variant="outline"
                borderRadius="lg"
                size="sm"
                onClick={() => navigate('/budget')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                loading={loading}
                bg="blue.500"
                color="white"
                size="sm"
                borderRadius="lg"
                _hover={{ bg: "blue.600" }}
              >
                {isEditMode ? 'Update' : 'Create'} Budget
              </Button>
            </HStack>

          </Stack>
        </form>
      </Card.Root>
    </Box>
  );
}
