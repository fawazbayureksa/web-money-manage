import React from 'react';
import {
  Box,
  Card,
  Flex,
  Heading,
  Text,
  Badge,
  HStack,
  Button,
  IconButton,
  Progress,
  Icon,
} from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import {
  FiCreditCard,
  FiDollarSign,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiArrowRight,
  FiTrendingDown,
  FiHome,
  FiTruck,
  FiBookOpen,
  FiBookmark,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const getDebtIcon = (type) => {
  switch (type) {
    case 'credit_card':
      return FiCreditCard;
    case 'mortgage':
      return FiHome;
    case 'car_loan':
      return FiTruck;
    case 'student_loan':
      return FiBookOpen;
    case 'personal_loan':
      return FiDollarSign;
    default:
      return FiBookmark;
  }
};

const getDebtTypeLabel = (type) => {
  switch (type) {
    case 'credit_card':
      return 'Credit Card';
    case 'mortgage':
      return 'Mortgage';
    case 'car_loan':
      return 'Car Loan';
    case 'student_loan':
      return 'Student Loan';
    case 'personal_loan':
      return 'Personal Loan';
    default:
      return 'Other Debt';
  }
};

export const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val || 0);
};

export default function DebtCard({
  debt,
  onRecordPayment,
  onUpdateBalance,
  onEdit,
  onDelete,
  displayValue,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  const surfaceSubtle = useColorModeValue('gray.50', 'gray.900/40');

  const IconComp = getDebtIcon(debt.debt_type);
  const typeLabel = getDebtTypeLabel(debt.debt_type);

  const percentage = Math.min(
    Math.max(debt.paid_off_percentage !== undefined ? debt.paid_off_percentage : 0, 0),
    100
  );

  const isPaidOff = debt.status === 'paid_off' || debt.current_balance <= 0;

  const renderDueStatus = () => {
    if (isPaidOff) {
      return (
        <Badge colorPalette="green" variant="subtle" px={2.5} py={1} borderRadius="full">
          <HStack gap={1}>
            <FiCheckCircle size={12} />
            <Text fontSize="xs" fontWeight="semibold">Fully Paid</Text>
          </HStack>
        </Badge>
      );
    }

    if (debt.current_month_paid) {
      return (
        <Badge colorPalette="teal" variant="subtle" px={2.5} py={1} borderRadius="full">
          <HStack gap={1}>
            <FiCheckCircle size={12} />
            <Text fontSize="xs" fontWeight="semibold">Paid this month</Text>
          </HStack>
        </Badge>
      );
    }

    const days = debt.days_until_due;
    if (days !== undefined) {
      if (days < 0) {
        return (
          <Badge colorPalette="red" variant="solid" px={2.5} py={1} borderRadius="full">
            <HStack gap={1}>
              <FiAlertCircle size={12} />
              <Text fontSize="xs" fontWeight="semibold">Overdue by {Math.abs(days)}d</Text>
            </HStack>
          </Badge>
        );
      }
      if (days <= 5) {
        return (
          <Badge colorPalette="red" variant="subtle" px={2.5} py={1} borderRadius="full">
            <HStack gap={1}>
              <FiClock size={12} />
              <Text fontSize="xs" fontWeight="semibold">Due in {days}d (Day {debt.payment_due_day})</Text>
            </HStack>
          </Badge>
        );
      }
      return (
        <Badge colorPalette="gray" variant="subtle" px={2.5} py={1} borderRadius="full">
          <HStack gap={1}>
            <FiClock size={12} />
            <Text fontSize="xs" fontWeight="medium">Due in {days}d (Day {debt.payment_due_day})</Text>
          </HStack>
        </Badge>
      );
    }

    return null;
  };

  const currentBalanceFormatted = displayValue
    ? displayValue(debt.current_balance, formatCurrency)
    : formatCurrency(debt.current_balance);

  const originalAmountFormatted = displayValue
    ? displayValue(debt.original_amount, formatCurrency)
    : formatCurrency(debt.original_amount);

  const minPaymentFormatted = displayValue
    ? displayValue(debt.minimum_payment, formatCurrency)
    : formatCurrency(debt.minimum_payment);

  return (
    <Card.Root
      bg={cardBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      _hover={{ boxShadow: 'md', borderColor: 'blue.400' }}
      transition="all 0.2s ease-in-out"
      overflow="hidden"
      display="flex"
      flexDirection="column"
    >
      <Card.Body p={{ base: 4, md: 5 }} flex="1">
        <Flex justify="space-between" align="flex-start" gap={3} mb={3}>
          <HStack align="flex-start" gap={3}>
            <Flex
              w={11}
              h={11}
              align="center"
              justify="center"
              borderRadius="xl"
              bg={useColorModeValue('blue.50', 'blue.950/40')}
              color={useColorModeValue('blue.600', 'blue.400')}
              flexShrink={0}
            >
              <Icon as={IconComp} boxSize={5} />
            </Flex>
            <Box>
              <HStack gap={2} align="center" wrap="wrap">
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color="blue.500">
                  {typeLabel}
                </Text>
                {debt.creditor_name && (
                  <Text fontSize="xs" color={subtitleColor}>
                    • {debt.creditor_name}
                  </Text>
                )}
              </HStack>
              <Link to={`/debts/${debt.id}`}>
                <Heading
                  as="h4"
                  size="md"
                  fontWeight="700"
                  _hover={{ color: 'blue.500' }}
                  transition="color 0.15s"
                >
                  {debt.name}
                </Heading>
              </Link>
            </Box>
          </HStack>

          <HStack gap={1}>
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Edit debt"
              onClick={() => onEdit && onEdit(debt)}
              color={subtitleColor}
              _hover={{ color: 'blue.500', bg: 'blue.50' }}
              borderRadius="lg"
            >
              <FiEdit2 size={14} />
            </IconButton>
            <IconButton
              size="xs"
              variant="ghost"
              aria-label="Delete debt"
              onClick={() => onDelete && onDelete(debt)}
              color={subtitleColor}
              _hover={{ color: 'red.500', bg: 'red.50' }}
              borderRadius="lg"
            >
              <FiTrash2 size={14} />
            </IconButton>
          </HStack>
        </Flex>

        <Box mb={4}>{renderDueStatus()}</Box>

        <Box mb={4}>
          <Text fontSize="xs" color={subtitleColor} fontWeight="medium">
            Current Balance
          </Text>
          <Text fontSize="2xl" fontWeight="800" letterSpacing="tight" color={isPaidOff ? 'green.500' : undefined}>
            {currentBalanceFormatted}
          </Text>
          <Text fontSize="xs" color={subtitleColor} mt={0.5}>
            Original: {originalAmountFormatted}
          </Text>
        </Box>

        <Box mb={5}>
          <Flex justify="space-between" align="center" mb={1.5}>
            <Text fontSize="xs" fontWeight="600" color={subtitleColor}>
              Paid Off Progress
            </Text>
            <Text fontSize="xs" fontWeight="700" color={percentage >= 100 ? 'green.500' : 'blue.500'}>
              {percentage.toFixed(1)}%
            </Text>
          </Flex>
          <Progress.Root value={percentage} size="sm" borderRadius="full">
            <Progress.Track bg={useColorModeValue('gray.100', 'gray.700')}>
              <Progress.Range bg={percentage >= 100 ? 'green.500' : 'blue.500'} borderRadius="full" />
            </Progress.Track>
          </Progress.Root>
        </Box>

        <Box
          p={3}
          borderRadius="xl"
          bg={surfaceSubtle}
          border="1px solid"
          borderColor={useColorModeValue('gray.100', 'gray.700/60')}
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color={subtitleColor}>
                Interest Rate
              </Text>
              <Text fontSize="sm" fontWeight="700">
                {debt.interest_rate}%{' '}
                <Text as="span" fontSize="xs" fontWeight="normal" color={subtitleColor}>
                  ({debt.interest_type || 'fixed'})
                </Text>
              </Text>
            </Box>
            <Box textAlign="right">
              <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color={subtitleColor}>
                Min Payment
              </Text>
              <Text fontSize="sm" fontWeight="700">
                {minPaymentFormatted}/mo
              </Text>
            </Box>
          </Flex>
        </Box>
      </Card.Body>

      <Card.Footer
        p={3}
        bg={useColorModeValue('gray.50/60', 'gray.800/80')}
        borderTop="1px solid"
        borderColor={borderColor}
      >
        <Flex w="full" justify="space-between" align="center" gap={2}>
          <HStack gap={2}>
            {!isPaidOff && (
              <Button
                size="xs"
                variant="solid"
                bg="blue.500"
                color="white"
                _hover={{ bg: 'blue.600' }}
                borderRadius="lg"
                fontWeight="600"
                onClick={() => onRecordPayment && onRecordPayment(debt)}
              >
                Pay
              </Button>
            )}
            <Button
              size="xs"
              variant="outline"
              borderColor={borderColor}
              borderRadius="lg"
              onClick={() => onUpdateBalance && onUpdateBalance(debt)}
            >
              Sync Balance
            </Button>
          </HStack>

          <Button
            asChild
            size="xs"
            variant="ghost"
            color="blue.500"
            _hover={{ bg: 'blue.50', color: 'blue.600' }}
            borderRadius="lg"
          >
            <Link to={`/debts/${debt.id}`}>
              <HStack gap={1}>
                <Text fontSize="xs" fontWeight="600">Details</Text>
                <FiArrowRight size={12} />
              </HStack>
            </Link>
          </Button>
        </Flex>
      </Card.Footer>
    </Card.Root>
  );
}
