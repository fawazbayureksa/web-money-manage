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
  Input,
  Card,
  Icon,
} from '@chakra-ui/react';
import { useColorModeValue } from '../../components/ui/color-mode';
import { toaster } from '../../components/ui/toaster';
import { Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiZap,
  FiAward,
  FiTrendingDown,
  FiClock,
  FiCheckCircle,
  FiCalendar,
  FiDollarSign,
  FiArrowRight,
  FiInfo,
} from 'react-icons/fi';
import { formatCurrency } from '../../components/debts/DebtCard';
import { getPayoffStrategies } from '../../services/debtService';

export default function PayoffStrategies() {
  const [extraPayment, setExtraPayment] = useState(500000);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const pageBg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const subtitleColor = useColorModeValue('gray.500', 'gray.400');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const surfaceSubtle = useColorModeValue('gray.50', 'gray.900/40');

  useEffect(() => {
    fetchStrategies();
  }, [extraPayment]);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const res = await getPayoffStrategies(extraPayment);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching strategies:', err);
      toaster.create({
        description: err.response?.data?.message || 'Failed to calculate payoff strategies',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStrategyBadge = (name) => {
    if (name.toLowerCase().includes('avalanche')) {
      return (
        <Badge colorPalette="purple" variant="subtle" px={2.5} py={0.5} borderRadius="full">
          Lowest Total Interest
        </Badge>
      );
    }
    if (name.toLowerCase().includes('snowball')) {
      return (
        <Badge colorPalette="teal" variant="subtle" px={2.5} py={0.5} borderRadius="full">
          Quickest Momentum
        </Badge>
      );
    }
    return (
      <Badge colorPalette="gray" variant="subtle" px={2.5} py={0.5} borderRadius="full">
        Baseline
      </Badge>
    );
  };

  return (
    <Box minH="100vh" bg={pageBg}>
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={8}>
        {/* Navigation Breadcrumbs */}
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
            Payoff Strategies Comparison
          </Text>
        </Flex>

        {/* Page Header */}
        <Box mb={8}>
          <Flex align="center" gap={2} mb={2}>
            <Box w={2} h={2} borderRadius="full" bg="purple.500" />
            <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="widest" color={subtitleColor}>
              Optimization & Acceleration
            </Text>
          </Flex>
          <Heading as="h1" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={2}>
            Debt Payoff Strategies
          </Heading>
          <Text color={subtitleColor} fontSize="md" maxW="3xl">
            Compare the two proven debt elimination systems: <b>Debt Avalanche</b> (targeting highest interest first to minimize cost) versus <b>Debt Snowball</b> (targeting smallest balances first for psychological momentum).
          </Text>
        </Box>

        {/* Extra Monthly Payment Controller */}
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
            gap={6}
          >
            <Box flex={1}>
              <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color="blue.500" mb={1}>
                Monthly Acceleration Budget
              </Text>
              <Heading as="h3" size="md" fontWeight="700" mb={2}>
                How much extra can you put towards debt each month?
              </Heading>
              <Text fontSize="xs" color={subtitleColor} mb={4}>
                Extra money beyond your required minimum payments will be directed toward one target debt at a time until completely paid off.
              </Text>

              <HStack gap={3} wrap="wrap">
                <Input
                  type="number"
                  min="0"
                  step="100000"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(Math.max(0, Number(e.target.value)))}
                  borderRadius="xl"
                  maxW="220px"
                  size="md"
                />
                <HStack gap={1.5} wrap="wrap">
                  {[0, 250000, 500000, 1000000, 2000000].map((preset) => (
                    <Button
                      key={preset}
                      size="xs"
                      variant={extraPayment === preset ? 'solid' : 'outline'}
                      bg={extraPayment === preset ? 'blue.500' : 'transparent'}
                      color={extraPayment === preset ? 'white' : undefined}
                      borderColor={borderColor}
                      borderRadius="lg"
                      onClick={() => setExtraPayment(preset)}
                    >
                      {preset === 0 ? 'Minimum only' : `+Rp ${(preset / 1000).toLocaleString('id-ID')}k`}
                    </Button>
                  ))}
                </HStack>
              </HStack>
            </Box>

            {data && (
              <Box
                p={4}
                borderRadius="xl"
                bg={surfaceSubtle}
                border="1px solid"
                borderColor={borderColor}
                minW={{ base: 'full', md: '260px' }}
                textAlign={{ base: 'left', md: 'right' }}
              >
                <Text fontSize="xs" color={subtitleColor} mb={0.5}>
                  Current Required Minimums:
                </Text>
                <Text fontSize="sm" fontWeight="bold">
                  {formatCurrency(data.current_monthly_payment)}/mo
                </Text>
                <Text fontSize="xs" color={subtitleColor} mt={2} mb={0.5}>
                  Total Monthly Allocation:
                </Text>
                <Text fontSize="xl" fontWeight="800" color="blue.500">
                  {formatCurrency((data.current_monthly_payment || 0) + (data.extra_available || 0))}/mo
                </Text>
              </Box>
            )}
          </Flex>
        </Card.Root>

        {loading ? (
          <Flex justify="center" align="center" minH="280px">
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : !data || !data.strategies ? (
          <Box p={8} textAlign="center" bg={cardBg} borderRadius="2xl">
            <Text color={subtitleColor}>No debt strategies available. Ensure you have active debts registered.</Text>
          </Box>
        ) : (
          <>
            {/* Recommendation Highlight */}
            {data.recommendation && (
              <Box
                p={{ base: 4, md: 5 }}
                borderRadius="2xl"
                bg={useColorModeValue('green.50', 'green.950/30')}
                border="1px solid"
                borderColor={useColorModeValue('green.200', 'green.800')}
                mb={8}
              >
                <Flex align="flex-start" gap={3}>
                  <Flex
                    w={10}
                    h={10}
                    borderRadius="xl"
                    bg="green.500"
                    color="white"
                    align="center"
                    justify="center"
                    flexShrink={0}
                  >
                    <FiAward size={20} />
                  </Flex>
                  <Box>
                    <HStack gap={2} mb={1}>
                      <Text fontSize="xs" fontWeight="700" textTransform="uppercase" color="green.600">
                        Recommendation
                      </Text>
                      <Badge colorPalette="green" variant="solid" px={2} borderRadius="full">
                        {data.recommendation.strategy}
                      </Badge>
                    </HStack>
                    <Text fontSize="md" fontWeight="700">
                      {data.recommendation.reason}
                    </Text>
                  </Box>
                </Flex>
              </Box>
            )}

            {/* Strategies Side-by-Side Comparison */}
            <SimpleGrid columns={{ base: 1, lg: 3 }} gap={6} mb={8}>
              {data.strategies.map((strat, idx) => {
                const isRecommended = data.recommendation?.strategy?.toLowerCase() === strat.name.toLowerCase().split(' ')[0];
                const hasSavings = (strat.interest_saved || 0) > 0 || (strat.months_saved || 0) > 0;

                return (
                  <Card.Root
                    key={idx}
                    bg={cardBg}
                    borderRadius="2xl"
                    border="2px solid"
                    borderColor={isRecommended ? 'green.400' : borderColor}
                    boxShadow={isRecommended ? 'md' : 'sm'}
                    position="relative"
                    overflow="hidden"
                    display="flex"
                    flexDirection="column"
                  >
                    {isRecommended && (
                      <Box
                        bg="green.500"
                        color="white"
                        fontSize="10px"
                        fontWeight="bold"
                        textTransform="uppercase"
                        textAlign="center"
                        py={1}
                        letterSpacing="wider"
                      >
                        Recommended Choice
                      </Box>
                    )}

                    <Card.Body p={{ base: 5, md: 6 }} flex="1">
                      <Box mb={4}>
                        <HStack justify="space-between" align="center" mb={1.5}>
                          {getStrategyBadge(strat.name)}
                          <Text fontSize="xs" color={subtitleColor}>
                            Order of {strat.order?.length || 0} debts
                          </Text>
                        </HStack>
                        <Heading as="h3" size="md" fontWeight="800">
                          {strat.name}
                        </Heading>
                        <Text fontSize="xs" color={subtitleColor} mt={1}>
                          {strat.description}
                        </Text>
                      </Box>

                      {/* Payoff Date & Total Interest */}
                      <Box
                        p={4}
                        borderRadius="xl"
                        bg={surfaceSubtle}
                        border="1px solid"
                        borderColor={borderColor}
                        mb={5}
                      >
                        <SimpleGrid columns={2} gap={3}>
                          <Box>
                            <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color={subtitleColor}>
                              Debt Free By
                            </Text>
                            <Text fontSize="lg" fontWeight="800" color="blue.500">
                              {strat.payoff_date || 'N/A'}
                            </Text>
                          </Box>
                          <Box>
                            <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color={subtitleColor}>
                              Total Interest
                            </Text>
                            <Text fontSize="lg" fontWeight="800" color="red.500">
                              {formatCurrency(strat.total_interest)}
                            </Text>
                          </Box>
                        </SimpleGrid>
                      </Box>

                      {/* Savings Highlights */}
                      {hasSavings ? (
                        <Box
                          p={3.5}
                          borderRadius="xl"
                          bg={useColorModeValue('green.50/80', 'green.950/40')}
                          border="1px solid"
                          borderColor={useColorModeValue('green.200', 'green.800')}
                          mb={5}
                        >
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color="green.700">
                                Interest Saved
                              </Text>
                              <Text fontSize="md" fontWeight="800" color="green.600">
                                {formatCurrency(strat.interest_saved)}
                              </Text>
                            </Box>
                            <Box textAlign="right">
                              <Text fontSize="10px" textTransform="uppercase" fontWeight="bold" color="green.700">
                                Time Saved
                              </Text>
                              <Text fontSize="md" fontWeight="800" color="green.600">
                                {strat.months_saved} months sooner
                              </Text>
                            </Box>
                          </Flex>
                        </Box>
                      ) : (
                        <Box p={3.5} borderRadius="xl" bg={surfaceSubtle} mb={5} textAlign="center">
                          <Text fontSize="xs" color={subtitleColor}>
                            Baseline strategy with no extra monthly contributions.
                          </Text>
                        </Box>
                      )}

                      {/* Debt Payoff Order */}
                      {strat.order && strat.order.length > 0 && (
                        <Box mb={5}>
                          <Text fontSize="xs" fontWeight="700" textTransform="uppercase" color={subtitleColor} mb={2}>
                            Payoff Sequence
                          </Text>
                          <VStack gap={2} align="stretch">
                            {strat.order.map((item, oIdx) => (
                              <Flex
                                key={item.debt_id || oIdx}
                                justify="space-between"
                                align="center"
                                p={2.5}
                                borderRadius="lg"
                                bg={surfaceSubtle}
                                fontSize="xs"
                              >
                                <HStack gap={2}>
                                  <Badge colorPalette="blue" size="xs">
                                    #{oIdx + 1}
                                  </Badge>
                                  <Text fontWeight="600">{item.name}</Text>
                                </HStack>
                                <HStack gap={2}>
                                  <Text color={subtitleColor}>{item.interest_rate}%</Text>
                                  <Text fontWeight="bold">{formatCurrency(item.balance)}</Text>
                                </HStack>
                              </Flex>
                            ))}
                          </VStack>
                        </Box>
                      )}

                      {/* Milestones in this strategy */}
                      {strat.milestones && strat.milestones.length > 0 && (
                        <Box>
                          <Text fontSize="xs" fontWeight="700" textTransform="uppercase" color={subtitleColor} mb={2}>
                            Projected Milestone Dates
                          </Text>
                          <VStack gap={1.5} align="stretch">
                            {strat.milestones.map((m, mIdx) => (
                              <Flex
                                key={mIdx}
                                justify="space-between"
                                align="center"
                                fontSize="xs"
                                color={subtitleColor}
                              >
                                <HStack gap={1.5}>
                                  <Icon as={FiCheckCircle} color="green.500" boxSize={3.5} />
                                  <Text fontWeight="medium" color={textColor}>{m.event}</Text>
                                </HStack>
                                <Text fontWeight="bold">{m.date}</Text>
                              </Flex>
                            ))}
                          </VStack>
                        </Box>
                      )}
                    </Card.Body>
                  </Card.Root>
                );
              })}
            </SimpleGrid>
          </>
        )}
      </Box>
    </Box>
  );
}
