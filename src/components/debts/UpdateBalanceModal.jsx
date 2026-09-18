import React, { useState, useEffect } from 'react';
import {
  Box,
  Field,
  Input,
  VStack,
  Text,
  HStack,
} from '@chakra-ui/react';
import BaseModal from '../BaseModal';
import { toaster } from '../ui/toaster';
import { useColorModeValue } from '../ui/color-mode';
import { formatCurrency } from './DebtCard';

export default function UpdateBalanceModal({
  isOpen,
  onClose,
  debt,
  onSubmit,
  isLoading = false,
}) {
  const [newBalance, setNewBalance] = useState('');
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);

  const surfaceBg = useColorModeValue('gray.50', 'gray.900/50');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (isOpen && debt) {
      setNewBalance(String(debt.current_balance || ''));
      setAsOfDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, debt]);

  const handleSubmit = () => {
    if (newBalance === '' || Number(newBalance) < 0) {
      toaster.create({ description: 'Please enter a valid balance', type: 'error' });
      return;
    }

    onSubmit({
      new_balance: Math.round(Number(newBalance)),
      as_of_date: asOfDate,
    });
  };

  const current = debt?.current_balance || 0;
  const next = Number(newBalance) || 0;
  const diff = next - current;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sync Balance — ${debt?.name || 'Debt'}`}
      description="Manually adjust the current balance to match your latest bank statement or credit card bill."
      onConfirm={handleSubmit}
      confirmText="Update Balance"
      isLoading={isLoading}
      size="md"
    >
      <VStack gap={4} align="stretch">
        <Box
          p={3.5}
          borderRadius="xl"
          bg={surfaceBg}
          border="1px solid"
          borderColor={borderColor}
        >
          <HStack justify="space-between" mb={1}>
            <Text fontSize="xs" color="gray.500">Current Recorded Balance:</Text>
            <Text fontSize="sm" fontWeight="bold">{formatCurrency(current)}</Text>
          </HStack>
          <HStack justify="space-between">
            <Text fontSize="xs" color="gray.500">Adjustment Difference:</Text>
            <Text
              fontSize="sm"
              fontWeight="bold"
              color={diff > 0 ? 'red.500' : diff < 0 ? 'green.500' : 'gray.500'}
            >
              {diff > 0 ? `+${formatCurrency(diff)}` : formatCurrency(diff)}
            </Text>
          </HStack>
        </Box>

        <Field.Root required>
          <Field.Label fontSize="xs" fontWeight="600">New Statement Balance (Rp)</Field.Label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 11500000"
            value={newBalance}
            onChange={(e) => setNewBalance(e.target.value)}
            borderRadius="xl"
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label fontSize="xs" fontWeight="600">As of Date</Field.Label>
          <Input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            borderRadius="xl"
          />
        </Field.Root>
      </VStack>
    </BaseModal>
  );
}
