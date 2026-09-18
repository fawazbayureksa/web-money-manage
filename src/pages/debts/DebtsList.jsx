import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  SimpleGrid,
  Badge,
  Spinner,
  Icon,
} from '@chakra-ui/react';
import { useColorModeValue } from '../../components/ui/color-mode';
import { toaster } from '../../components/ui/toaster';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiPlus,
  FiCreditCard,
  FiTrendingDown,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiPieChart,
  FiAward,
  FiZap,
} from 'react-icons/fi';

import StatCard from '../../components/dashboard/StatCard';
import { VisibilityToggle } from '../../components/ui/VisibilityToggle';
import { useLocalValueVisibility } from '../../hooks/useValueVisibility';
import BaseModal from '../../components/BaseModal';

import DebtCard, { formatCurrency } from '../../components/debts/DebtCard';
import DebtFormModal from '../../components/debts/DebtFormModal';
import RecordPaymentModal from '../../components/debts/RecordPaymentModal';
import UpdateBalanceModal from '../../components/debts/UpdateBalanceModal';

import {
  getDebts,
  createDebt,
  updateDebt,
  deleteDebt,
  recordDebtPayment,
  updateDebtBalance,
} from '../../services/debtService';

export default function DebtsList() {
  const navigate = useNavigate();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [paymentDebt, setPaymentDebt] = useState(null);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [balanceDebt, setBalanceDebt] = useState(null);
  const [balanceSubmitting, setBalanceSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  const promoBg = useColorModeValue('linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)');

  const { isHidden, toggleVisibility, formatValue } = useLocalValueVisibility();
  const displayCurrency = (amount) => formatValue(amount, formatCurrency);

  useEffect(() => {
    fetchDebtsData();
  }, [statusFilter]);

  const fetchDebtsData = async () => {
    try {
      setLoading(true);
      const res = await getDebts(statusFilter === 'all' ? '' : statusFilter);
      if (res.data) {
        setDebts(res.data.debts || []);
        setSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error('Error fetching debts:', err);
      toaster.create({
        description: err.response?.data?.message || 'Failed to load debt records',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (payload) => {
    try {
      setFormSubmitting(true);
      if (editingDebt) {
        await updateDebt(editingDebt.id, payload);
        toaster.create({ description: 'Debt updated successfully', type: 'success' });
      } else {
        await createDebt(payload);
        toaster.create({ description: 'Debt added successfully', type: 'success' });
      }
      setIsFormOpen(false);
      setEditingDebt(null);
      fetchDebtsData();
    } catch (err) {
      console.error('Error saving debt:', err);
      toaster.create({
        description: err.response?.data?.message || 'Failed to save debt',
        type: 'error',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (payload) => {
    if (!paymentDebt) return;
    try {
      setPaymentSubmitting(true);
      const res = await recordDebtPayment(paymentDebt.id, payload);
      if (res.data?.is_paid_off) {
        toaster.create({
          title: '🏆 Congratulations!',
          description: `${paymentDebt.name} is now fully paid off!`,
          type: 'success',
        });
      } else {
        toaster.create({
          description: 'Payment recorded successfully',
          type: 'success',
        });
      }
      setPaymentDebt(null);
      fetchDebtsData();
    } catch (err) {
      console.error('Error recording payment:', err);
      toaster.create({
        description: err.response?.data?.message || 'Failed to record payment',
        type: 'error',
      });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleBalanceSubmit = async (payload) => {
    if (!balanceDebt) return;
    try {
      setBalanceSubmitting(true);
      await updateDebtBalance(balanceDebt.id, payload);
      toaster.create({
        description: 'Balance updated successfully',
        type: 'success',
      });
      setBalanceDebt(null);
      fetchDebtsData();
    } catch (err) {
      console.error('Error updating balance:', err);
      toaster.create({
        description: err.response?.data?.message || 'Failed to update balance',
        type: 'error',
      });
    } finally {
      setBalanceSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteSubmitting(true);
      await deleteDebt(deleteTarget.id);
      toaster.create({ description: 'Debt removed successfully', type: 'success' });
      setDeleteTarget(null);
      fetchDebtsData();
    } catch (err) {
      console.error('Error deleting debt:', err);
      toaster.create({
        description: err.response?.data?.message || 'Failed to delete debt',
        type: 'error',
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap={4}
          mb={8}
          pb={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Box>
            <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
              Debt Tracker
            </Heading>
            <Text color={subtitleColor} fontSize="md">
              Monitor balances, accelerate payoff strategies, and achieve debt freedom.
            </Text>
          </Box>

          <HStack gap={3}>
            <VisibilityToggle isHidden={isHidden} onToggle={toggleVisibility} />
            <Button
              asChild
              variant="outline"
              borderColor={borderColor}
              size="md"
              borderRadius="xl"
              fontWeight="600"
            >
              <Link to="/debts/strategies">
                <HStack gap={2}>
                  <FiZap />
                  <Text>Payoff Strategies</Text>
                </HStack>
              </Link>
            </Button>
            <Button
              onClick={() => {
                setEditingDebt(null);
                setIsFormOpen(true);
              }}
              bg="blue.500"
              color="white"
              _hover={{ bg: 'blue.600' }}
              size="md"
              borderRadius="xl"
              px={5}
              fontWeight="600"
              boxShadow="xs"
            >
              <FiPlus style={{ marginRight: '6px' }} />
              Add Debt
            </Button>
          </HStack>
        </Flex>

        {summary && (
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4} mb={8}>
            <StatCard
              title="Total Outstanding Debt"
              value={summary.total_debt}
              icon={FiCreditCard}
              colorScheme="red"
              formatValue={displayCurrency}
            />
            <StatCard
              title="Total Minimum Payment"
              value={summary.total_minimum_payment}
              icon={FiDollarSign}
              colorScheme="blue"
              formatValue={displayCurrency}
            />
            <StatCard
              title="Paid This Month"
              value={summary.total_paid_this_month}
              icon={FiCheckCircle}
              colorScheme="green"
              formatValue={displayCurrency}
              changeLabel={`${summary.debts_paid_this_month || 0} of ${(summary.debts_paid_this_month || 0) + (summary.debts_unpaid_this_month || 0)} paid`}
            />
            <StatCard
              title="Average Interest Rate"
              value={`${summary.avg_interest_rate || 0}%`}
              icon={FiTrendingDown}
              colorScheme="purple"
              changeLabel={summary.projected_payoff_date ? `Payoff: ${summary.projected_payoff_date}` : 'Fixed & Variable'}
            />
          </SimpleGrid>
        )}
        <Flex
          justify="space-between"
          align={{ base: 'flex-start', sm: 'center' }}
          direction={{ base: 'column', sm: 'row' }}
          gap={3}
          mb={6}
        >
          <HStack gap={1} bg={useColorModeValue('white', 'gray.800')} p={1} borderRadius="xl" border="1px solid" borderColor={borderColor}>
            {[
              { id: 'active', label: 'Active' },
              { id: 'paid_off', label: 'Paid Off' },
              { id: 'all', label: 'All Debts' },
              { id: 'defaulted', label: 'Defaulted' },
              { id: 'settled', label: 'Settled' },
            ].map((tab) => (
              <Button
                key={tab.id}
                size="xs"
                variant={statusFilter === tab.id ? 'solid' : 'ghost'}
                bg={statusFilter === tab.id ? 'blue.500' : 'transparent'}
                color={statusFilter === tab.id ? 'white' : subtitleColor}
                borderRadius="lg"
                fontWeight="600"
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </HStack>

          <Text fontSize="xs" color={subtitleColor}>
            Showing {debts.length} {debts.length === 1 ? 'account' : 'accounts'}
          </Text>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" minH="240px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : debts.length === 0 ? (
          <Box
            p={{ base: 8, md: 12 }}
            textAlign="center"
            bg={cardBg}
            borderRadius="2xl"
            border="1px dashed"
            borderColor={borderColor}
          >
            <Flex
              w={16}
              h={16}
              borderRadius="2xl"
              bg={useColorModeValue('blue.50', 'blue.950/40')}
              color={useColorModeValue('blue.600', 'blue.400')}
              align="center"
              justify="center"
              mx="auto"
              mb={4}
            >
              <FiCreditCard size={32} />
            </Flex>
            <Heading as="h4" size="md" mb={2}>
              {statusFilter === 'active'
                ? 'No active debts found'
                : `No debts in "${statusFilter}" status`}
            </Heading>
            <Text color={subtitleColor} fontSize="sm" maxW="md" mx="auto" mb={6}>
              {statusFilter === 'active'
                ? 'Great job, or add your loans and credit cards to begin tracking balances, due dates, and payoffs.'
                : 'Switch tabs or create a new debt profile to begin tracking.'}
            </Text>
            <Button
              onClick={() => {
                setEditingDebt(null);
                setIsFormOpen(true);
              }}
              bg="blue.500"
              color="white"
              _hover={{ bg: 'blue.600' }}
              borderRadius="xl"
              fontWeight="600"
            >
              <FiPlus style={{ marginRight: '6px' }} />
              Add Your First Debt
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
            {debts.map((debt) => (
              <DebtCard
                key={debt.id}
                debt={debt}
                displayValue={displayCurrency}
                onRecordPayment={(d) => setPaymentDebt(d)}
                onUpdateBalance={(d) => setBalanceDebt(d)}
                onEdit={(d) => {
                  setEditingDebt(d);
                  setIsFormOpen(true);
                }}
                onDelete={(d) => setDeleteTarget(d)}
              />
            ))}
          </SimpleGrid>
        )}
      </Box>

      <DebtFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDebt(null);
        }}
        initialData={editingDebt}
        onSubmit={handleFormSubmit}
        isLoading={formSubmitting}
      />

      <RecordPaymentModal
        isOpen={Boolean(paymentDebt)}
        onClose={() => setPaymentDebt(null)}
        debt={paymentDebt}
        onSubmit={handlePaymentSubmit}
        isLoading={paymentSubmitting}
      />

      <UpdateBalanceModal
        isOpen={Boolean(balanceDebt)}
        onClose={() => setBalanceDebt(null)}
        debt={balanceDebt}
        onSubmit={handleBalanceSubmit}
        isLoading={balanceSubmitting}
      />

      <BaseModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Debt Record"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        isDestructive
        isLoading={deleteSubmitting}
        size="md"
      >
        <Text fontSize="sm" color="gray.500">
          All linked projections for this debt will be removed. Payment history records tied to past transactions will remain unaffected.
        </Text>
      </BaseModal>
    </Box>
  );
}
