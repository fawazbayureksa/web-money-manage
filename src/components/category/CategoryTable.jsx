import React from 'react';
import { HStack, Badge, Flex, Text, IconButton } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import { FiFolder, FiTrash2 } from 'react-icons/fi';
import { BaseTable } from '../BaseTable';

export default function CategoryTable({ categories, onDelete }) {
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const folderBg = useColorModeValue('blue.50', 'blue.950/50');

  const columns = [
    {
      header: 'Category',
      render: (item, index) => (
        <HStack gap={3}>
          <Badge
            size="sm"
            variant="subtle"
            colorPalette="blue"
            borderRadius="lg"
            px={2}
            py={0.5}
            fontWeight="700"
          >
            #{index + 1}
          </Badge>
          <Flex w={8} h={8} borderRadius="lg" bg={folderBg} align="center" justify="center">
            <FiFolder size={16} color="var(--chakra-colors-blue-500)" />
          </Flex>
          <Text fontWeight="700" fontSize="sm">
            {item.CategoryName}
          </Text>
        </HStack>
      )
    },
    {
      header: 'Description',
      render: (item) => (
        <Text fontSize="sm" color={item.Description ? 'inherit' : subtitleColor}>
          {item.Description || 'No description provided'}
        </Text>
      )
    },
    {
      header: 'Actions',
      textAlign: 'end',
      render: (item) => (
        <HStack gap={2} justify="flex-end">
          <IconButton
            variant="ghost"
            colorPalette="red"
            size="sm"
            onClick={() => onDelete(item.ID)}
            aria-label="Delete category"
            borderRadius="lg"
          >
            <FiTrash2 />
          </IconButton>
        </HStack>
      )
    }
  ];

  return <BaseTable columns={columns} data={categories} keyField="ID" />;
}
