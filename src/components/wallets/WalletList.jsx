import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Badge,
  Flex,
  SimpleGrid,
  Card,
} from '@chakra-ui/react';
import { FiEdit, FiTrash2, FiCreditCard } from 'react-icons/fi';
import { useColorModeValue } from '../ui/color-mode';

const WalletList = ({ wallets, onEdit, onDelete, formatCurrency }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');

  if (wallets.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Text color="gray.500" fontSize="lg">
          No wallets found. Create your first wallet to get started!
        </Text>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
      {wallets.map((wallet) => (
        <Card.Root key={wallet.id} bg={cardBg} p={4}>
          <Card.Body>
            <VStack align="stretch" gap={3}>
              <Flex justify="space-between" align="start">
                <Box>
                  <HStack gap={2} mb={1}>
                    <FiCreditCard />
                    <Text fontWeight="semibold">{wallet.name}</Text>
                  </HStack>
                  <Badge colorPalette="blue" variant="subtle" size="sm">
                    {wallet.type}
                  </Badge>
                </Box>
                <HStack gap={1}>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="blue"
                    onClick={() => onEdit(wallet)}
                    aria-label="Edit wallet"
                  >
                    <FiEdit />
                  </IconButton>
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="red"
                    onClick={() => onDelete(wallet.id)}
                    aria-label="Delete wallet"
                  >
                    <FiTrash2 />
                  </IconButton>
                </HStack>
              </Flex>

              <Box>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {formatCurrency(wallet.balance, wallet.currency)}
                </Text>
                <Text fontSize="sm" color="gray.600">
                  {wallet.currency}
                </Text>
              </Box>

              {wallet.bank_name && (
                <Text fontSize="sm" color="gray.500">
                  {wallet.bank_name}
                </Text>
              )}

              {wallet.account_no && (
                <Text fontSize="sm" color="gray.500">
                  ****{wallet.account_no.slice(-4)}
                </Text>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </SimpleGrid>
  );
};

export default WalletList;