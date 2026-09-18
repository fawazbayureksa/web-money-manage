import React, { useState, useEffect } from 'react';
import {
  Box,
  Field,
  Input,
  VStack,
  HStack,
  SimpleGrid,
  Text,
  Badge,
} from '@chakra-ui/react';
import BaseModal from '../BaseModal';
import { useColorModeValue } from '../ui/color-mode';
import { toaster } from '../ui/toaster';
import { getWallets } from '../../services/debtService';
import { formatCurrency } from './DebtCard';

const PAYMENT_TYPES = [
  { value: 'regular', label: 'Regular Payment' },
  { value: 'extra', label: 'Extra Principal Payment' },
  { value: 'interest_only', label: 'Interest-Only' },
  { value: 'payoff', label: 'Full Payoff' },
  { value: 'adjustment', label: 'Balance Adjustment' },
];

export default function RecordPaymentModal({
  isOpen,
  onClose,
  debt,
  onSubmit,
  isLoading = false,
}) {
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState('regular');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestAmount, setInterestAmount] = useState('0');
  const [feesAmount, setFeesAmount] = useState('0');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [sourceAssetId, setSourceAssetId] = useState('');
  const [notes, setNotes] = useState('');
  const [wallets, setWallets] = useState([]);

  const selectBg = useColorModeValue('white', '#1f2937');
  const selectBorder = useColorModeValue('#E2E8F0', '#374151');
  const textColor = useColorModeValue('#1A202C', '#EDEEEE');
  const previewBg = useColorModeValue('blue.50/60', 'blue.950/40');
  const previewBorder = useColorModeValue('blue.200', 'blue.800');

  useEffect(() => {
    if (isOpen && debt) {
      const defaultAmount = debt.minimum_payment || '';
      setAmount(String(defaultAmount));
      setPrincipalAmount(String(defaultAmount));
      setInterestAmount('0');
      setFeesAmount('0');
      setPaymentType('regular');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setSourceAssetId(debt.payment_asset_id ? String(debt.payment_asset_id) : '');
      setNotes('');
      fetchWalletsList();
    }
  }, [isOpen, debt]);

  const fetchWalletsList = async () => {
    try {
      const res = await getWallets();
      setWallets(res.data || []);
    } catch (err) {
      console.warn('Could not fetch wallets for payment modal:', err);
    }
  };

  const handleTotalAmountChange = (val) => {
    setAmount(val);
    if (paymentType === 'interest_only') {
      setInterestAmount(val);
      setPrincipalAmount('0');
    } else {
      // Default principal to amount minus current interest and fees
      const total = Number(val) || 0;
      const interest = Number(interestAmount) || 0;
      const fees = Number(feesAmount) || 0;
      const calcPrincipal = Math.max(0, total - interest - fees);
      setPrincipalAmount(String(calcPrincipal));
    }
  };

  const handleTypeChange = (type) => {
    setPaymentType(type);
    if (type === 'payoff' && debt) {
      setAmount(String(debt.current_balance));
      setPrincipalAmount(String(debt.current_balance));
      setInterestAmount('0');
      setFeesAmount('0');
    } else if (type === 'interest_only') {
      setPrincipalAmount('0');
      setInterestAmount(amount);
    }
  };

  const currentBalance = debt?.current_balance || 0;
  const numPrincipal = Number(principalAmount) || 0;
  const estimatedBalanceAfter = Math.max(0, currentBalance - numPrincipal);

  const handleSubmit = () => {
    const numAmount = Math.round(Number(amount));
    if (!numAmount || numAmount <= 0) {
      toaster.create({ description: 'Please enter a valid payment amount', type: 'error' });
      return;
    }

    const payload = {
      amount: numAmount,
      payment_type: paymentType,
      principal_amount: Math.round(Number(principalAmount) || 0),
      interest_amount: Math.round(Number(interestAmount) || 0),
      fees_amount: Math.round(Number(feesAmount) || 0),
      payment_date: paymentDate,
      source_asset_id: sourceAssetId ? Number(sourceAssetId) : undefined,
      notes: notes.trim() || undefined,
    };

    onSubmit(payload);
  };

  const selectStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '10px',
    border: `1px solid ${selectBorder}`,
    backgroundColor: selectBg,
    color: textColor,
    fontSize: '14px',
    outline: 'none',
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment — ${debt?.name || 'Debt'}`}
      description="Record an installment, extra payoff, or interest payment towards this balance."
      onConfirm={handleSubmit}
      confirmText="Submit Payment"
      isLoading={isLoading}
      size="xl"
    >
      <VStack gap={4} align="stretch">
        {/* Dynamic Balance Impact Preview */}
        <Box p={3.5} borderRadius="xl" bg={previewBg} border="1px solid" borderColor={previewBorder}>
          <SimpleGrid columns={3} gap={2} textAlign="center">
            <Box>
              <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color="gray.500">
                Current Balance
              </Text>
              <Text fontSize="md" fontWeight="bold">
                {formatCurrency(currentBalance)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color="blue.500">
                Principal Paid
              </Text>
              <Text fontSize="md" fontWeight="bold" color="blue.500">
                -{formatCurrency(numPrincipal)}
              </Text>
            </Box>
            <Box>
              <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color="green.600">
                Remaining Balance
              </Text>
              <Text fontSize="md" fontWeight="bold" color={estimatedBalanceAfter === 0 ? 'green.500' : undefined}>
                {formatCurrency(estimatedBalanceAfter)}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Total Payment Amount (Rp)</Field.Label>
            <Input
              type="number"
              min="1"
              placeholder="e.g. 1000000"
              value={amount}
              onChange={(e) => handleTotalAmountChange(e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Payment Type</Field.Label>
            <select
              style={selectStyle}
              value={paymentType}
              onChange={(e) => handleTypeChange(e.target.value)}
            >
              {PAYMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field.Root>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={3}>
          <Field.Root>
            <Field.Label fontSize="xs" fontWeight="600">Principal (Rp)</Field.Label>
            <Input
              type="number"
              min="0"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="xs" fontWeight="600">Interest (Rp)</Field.Label>
            <Input
              type="number"
              min="0"
              value={interestAmount}
              onChange={(e) => setInterestAmount(e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="xs" fontWeight="600">Fees / Charges (Rp)</Field.Label>
            <Input
              type="number"
              min="0"
              value={feesAmount}
              onChange={(e) => setFeesAmount(e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Payment Date</Field.Label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="xs" fontWeight="600">Source Wallet / Account</Field.Label>
            <select
              style={selectStyle}
              value={sourceAssetId}
              onChange={(e) => setSourceAssetId(e.target.value)}
            >
              <option value="">Do not deduct wallet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.bank_name ? `(${w.bank_name})` : ''} - {formatCurrency(w.balance)}
                </option>
              ))}
            </select>
          </Field.Root>
        </SimpleGrid>

        <Field.Root>
          <Field.Label fontSize="xs" fontWeight="600">Payment Notes (Optional)</Field.Label>
          <Input
            placeholder="e.g. Regular monthly autopay or extra payment from bonus"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            borderRadius="xl"
          />
        </Field.Root>
      </VStack>
    </BaseModal>
  );
}
