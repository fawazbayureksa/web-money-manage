import { Badge, Box, Flex, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FiArrowDown, FiArrowUp } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useColorModeValue } from '../../../components/ui/color-mode';

export default function TransactionItem({ transaction, formatCurrency }) {
    const navigate = useNavigate();

    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const subtitleColor = useColorModeValue('gray.600', 'gray.400');
    const incomeColor = useColorModeValue('green.600', 'green.400');
    const expenseColor = useColorModeValue('red.600', 'red.400');
    const incomeBg = useColorModeValue('green.50', 'green.950/50');
    const expenseBg = useColorModeValue('red.50', 'red.950/50');

    const isIncome = transaction.transaction_type === 1;
    const typeColor = isIncome ? incomeColor : expenseColor;
    const typeBg = isIncome ? incomeBg : expenseBg;

    return (
        <Box
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            p={4}
            shadow="xs"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            _hover={{ shadow: 'sm', transform: 'translateY(-2px)', borderColor: 'blue.300' }}
            cursor="pointer"
            onClick={() => navigate(`/transactions/${transaction.id}`)}
        >
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align={{ base: 'flex-start', md: 'center' }}
                justify="space-between"
                gap={4}
            >
                <Flex align="center" gap={3.5} flex={1}>
                    <Flex w={10} h={10} borderRadius="xl" bg={typeBg} align="center" justify="center" flexShrink={0}>
                        <Icon as={isIncome ? FiArrowDown : FiArrowUp} boxSize={5} color={typeColor} />
                    </Flex>

                    <VStack align="start" gap={1} flex={1}>
                        <Text fontSize="sm" fontWeight="700" letterSpacing="tight">
                            {transaction.description || 'Uncategorized Transaction'}
                        </Text>
                        <HStack gap={2} flexWrap="wrap">
                            <Badge colorPalette="purple" variant="subtle" size="xs" borderRadius="full" fontWeight="600">
                                {transaction?.category_name || 'General'}
                            </Badge>
                            <Badge colorPalette="cyan" variant="subtle" size="xs" borderRadius="full" fontWeight="600">
                                {transaction?.asset_name || 'Wallet'}
                            </Badge>
                            {transaction?.tags?.length > 0 && transaction.tags.map((tag) => (
                                <Badge
                                    key={tag.id}
                                    size="xs"
                                    px={2}
                                    py={0.5}
                                    borderRadius="full"
                                    style={{
                                        backgroundColor: tag.color + '20',
                                        border: `1px solid ${tag.color}60`,
                                        color: tag.color,
                                    }}
                                >
                                    {tag.icon && <span style={{ marginRight: '3px' }}>{tag.icon}</span>}
                                    {tag.name}
                                </Badge>
                            ))}
                        </HStack>
                    </VStack>
                </Flex>

                <Box textAlign={{ base: 'left', md: 'right' }}>
                    <Text fontSize="lg" fontWeight="800" letterSpacing="tight" color={typeColor}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </Text>
                    <Text fontSize="xs" color={subtitleColor}>
                        {isIncome ? 'Income Inflow' : 'Expense Outflow'}
                    </Text>
                </Box>
            </Flex>
        </Box>
    );
}
