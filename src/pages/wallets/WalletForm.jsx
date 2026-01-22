import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Field,
  Container,
  Heading,
  Flex,
  createListCollection,
} from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import Config from '../../components/axios/Config';
import { toaster } from '../../components/ui/toaster';
import { useColorModeValue } from '../../components/ui/color-mode';
import { SelectComponent } from '../../components/form/SelectComponent';

const WalletForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    balance: '',
    currency: 'IDR',
    bank_name: '',
    account_no: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEdit);

  const walletTypes = createListCollection({
    items: [
      { label: 'Bank Account', value: 'Bank' },
      { label: 'Credit Card', value: 'Credit Card' },
      { label: 'Cash', value: 'Cash' },
      { label: 'Online Wallet', value: 'Online Wallet' },
      { label: 'Investment', value: 'Investment' },
      { label: 'Savings', value: 'Savings' },
    ],
  });

  const currencies = createListCollection({
    items: [
      { label: 'IDR', value: 'IDR' },
      { label: 'USD', value: 'USD' },
      { label: 'EUR', value: 'EUR' },
      { label: 'SGD', value: 'SGD' },
    ],
  });

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const fetchWallet = useCallback(async () => {
    setFetchLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}wallets/${id}`,
        Config({ Authorization: `Bearer ${token}` })
      );

      const wallet = response.data.data;
      setFormData({
        name: wallet.name || '',
        type: wallet.type || '',
        balance: wallet.balance?.toString() || '',
        currency: wallet.currency || 'IDR',
        bank_name: wallet.bank_name || '',
        account_no: wallet.account_no || '',
      });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toaster.create({
        description: "Failed to load wallet",
        type: "error",
      });
      navigate('/wallets');
    } finally {
      setFetchLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) {
      fetchWallet();
    }
  }, [isEdit, fetchWallet]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.type || !formData.balance) {
      toaster.create({
        description: "Please fill in all required fields",
        type: "error",
      });
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance),
        currency: formData.currency,
        ...(formData.bank_name && { bank_name: formData.bank_name }),
        ...(formData.account_no && { account_no: formData.account_no }),
      };

      if (isEdit) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}wallets/${id}`,
          payload,
          Config({ Authorization: `Bearer ${token}` })
        );
        toaster.create({
          description: "Wallet updated successfully",
          type: "success",
        });
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}wallets`,
          payload,
          Config({ Authorization: `Bearer ${token}` })
        );
        toaster.create({
          description: "Wallet created successfully",
          type: "success",
        });
      }

      navigate('/wallets');
    } catch (error) {
      console.error('Error saving wallet:', error);
      toaster.create({
        description: isEdit ? "Failed to update wallet" : "Failed to create wallet",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box minH="100vh" bg={bgColor} py={8}>
        <Container maxW="2xl">
          <Text textAlign="center">Loading wallet...</Text>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="2xl">
        <VStack gap={6} align="stretch">
          {/* Header */}
          <Flex align="center" gap={4}>
            <Button
              variant="ghost"
              onClick={() => navigate('/wallets')}
              leftIcon={<FiArrowLeft />}
            >
              Back to Wallets
            </Button>
          </Flex>

          <Box
            bg={cardBg}
            borderRadius="2xl"
            p={8}
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.200"
            _dark={{ borderColor: 'gray.700' }}
          >
            <VStack gap={6} align="stretch">
              <Flex align="center" gap={3}>
                <FiCreditCard size={24} />
                <Heading size="xl">
                  {isEdit ? 'Edit Wallet' : 'Create New Wallet'}
                </Heading>
              </Flex>

              <Text color="gray.600" _dark={{ color: 'gray.400' }}>
                {isEdit
                  ? 'Update your wallet information below'
                  : 'Add a new wallet to track your finances'
                }
              </Text>

              <form onSubmit={handleSubmit}>
                <VStack gap={6}>
                  <Field.Root required>
                    <Field.Label fontSize="lg" fontWeight="semibold">
                      Wallet Name
                    </Field.Label>
                    <Input
                      name="name"
                      placeholder="e.g., Main Checking"
                      value={formData.name}
                      onChange={handleInputChange}
                      size="lg"
                      required
                    />
                  </Field.Root>

                  <Field.Root required>
                    <SelectComponent
                      label="Wallet Type"
                      placeholder="Select type"
                      options={walletTypes.items}
                      value={formData.type ? [formData.type] : []}
                      onChange={(value) => handleSelectChange('type', value)}
                      width="100%"
                      size="lg"
                    />
                  </Field.Root>

                  <HStack w="full" gap={4}>
                    <Field.Root required flex={1}>
                      <Field.Label fontSize="lg" fontWeight="semibold">
                        Balance
                      </Field.Label>
                      <Input
                        name="balance"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.balance}
                        onChange={handleInputChange}
                        size="lg"
                        required
                      />
                    </Field.Root>

                    <Field.Root required flex={1}>
                      <SelectComponent
                        label="Currency"
                        placeholder="Select currency"
                        options={currencies.items}
                        value={formData.currency ? [formData.currency] : []}
                        onChange={(value) => handleSelectChange('currency', value)}
                        width="100%"
                        size="lg"
                      />
                    </Field.Root>
                  </HStack>

                  <Field.Root>
                    <Field.Label fontSize="lg" fontWeight="semibold">
                      Bank Name (optional)
                    </Field.Label>
                    <Input
                      name="bank_name"
                      placeholder="e.g., Bank ABC"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontSize="lg" fontWeight="semibold">
                      Account Number (optional)
                    </Field.Label>
                    <Input
                      name="account_no"
                      placeholder="Account number"
                      value={formData.account_no}
                      onChange={handleInputChange}
                      size="lg"
                    />
                  </Field.Root>

                  <HStack w="full" gap={4} pt={4}>
                    <Button
                      variant="outline"
                      onClick={() => navigate('/wallets')}
                      flex={1}
                      size="lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      colorPalette="blue"
                      type="submit"
                      loading={loading}
                      flex={1}
                      size="lg"
                    >
                      {isEdit ? 'Update' : 'Create'} Wallet
                    </Button>
                  </HStack>
                </VStack>
              </form>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default WalletForm;