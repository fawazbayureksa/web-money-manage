import { Box, Flex, SimpleGrid, Text } from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiPieChart } from 'react-icons/fi';
import { useColorModeValue } from '../../../components/ui/color-mode';

function StatCard({ label, value, subtitle, icon: Icon, iconColor, iconBg, valueColor }) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const subtitleColor = useColorModeValue('gray.600', 'gray.400');

    return (
        <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs">
            <Flex justify="space-between" align="center" mb={2}>
                <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                    {label}
                </Text>
                <Flex w={9} h={9} align="center" justify="center" borderRadius="xl" bg={iconBg}>
                    <Icon color={iconColor} size={16} />
                </Flex>
            </Flex>
            <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight" color={valueColor}>
                {value}
            </Text>
            <Text fontSize="xs" color={subtitleColor} mt={1}>{subtitle}</Text>
        </Box>
    );
}

export default function TransactionSummaryCards({ totalIncome, totalExpense, formatCurrency }) {
    const incomeColor = useColorModeValue('green.600', 'green.400');
    const expenseColor = useColorModeValue('red.600', 'red.400');
    const incomeBg = useColorModeValue('green.50', 'green.950/50');
    const expenseBg = useColorModeValue('red.50', 'red.950/50');
    const netBalanceBg = useColorModeValue('blue.50', 'blue.950/50');

    const net = totalIncome - totalExpense;

    return (
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} mb={8}>
            <StatCard
                label="Total Income"
                value={formatCurrency(totalIncome)}
                subtitle="Inflow transactions on page"
                icon={FiTrendingUp}
                iconColor="var(--chakra-colors-green-500)"
                iconBg={incomeBg}
                valueColor={incomeColor}
            />
            <StatCard
                label="Total Expense"
                value={formatCurrency(totalExpense)}
                subtitle="Outflow transactions on page"
                icon={FiTrendingDown}
                iconColor="var(--chakra-colors-red-500)"
                iconBg={expenseBg}
                valueColor={expenseColor}
            />
            <StatCard
                label="Net Balance"
                value={formatCurrency(net)}
                subtitle="Net change on current page"
                icon={FiPieChart}
                iconColor="var(--chakra-colors-blue-500)"
                iconBg={netBalanceBg}
                valueColor={net >= 0 ? incomeColor : expenseColor}
            />
        </SimpleGrid>
    );
}
