import { Box, Button, Flex, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { FiPieChart, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useColorModeValue } from '../../../components/ui/color-mode';

export default function TransactionEmptyState({ searchQuery, onClearSearch }) {
    const navigate = useNavigate();
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const subtitleColor = useColorModeValue('gray.600', 'gray.400');
    const netBalanceBg = useColorModeValue('blue.50', 'blue.950/50');

    return (
        <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={12} textAlign="center" shadow="xs">
            <VStack gap={3}>
                <Flex w={12} h={12} align="center" justify="center" borderRadius="2xl" bg={netBalanceBg}>
                    <FiPieChart size={24} color="var(--chakra-colors-blue-500)" />
                </Flex>
                <Heading size="sm" fontWeight="700">
                    {searchQuery ? 'No Matching Transactions' : 'No Transactions Found'}
                </Heading>
                <Text color={subtitleColor} fontSize="xs" maxW="sm">
                    {searchQuery
                        ? `No results matching "${searchQuery}".`
                        : 'Try adjusting your filters or record a new transaction to populate your ledger.'}
                </Text>
                <HStack gap={3} mt={2}>
                    {searchQuery && (
                        <Button variant="outline" size="sm" borderRadius="xl" onClick={onClearSearch}>
                            Clear Search
                        </Button>
                    )}
                    <Button
                        onClick={() => navigate('/transaction')}
                        bg="blue.500"
                        color="white"
                        _hover={{ bg: 'blue.600' }}
                        size="sm"
                        borderRadius="xl"
                        fontWeight="600"
                    >
                        <FiPlus style={{ marginRight: '6px' }} />
                        Add Transaction
                    </Button>
                </HStack>
            </VStack>
        </Box>
    );
}
