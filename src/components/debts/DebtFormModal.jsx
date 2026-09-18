import React, { useState, useEffect } from 'react';
import {
  Box,
  Field,
  Input,
  VStack,
  HStack,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import BaseModal from '../BaseModal';
import { useColorModeValue } from '../ui/color-mode';
import { toaster } from '../ui/toaster';
import { getWallets } from '../../services/debtService';

const DEBT_TYPES = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'other', label: 'Other' },
];

const INTEREST_TYPES = [
  { value: 'fixed', label: 'Fixed Rate' },
  { value: 'variable', label: 'Variable Rate' },
];

const initialFormState = {
  name: '',
  debt_type: 'credit_card',
  creditor_name: '',
  original_amount: '',
  current_balance: '',
  interest_rate: '',
  interest_type: 'fixed',
  minimum_payment: '',
  payment_due_day: 15,
  start_date: new Date().toISOString().split('T')[0],
  payment_asset_id: '',
  notes: '',
  include_in_net_worth: true,
  auto_track_interest: false,
};

export default function DebtFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [wallets, setWallets] = useState([]);
  const [loadingWallets, setLoadingWallets] = useState(false);

  const selectBg = useColorModeValue('white', '#1f2937');
  const selectBorder = useColorModeValue('#E2E8F0', '#374151');
  const textColor = useColorModeValue('#1A202C', '#EDEEEE');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || '',
          debt_type: initialData.debt_type || 'credit_card',
          creditor_name: initialData.creditor_name || '',
          original_amount: initialData.original_amount !== undefined ? String(initialData.original_amount) : '',
          current_balance: initialData.current_balance !== undefined ? String(initialData.current_balance) : '',
          interest_rate: initialData.interest_rate !== undefined ? String(initialData.interest_rate) : '',
          interest_type: initialData.interest_type || 'fixed',
          minimum_payment: initialData.minimum_payment !== undefined ? String(initialData.minimum_payment) : '',
          payment_due_day: initialData.payment_due_day || 15,
          start_date: initialData.start_date || new Date().toISOString().split('T')[0],
          payment_asset_id: initialData.payment_asset_id ? String(initialData.payment_asset_id) : '',
          notes: initialData.notes || '',
          include_in_net_worth: initialData.include_in_net_worth ?? true,
          auto_track_interest: initialData.auto_track_interest ?? false,
        });
      } else {
        setFormData(initialFormState);
      }
      fetchWalletsList();
    }
  }, [isOpen, initialData]);

  const fetchWalletsList = async () => {
    try {
      setLoadingWallets(true);
      const res = await getWallets();
      setWallets(res.data || []);
    } catch (err) {
      console.warn('Could not fetch wallets for debt form:', err);
    } finally {
      setLoadingWallets(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Convenience: if original_amount changes and current_balance is empty, sync it
      if (field === 'original_amount' && !prev.current_balance && !initialData) {
        updated.current_balance = value;
      }
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toaster.create({ description: 'Please enter a debt name', type: 'error' });
      return;
    }
    if (!formData.original_amount || Number(formData.original_amount) <= 0) {
      toaster.create({ description: 'Please enter a valid original amount', type: 'error' });
      return;
    }
    if (formData.current_balance === '' || Number(formData.current_balance) < 0) {
      toaster.create({ description: 'Please enter a valid current balance', type: 'error' });
      return;
    }
    if (formData.interest_rate === '' || Number(formData.interest_rate) < 0) {
      toaster.create({ description: 'Please enter a valid annual interest rate', type: 'error' });
      return;
    }
    if (!formData.minimum_payment || Number(formData.minimum_payment) < 0) {
      toaster.create({ description: 'Please enter a valid minimum monthly payment', type: 'error' });
      return;
    }
    const dueDay = Number(formData.payment_due_day);
    if (!dueDay || dueDay < 1 || dueDay > 31) {
      toaster.create({ description: 'Payment due day must be between 1 and 31', type: 'error' });
      return;
    }

    const payload = {
      name: formData.name.trim(),
      debt_type: formData.debt_type,
      creditor_name: formData.creditor_name.trim() || undefined,
      original_amount: Math.round(Number(formData.original_amount)),
      current_balance: Math.round(Number(formData.current_balance)),
      interest_rate: parseFloat(formData.interest_rate),
      interest_type: formData.interest_type,
      minimum_payment: Math.round(Number(formData.minimum_payment)),
      payment_due_day: dueDay,
      start_date: formData.start_date,
      payment_asset_id: formData.payment_asset_id ? Number(formData.payment_asset_id) : undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (initialData) {
      payload.include_in_net_worth = formData.include_in_net_worth;
      payload.auto_track_interest = formData.auto_track_interest;
    }

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
      title={initialData ? 'Edit Debt' : 'Add New Debt'}
      onConfirm={handleSubmit}
      confirmText={initialData ? 'Save Changes' : 'Create Debt'}
      isLoading={isLoading}
      size="2xl"
    >
      <VStack gap={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Debt Name</Field.Label>
            <Input
              placeholder="e.g. BCA Credit Card Platinum"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Debt Type</Field.Label>
            <select
              style={selectStyle}
              value={formData.debt_type}
              onChange={(e) => handleChange('debt_type', e.target.value)}
            >
              {DEBT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field.Root>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Field.Root>
            <Field.Label fontSize="xs" fontWeight="600">Creditor / Lender Name</Field.Label>
            <Input
              placeholder="e.g. Bank BCA / Mandiri"
              value={formData.creditor_name}
              onChange={(e) => handleChange('creditor_name', e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root>
            <Field.Label fontSize="xs" fontWeight="600">Payment Account / Wallet</Field.Label>
            <select
              style={selectStyle}
              value={formData.payment_asset_id}
              onChange={(e) => handleChange('payment_asset_id', e.target.value)}
            >
              <option value="">None (manual tracking)</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} {w.bank_name ? `(${w.bank_name})` : ''}
                </option>
              ))}
            </select>
          </Field.Root>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Original Amount (Rp)</Field.Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 15000000"
              value={formData.original_amount}
              onChange={(e) => handleChange('original_amount', e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Current Balance (Rp)</Field.Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 12000000"
              value={formData.current_balance}
              onChange={(e) => handleChange('current_balance', e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Interest Rate (Annual %)</Field.Label>
            <Input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 24.0"
              value={formData.interest_rate}
              onChange={(e) => handleChange('interest_rate', e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Interest Type</Field.Label>
            <select
              style={selectStyle}
              value={formData.interest_type}
              onChange={(e) => handleChange('interest_type', e.target.value)}
            >
              {INTEREST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Min. Monthly Payment (Rp)</Field.Label>
            <Input
              type="number"
              min="0"
              placeholder="e.g. 500000"
              value={formData.minimum_payment}
              onChange={(e) => handleChange('minimum_payment', e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Payment Due Day of Month</Field.Label>
            <Input
              type="number"
              min="1"
              max="31"
              placeholder="1 - 31"
              value={formData.payment_due_day}
              onChange={(e) => handleChange('payment_due_day', e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>

          <Field.Root required>
            <Field.Label fontSize="xs" fontWeight="600">Start / Issue Date</Field.Label>
            <Input
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              borderRadius="xl"
            />
          </Field.Root>
        </SimpleGrid>

        <Field.Root>
          <Field.Label fontSize="xs" fontWeight="600">Notes / Details (Optional)</Field.Label>
          <Input
            placeholder="e.g. 0% promo interest for first 6 months, card ending in 4123"
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            borderRadius="xl"
          />
        </Field.Root>
      </VStack>
    </BaseModal>
  );
}
