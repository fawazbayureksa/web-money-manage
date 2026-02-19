import React, { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Spinner,
  Table,
  Text,
  Button,
  Dialog,
  Portal,
  CloseButton,
  Field,
  Input,
  Flex,
  HStack,
  Icon,
  VStack,
  Badge,
  EmptyState,
  IconButton
} from "@chakra-ui/react";
import { toaster } from "./../../components/ui/toaster";
import { useColorModeValue } from '../../components/ui/color-mode';
import axios from 'axios';
import Config from '../../components/axios/Config';
import { FiFolder, FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    fetchCategory();
  }, []);

  const fetchCategory = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    const url = import.meta.env.VITE_API_URL + 'categories';

    let axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${token}` }))

    await axiosInstance.then(response => {
      setCategories(response.data.data || []);
    }).catch(error => {
      console.error(error);
      setError(error);
      toaster.create({
        description: "Failed to fetch categories",
        type: "error",
      });
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleAddCategory = async () => {
    if (!categoryName) {
      toaster.create({
        description: "Please enter a category name",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const body = {
      categoryName,
      description
    };

    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_API_URL + 'categories';

    let axiosInstance = axios.post(url, body, Config({ Authorization: `Bearer ${token}` }))

    axiosInstance.then(response => {
      setCategories([...categories, response.data.data]);
      setModal(false);
      setCategoryName('');
      setDescription('');
      toaster.create({
        description: "Category created successfully",
        type: "success",
      });

    }).catch(error => {
      console.error(error);
      setError(error);
      toaster.create({
        description: "Failed to create category",
        type: "error",
      });
    }).finally(() => {
      setLoading(false);
      setError(null);
    });
  };

  const deleteCategory = async (id) => {
    setLoading(true);
    const token = localStorage.getItem('token');
    const url = import.meta.env.VITE_API_URL + 'categories/' + id;

    let axiosInstance = axios.delete(url, Config({ Authorization: `Bearer ${token}` }))

    axiosInstance.then(response => {
      if (response.data.success) {
        setCategories(categories.filter(category => category.ID !== id));
        toaster.create({
          description: "Category deleted successfully",
          type: "success",
        });
      }
    }).catch(error => {
      toaster.create({
        description: "Failed to delete category",
        type: "error",
      });
      console.error(error);
      setError(error);
    }).finally(() => {
      setLoading(false);
      setError(null);
    });
  };

  const handleDelete = (id) => {
    deleteCategory(id);
  };

  const handleOpenModal = () => {
    setCategoryName('');
    setDescription('');
    setModal(true);
  };

  return (
    <>
      <Box maxW="6xl" mx="auto" px={4} py={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Flex align="center" gap={3}>
              <Icon as={FiFolder} boxSize={6} color="blue.500" />
              <Heading as="h1" size="xl" fontWeight="bold">
                Categories
              </Heading>
            </Flex>
            <Text color={subtitleColor} mt={1}>
              Manage your expense and income categories
            </Text>
          </Box>
          <Button
            colorPalette="blue"
            onClick={handleOpenModal}
            leftIcon={<FiPlus />}
          >
            Add Category
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py={16}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : categories.length > 0 ? (
          <Table.Root
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Table.Header>
              <Table.Row bg={{ base: 'gray.50', _dark: 'gray.900' }}>
                <Table.ColumnHeader>Category Name</Table.ColumnHeader>
                <Table.ColumnHeader>Description</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {categories.map((item, index) => (
                <Table.Row key={item.ID} borderBottom={index !== categories.length - 1 && "1px solid"} borderBottomColor={borderColor}>
                  <Table.Cell>
                    <HStack gap={3}>
                      <Badge colorPalette="blue" variant="subtle" px={2} py={1} borderRadius="md" fontSize="sm">
                        {index + 1}
                      </Badge>
                      <Text fontWeight="medium">{item.CategoryName}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Text color={item.Description ? 'inherit' : 'gray.400'}>
                      {item.Description || 'No description'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack gap={2} justify="flex-end">
                      <IconButton
                        variant="ghost"
                        colorPalette="red"
                        size="sm"
                        onClick={() => handleDelete(item.ID)}
                        aria-label="Delete category"
                      >
                        <FiTrash2 />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
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
                <Icon as={FiFolder} boxSize={8} color="blue.500" />
              </Box>
              <VStack gap={2}>
                <Text fontSize="xl" fontWeight="bold">
                  No categories yet
                </Text>
                <Text color={subtitleColor} maxW="sm">
                  Get started by creating your first category to track your expenses and income.
                </Text>
              </VStack>
              <Button
                colorPalette="blue"
                onClick={handleOpenModal}
                leftIcon={<FiPlus />}
              >
                Create First Category
              </Button>
            </VStack>
          </Box>
        )}
      </Box>

      <Dialog.Root lazyMount open={modal} onOpenChange={(e) => setModal(e.open)}>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Create New Category</Dialog.Title>
                <Dialog.Description>
                  Add a new category to organize your transactions
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required>
                    <Field.Label>
                      Category Name <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      placeholder="e.g., Food, Transportation"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>
                      Description
                    </Field.Label>
                    <Input
                      placeholder="Brief description of this category"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  type="submit"
                  onClick={handleAddCategory}
                  loading={loading}
                  colorPalette="blue"
                >
                  Create Category
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
}
