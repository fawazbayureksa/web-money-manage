import { Badge, Box, Flex, Separator, Stack, Text } from '@chakra-ui/react';
import { useColorModeValue } from '../../../components/ui/color-mode';
import TransactionItem from './TransactionItem';

export default function TransactionGroup({ date, transactions, formatCurrency }) {
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const subtitleColor = useColorModeValue('gray.600', 'gray.400');

    return (
        <Box>
            <Flex align="center" mb={3} gap={3}>
                <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                    {date}
                </Text>
                <Separator flex="1" borderColor={borderColor} />
                <Badge colorPalette="blue" variant="subtle" size="xs" borderRadius="full">
                    {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'}
                </Badge>
            </Flex>

            <Stack gap={3}>
                {transactions.map((transaction) => (
                    <TransactionItem key={transaction.id} transaction={transaction} formatCurrency={formatCurrency} />
                ))}
            </Stack>
        </Box>
    );
}
