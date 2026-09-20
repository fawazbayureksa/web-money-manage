import { Box, Flex, HStack, Text, Button } from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useColorModeValue } from '../../../components/ui/color-mode';

export default function TransactionPagination({ page, totalPages, totalItems, limit, onPageChange }) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const subtitleColor = useColorModeValue('gray.600', 'gray.400');

    const visiblePages = [...Array(Math.min(5, totalPages))].map((_, idx) => {
        if (totalPages <= 5) return idx + 1;
        if (page <= 3) return idx + 1;
        if (page >= totalPages - 2) return totalPages - 4 + idx;
        return page - 2 + idx;
    });

    return (
        <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={4} shadow="xs">
            <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
                <Text fontSize="xs" color={subtitleColor}>
                    Showing{' '}
                    <Text as="span" fontWeight="700">{((page - 1) * limit) + 1}</Text>
                    {' '}to{' '}
                    <Text as="span" fontWeight="700">{Math.min(page * limit, totalItems)}</Text>
                    {' '}of{' '}
                    <Text as="span" fontWeight="700">{totalItems}</Text>
                    {' '}transactions
                </Text>

                <HStack gap={1.5}>
                    <Button size="xs" onClick={() => onPageChange(1)} disabled={page === 1} variant="outline" borderRadius="lg">
                        First
                    </Button>
                    <Button size="xs" onClick={() => onPageChange(page - 1)} disabled={page === 1} variant="outline" borderRadius="lg">
                        <FiChevronLeft size={10} />
                    </Button>

                    <Flex gap={1}>
                        {visiblePages.map((pageNum) => (
                            <Button
                                key={pageNum}
                                size="xs"
                                w="7"
                                h="7"
                                onClick={() => onPageChange(pageNum)}
                                bg="blue.500" color="white"
                                variant={page === pageNum ? 'solid' : 'ghost'}
                                borderRadius="lg"
                                fontWeight={page === pageNum ? '700' : '500'}
                            >
                                {pageNum}
                            </Button>
                        ))}
                    </Flex>

                    <Button size="xs" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} variant="outline" borderRadius="lg">
                        <FiChevronRight size={10} />
                    </Button>
                    <Button size="xs" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} variant="outline" borderRadius="lg">
                        Last
                    </Button>
                </HStack>
            </Flex>
        </Box>
    );
}
