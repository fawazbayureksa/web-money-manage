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
  Progress,
  IconButton,
  Input,
  Card,
  Table,
  Icon,
} from '@chakra-ui/react';
import { useColorModeValue } from '../../components/ui/color-mode';
import { toaster } from '../../components/ui/toaster';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiPlus,
  FiCreditCard,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiEdit2,
  FiTrash2,
  FiTrendingDown,
  FiAward,
  FiZap,
  FiFileText,
  FiRefreshCw,
} from 'react-icons/fi';

import BaseModal from '../../components/BaseModal';
import DebtTimelineChart from '../../components/debts/DebtTimelineChart';
import DebtFormModal from '../../components/debts/DebtFormModal';
import RecordPaymentModal from '../../components/debts/RecordPaymentModal';
import UpdateBalanceModal from '../../components/debts/UpdateBalanceModal';
import { formatCurrency } from '../../components/debts/DebtCard';

import {
  getDebtDetail,
  getDebtTimeline,
  updateDebt,
  deleteDebt,
  recordDebtPayment,
  updateDebtBalance,
} from '../../services/debtService';

export default function DebtDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [debt, setDebt] = useState(null);
  const [loading, setLoading] = useState(true);

  const [timelineData, setTimelineData] = useState(null);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('minimum');
  const [extraPayment, setExtraPayment] = useState(0);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [isBalanceOpen, setIsBalanceOpen] = useState(false);
  const [balanceSubmitting, setBalanceSubmitting] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  const surfaceSubtle = useColorModeValue('gray.50', 'gray.900/40');

  useEffect(() => {
    fetchDebt();
  }, [id]);

  useEffect(() => {
    if (debt) {
      fetchTimeline();
    }
  }, [id, selectedStrategy, extraPayment, debt?.id]);

  const fetchDebt = async () => {
    try {
      setLoading(true);
      const res = await getDebtDetail(id, { include_payments: true, include_milestones: true });
      setDebt(res.data);
    } catch (err) {
      console.error('Error fetching debt detail:', err);
      toaster.create({
        description: err.response?.data?.message || 'Failed to fetch debt details',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      setTimelineLoading(true);
      const res = await getDebtTimeline(id, {
        strategy: selectedStrategy,
        extra_payment: Number(extraPayment) || 0,
      });
      setTimelineData(res.data);
    } catch (err) {
      console.warn('Could not fetch timeline:', err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleEditSubmit = async (payload) => {
    try {
      setEditSubmitting(true);
      await updateDebt(id, payload);
      toaster.create({ description: 'Debt details updated', type: 'success' });
      setIsEditOpen(false);
      fetchDebt();
    } catch (err) {
      toaster.create({
        description: err.response?.data?.message || 'Failed to update debt',
        type: 'error',
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handlePaymentSubmit = async (payload) => {
    try {
      setPaymentSubmitting(true);
      const res = await recordDebtPayment(id, payload);
      if (res.data?.is_paid_off) {
        toaster.create({
          title: '🏆 Fully Paid Off!',
          description: `You have successfully paid off ${debt.name}!`,
          type: 'success',
        });
      } else {
        toaster.create({ description: 'Payment recorded successfully', type: 'success' });
      }
      setIsPaymentOpen(false);
      fetchDebt();
    } catch (err) {
      toaster.create({
        description: err.response?.data?.message || 'Failed to record payment',
        type: 'error',
      });
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleBalanceSubmit = async (payload) => {
    try {
      setBalanceSubmitting(true);
      await updateDebtBalance(id, payload);
      toaster.create({ description: 'Balance updated successfully', type: 'success' });
      setIsBalanceOpen(false);
      fetchDebt();
    } catch (err) {
      toaster.create({
        description: err.response?.data?.message || 'Failed to update balance',
        type: 'error',
      });
    } finally {
      setBalanceSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleteSubmitting(true);
      await deleteDebt(id);
      toaster.create({ description: 'Debt deleted successfully', type: 'success' });
      navigate('/debts');
    } catch (err) {
      toaster.create({
        description: err.response?.data?.message || 'Failed to delete debt',
        type: 'error',
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!debt) {
    return (
      <Box p={8} textAlign="center">
        <Text fontSize="lg" color="gray.500" mb={4}>Debt account not found.</Text>
        <Button asChild variant="outline">
          <Link to="/debts">Back to Debts</Link>
        </Button>
      </Box>
    );
  }

  const percentage = Math.min(
    Math.max(debt.paid_off_percentage !== undefined ? debt.paid_off_percentage : 0, 0),
    100
  );
  const isPaidOff = debt.status === 'paid_off' || debt.current_balance <= 0;

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        <Flex align="center" gap={2} mb={6}>
          <Button
            asChild
            variant="ghost"
            size="xs"
            color={subtitleColor}
            _hover={{ color: 'blue.500' }}
          >
            <Link to="/debts">
              <HStack gap={1}>
                <FiArrowLeft />
                <Text>Back to Debt Tracker</Text>
              </HStack>
            </Link>
          </Button>
          <Text color={subtitleColor}>/</Text>
          <Text fontSize="xs" fontWeight="semibold" color="blue.500">
            {debt.name}
          </Text>
        </Flex>

        <Flex
          justify="space-between"
          align={{ base: 'flex-start', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap={4}
          mb={8}
          pb={6}
          borderBottom="1px solid"
          borderColor={borderColor}
        >
          <Box>
            <HStack gap={2} mb={2} wrap="wrap">
              <Badge colorPalette="blue" variant="subtle" px={2.5} py={0.5} borderRadius="full">
                {debt.debt_type?.replace('_', ' ').toUpperCase()}
              </Badge>
              {debt.creditor_name && (
                <Badge colorPalette="gray" variant="outline" px={2.5} py={0.5} borderRadius="full">
                  {debt.creditor_name}
                </Badge>
              )}
              {isPaidOff ? (
                <Badge colorPalette="green" variant="solid" px={2.5} py={0.5} borderRadius="full">
                  Fully Paid
                </Badge>
              ) : debt.current_month_paid ? (
                <Badge colorPalette="teal" variant="subtle" px={2.5} py={0.5} borderRadius="full">
                  Paid this month
                </Badge>
              ) : (
                <Badge colorPalette="red" variant="subtle" px={2.5} py={0.5} borderRadius="full">
                  Due in {debt.days_until_due ?? debt.payment_due_day}d
                </Badge>
              )}
            </HStack>
            <Heading as="h1" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight">
              {debt.name}
            </Heading>
            {debt.notes && (
              <Text color={subtitleColor} fontSize="sm" mt={1}>
                {debt.notes}
              </Text>
            )}
          </Box>

          <HStack gap={2} wrap="wrap">
            {!isPaidOff && (
              <Button
                onClick={() => setIsPaymentOpen(true)}
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
                borderRadius="xl"
                fontWeight="600"
                size="md"
              >
                <FiPlus style={{ marginRight: '6px' }} />
                Record Payment
              </Button>
            )}
            <Button
              onClick={() => setIsBalanceOpen(true)}
              variant="outline"
              borderColor={borderColor}
              borderRadius="xl"
              fontWeight="600"
              size="md"
            >
              Sync Balance
            </Button>
            <IconButton
              aria-label="Edit debt"
              variant="outline"
              borderColor={borderColor}
              borderRadius="xl"
              onClick={() => setIsEditOpen(true)}
            >
              <FiEdit2 />
            </IconButton>
            <IconButton
              aria-label="Delete debt"
              variant="outline"
              borderColor={borderColor}
              colorPalette="red"
              borderRadius="xl"
              onClick={() => setIsDeleteOpen(true)}
            >
              <FiTrash2 />
            </IconButton>
          </HStack>
        </Flex>

        <Card.Root
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          p={{ base: 5, md: 6 }}
          mb={8}
          boxShadow="sm"
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} mb={6}>
            <Box>
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor} mb={1}>
                Current Balance
              </Text>
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color={isPaidOff ? 'green.500' : undefined}>
                {formatCurrency(debt.current_balance)}
              </Text>
              <Text fontSize="xs" color={subtitleColor} mt={1}>
                Original Amount: {formatCurrency(debt.original_amount)}
              </Text>
            </Box>

            <Box>
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor} mb={1}>
                Amount Paid Off
              </Text>
              <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="800" color="green.500">
                {formatCurrency(debt.paid_off_amount ?? (debt.original_amount - debt.current_balance))}
              </Text>
              <Text fontSize="xs" color={subtitleColor} mt={1}>
                {percentage.toFixed(1)}% of principal cleared
              </Text>
            </Box>

            <Box>
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor} mb={1}>
                Terms & Due Schedule
              </Text>
              <Text fontSize="lg" fontWeight="700">
                {debt.interest_rate}% {debt.interest_type || 'fixed'}
              </Text>
              <Text fontSize="xs" color={subtitleColor} mt={0.5}>
                Min payment: {formatCurrency(debt.minimum_payment)} • Due Day {debt.payment_due_day}
              </Text>
            </Box>
          </SimpleGrid>

          <Box>
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="xs" fontWeight="600" color={subtitleColor}>
                Total Payoff Progress
              </Text>
              <Text fontSize="sm" fontWeight="700" color={percentage >= 100 ? 'green.500' : 'blue.500'}>
                {percentage.toFixed(1)}%
              </Text>
            </Flex>
            <Progress.Root value={percentage} size="md" borderRadius="full">
              <Progress.Track bg={useColorModeValue('gray.100', 'gray.700')}>
                <Progress.Range bg={percentage >= 100 ? 'green.500' : 'blue.500'} borderRadius="full" />
              </Progress.Track>
            </Progress.Root>
          </Box>
        </Card.Root>

        {debt.projections && (
          <Box
            p={{ base: 4, md: 5 }}
            borderRadius="2xl"
            bg={surfaceSubtle}
            border="1px solid"
            borderColor={borderColor}
            mb={8}
          >
            <Flex align="center" gap={2} mb={3}>
              <Icon as={FiClock} color="blue.500" />
              <Heading as="h4" size="sm" fontWeight="700">
                Minimum Payment Projections
              </Heading>
            </Flex>
            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
              <Box>
                <Text fontSize="xs" color={subtitleColor}>Projected Payoff Date</Text>
                <Text fontSize="md" fontWeight="bold">
                  {debt.projections.payoff_date_minimum || 'N/A'}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={subtitleColor}>Total Interest on Minimums</Text>
                <Text fontSize="md" fontWeight="bold" color="red.500">
                  {formatCurrency(debt.projections.total_interest_minimum)}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={subtitleColor}>Months Remaining</Text>
                <Text fontSize="md" fontWeight="bold">
                  {debt.projections.months_remaining_minimum ? `${debt.projections.months_remaining_minimum} months` : 'N/A'}
                </Text>
              </Box>
            </SimpleGrid>
          </Box>
        )}

        <Card.Root
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={borderColor}
          p={{ base: 5, md: 6 }}
          mb={8}
          boxShadow="sm"
        >
          <Flex
            justify="space-between"
            align={{ base: 'flex-start', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap={4}
            mb={6}
          >
            <Box>
              <HStack gap={2} mb={1}>
                <Icon as={FiZap} color="blue.500" />
                <Heading as="h3" size="md" fontWeight="700">
                  Interactive Payoff Simulator
                </Heading>
              </HStack>
              <Text fontSize="xs" color={subtitleColor}>
                Simulate how adding extra monthly payments accelerates your payoff date and slashes total interest.
              </Text>
            </Box>

            <HStack gap={1} bg={useColorModeValue('gray.100', 'gray.700')} p={1} borderRadius="xl">
              {[
                { id: 'minimum', label: 'Minimum Only' },
                { id: 'avalanche', label: 'Avalanche' },
                { id: 'snowball', label: 'Snowball' },
              ].map((strat) => (
                <Button
                  key={strat.id}
                  size="xs"
                  variant={selectedStrategy === strat.id ? 'solid' : 'ghost'}
                  bg={selectedStrategy === strat.id ? 'blue.500' : 'transparent'}
                  color={selectedStrategy === strat.id ? 'white' : subtitleColor}
                  borderRadius="lg"
                  fontWeight="600"
                  onClick={() => setSelectedStrategy(strat.id)}
                >
                  {strat.label}
                </Button>
              ))}
            </HStack>
          </Flex>

          <Box p={4} borderRadius="xl" bg={surfaceSubtle} border="1px solid" borderColor={borderColor} mb={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} align="center">
              <Box>
                <Text fontSize="xs" fontWeight="600" mb={1.5}>
                  Extra Monthly Payment (Rp)
                </Text>
                <HStack gap={2}>
                  <Input
                    type="number"
                    min="0"
                    step="100000"
                    placeholder="0"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Number(e.target.value))}
                    borderRadius="xl"
                    bg={cardBg}
                    maxW="200px"
                  />
                  <HStack gap={1} wrap="wrap">
                    {[250000, 500000, 1000000].map((preset) => (
                      <Button
                        key={preset}
                        size="xs"
                        variant="outline"
                        borderRadius="lg"
                        onClick={() => setExtraPayment(preset)}
                      >
                        +{preset / 1000}k
                      </Button>
                    ))}
                    {extraPayment > 0 && (
                      <Button size="xs" variant="ghost" color="gray.500" onClick={() => setExtraPayment(0)}>
                        Reset
                      </Button>
                    )}
                  </HStack>
                </HStack>
              </Box>

              {timelineData && (
                <HStack justify={{ base: 'flex-start', md: 'flex-end' }} gap={6} textAlign={{ base: 'left', md: 'right' }}>
                  <Box>
                    <Text fontSize="xs" color={subtitleColor}>Projected Payoff</Text>
                    <Text fontSize="lg" fontWeight="bold" color="blue.500">
                      {timelineData.payoff_date || 'N/A'}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={subtitleColor}>Total Interest</Text>
                    <Text fontSize="lg" fontWeight="bold" color="red.500">
                      {formatCurrency(timelineData.total_interest)}
                    </Text>
                  </Box>
                </HStack>
              )}
            </SimpleGrid>
          </Box>

          {timelineLoading ? (
            <Flex justify="center" align="center" h="280px">
              <Spinner color="blue.500" />
            </Flex>
          ) : (
            <DebtTimelineChart timeline={timelineData?.timeline || []} />
          )}
        </Card.Root>

        {debt.milestones && debt.milestones.length > 0 && (
          <Box mb={8}>
            <Heading as="h3" size="md" fontWeight="700" mb={4}>
              Milestones Achieved 🎯
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
              {debt.milestones.map((m) => (
                <Box
                  key={m.id}
                  p={4}
                  borderRadius="2xl"
                  bg={cardBg}
                  border="1px solid"
                  borderColor={borderColor}
                  boxShadow="xs"
                >
                  <HStack align="flex-start" gap={3}>
                    <Flex
                      w={9}
                      h={9}
                      borderRadius="lg"
                      bg="yellow.50"
                      color="yellow.600"
                      align="center"
                      justify="center"
                      flexShrink={0}
                    >
                      <FiAward size={18} />
                    </Flex>
                    <Box>
                      <Text fontSize="xs" fontWeight="bold" color="yellow.600" textTransform="uppercase">
                        {m.milestone_type?.replace('_', ' ')}
                      </Text>
                      <Text fontSize="sm" fontWeight="600" mt={0.5}>
                        {m.description}
                      </Text>
                      <Text fontSize="xs" color={subtitleColor} mt={1}>
                        Reached: {new Date(m.reached_at).toLocaleDateString()}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        )}

        <Box mb={8}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h3" size="md" fontWeight="700">
              Payment History
            </Heading>
            {!isPaidOff && (
              <Button
                size="xs"
                variant="solid"
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
                borderRadius="lg"
                onClick={() => setIsPaymentOpen(true)}
              >
                + Record Payment
              </Button>
            )}
          </Flex>

          {!debt.payments || debt.payments.length === 0 ? (
            <Box
              p={8}
              textAlign="center"
              bg={cardBg}
              borderRadius="2xl"
              border="1px dashed"
              borderColor={borderColor}
            >
              <Text fontSize="sm" color={subtitleColor}>
                No payments have been recorded for this debt yet.
              </Text>
            </Box>
          ) : (
            <Card.Root bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} overflow="hidden">
              <Box overflowX="auto">
                <Table.Root size="sm" variant="outline">
                  <Table.Header bg={surfaceSubtle}>
                    <Table.Row>
                      <Table.ColumnHeader>Date</Table.ColumnHeader>
                      <Table.ColumnHeader>Type</Table.ColumnHeader>
                      <Table.ColumnHeader>Amount Paid</Table.ColumnHeader>
                      <Table.ColumnHeader>Principal</Table.ColumnHeader>
                      <Table.ColumnHeader>Interest</Table.ColumnHeader>
                      <Table.ColumnHeader>Balance After</Table.ColumnHeader>
                      <Table.ColumnHeader>Notes</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {debt.payments.map((p) => (
                      <Table.Row key={p.id}>
                        <Table.Cell fontWeight="medium">{p.payment_date}</Table.Cell>
                        <Table.Cell>
                          <Badge
                            size="xs"
                            colorPalette={
                              p.payment_type === 'payoff'
                                ? 'green'
                                : p.payment_type === 'extra'
                                ? 'purple'
                                : 'blue'
                            }
                            variant="subtle"
                          >
                            {p.payment_type}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell fontWeight="bold">{formatCurrency(p.amount)}</Table.Cell>
                        <Table.Cell color="green.600">
                          {p.principal_amount ? formatCurrency(p.principal_amount) : '-'}
                        </Table.Cell>
                        <Table.Cell color="red.500">
                          {p.interest_amount ? formatCurrency(p.interest_amount) : '-'}
                        </Table.Cell>
                        <Table.Cell fontWeight="semibold">{formatCurrency(p.balance_after)}</Table.Cell>
                        <Table.Cell color={subtitleColor} fontSize="xs">
                          {p.notes || '-'}
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card.Root>
          )}
        </Box>
      </Box>

      <DebtFormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        initialData={debt}
        onSubmit={handleEditSubmit}
        isLoading={editSubmitting}
      />

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        debt={debt}
        onSubmit={handlePaymentSubmit}
        isLoading={paymentSubmitting}
      />

      <UpdateBalanceModal
        isOpen={isBalanceOpen}
        onClose={() => setIsBalanceOpen(false)}
        debt={debt}
        onSubmit={handleBalanceSubmit}
        isLoading={balanceSubmitting}
      />

      <BaseModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Debt Record"
        description={`Are you sure you want to delete ${debt.name}?`}
        onConfirm={handleDeleteConfirm}
        confirmText="Delete"
        isDestructive
        isLoading={deleteSubmitting}
        size="md"
      >
        <Text fontSize="sm" color="gray.500">
          This will permanently remove this debt and its linked projection timeline.
        </Text>
      </BaseModal>
    </Box>
  );
}
