import { Box, Badge, Flex, HStack, Icon, Input, Spacer, Stack, Text, Button } from '@chakra-ui/react';
import { FiCalendar, FiFilter, FiSearch } from 'react-icons/fi';
import { useColorModeValue } from '../../../components/ui/color-mode';

export default function TransactionFilters({
    searchQuery, setSearchQuery,
    startDate, setStartDate,
    endDate, setEndDate,
    transactionType, setTransactionType,
    categoryId, setCategoryId,
    assetId, setAssetId,
    limit, setLimit,
    categories, wallets,
    onClearFilters,
    onDatePreset,
}) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const subtitleColor = useColorModeValue('gray.600', 'gray.400');
    const inputBg = useColorModeValue('gray.50', 'gray.900');
    const calendarIconFilter = useColorModeValue('none', 'invert(1)');

    const hasActiveFilters = startDate || endDate || transactionType || categoryId || assetId || searchQuery;

    const selectStyle = {
        padding: '6px 12px',
        borderRadius: '12px',
        border: `1px solid ${borderColor}`,
        fontSize: '13px',
        fontWeight: '600',
        backgroundColor: inputBg,
        color: 'inherit',
        outline: 'none',
        cursor: 'pointer',
    };

    return (
        <Box bg={cardBg} borderRadius="2xl" border="1px solid" borderColor={borderColor} p={5} shadow="xs" mb={8}>
            <Stack gap={4}>
                {/* Search */}
                <Box position="relative">
                    <Icon
                        as={FiSearch}
                        position="absolute"
                        left={4}
                        top="50%"
                        transform="translateY(-50%)"
                        color="gray.400"
                        zIndex={1}
                    />
                    <Input
                        placeholder="Search by description, category, wallet, or amount..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="md"
                        pl={11}
                        borderRadius="xl"
                        bg={inputBg}
                        borderColor={borderColor}
                        _focus={{ borderColor: 'blue.500' }}
                    />
                </Box>

                {/* Quick date + date range */}
                <Flex gap={3} wrap="wrap" align="center">
                    <HStack gap={2}>
                        <Text fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="wider" color={subtitleColor}>
                            Quick Date:
                        </Text>
                        <Button size="xs" variant="outline" borderRadius="lg" onClick={() => onDatePreset('today')}>Today</Button>
                        <Button size="xs" variant="outline" borderRadius="lg" onClick={() => onDatePreset('week')}>This Week</Button>
                        <Button size="xs" variant="outline" borderRadius="lg" onClick={() => onDatePreset('month')}>This Month</Button>
                    </HStack>
                    <Spacer />
                    <HStack gap={2}>
                        <Icon as={FiCalendar} color={subtitleColor} boxSize={4} />
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => { setStartDate(e.target.value); }}
                            size="sm"
                            w="140px"
                            borderRadius="xl"
                            bg={inputBg}
                            borderColor={borderColor}
                            css={{ '&::-webkit-calendar-picker-indicator': { filter: calendarIconFilter } }}
                        />
                        <Text color={subtitleColor} fontSize="xs">to</Text>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => { setEndDate(e.target.value); }}
                            size="sm"
                            w="140px"
                            borderRadius="xl"
                            bg={inputBg}
                            borderColor={borderColor}
                            css={{ '&::-webkit-calendar-picker-indicator': { filter: calendarIconFilter } }}
                        />
                    </HStack>
                </Flex>

                {/* Dropdowns + per-page */}
                <Flex gap={3} wrap="wrap" align="center" pt={3} borderTop="1px solid" borderColor={borderColor}>
                    <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} style={selectStyle}>
                        <option value="">All Types</option>
                        <option value="1">Income</option>
                        <option value="2">Expense</option>
                    </select>

                    <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={selectStyle}>
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>

                    <select value={assetId} onChange={(e) => setAssetId(e.target.value)} style={selectStyle}>
                        <option value="">All Wallets</option>
                        {wallets.map(wallet => (
                            <option key={wallet.value} value={wallet.value}>{wallet.label}</option>
                        ))}
                    </select>

                    {hasActiveFilters && (
                        <Button variant="ghost" bg="blue.500" color="white" size="sm" borderRadius="xl" onClick={onClearFilters}>
                            <FiFilter style={{ marginRight: '4px' }} />
                            Clear All
                        </Button>
                    )}

                    <Spacer />

                    <HStack gap={2}>
                        <Text fontSize="xs" fontWeight="600" color={subtitleColor}>Show</Text>
                        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={selectStyle}>
                            <option value={5}>5 per page</option>
                            <option value={10}>10 per page</option>
                            <option value={20}>20 per page</option>
                            <option value={50}>50 per page</option>
                        </select>
                    </HStack>
                </Flex>

                {/* Active filter badges */}
                {hasActiveFilters && (
                    <Flex gap={2} flexWrap="wrap" align="center" pt={1}>
                        <Text fontSize="xs" fontWeight="700" color={subtitleColor}>Active:</Text>
                        {searchQuery && <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">Search: "{searchQuery}"</Badge>}
                        {startDate && <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">From: {startDate}</Badge>}
                        {endDate && <Badge colorPalette="blue" variant="subtle" size="sm" borderRadius="full">To: {endDate}</Badge>}
                        {transactionType && (
                            <Badge colorPalette={transactionType === '1' ? 'green' : 'red'} variant="subtle" size="sm" borderRadius="full">
                                {transactionType === '1' ? 'Income' : 'Expense'}
                            </Badge>
                        )}
                        {categoryId && (
                            <Badge colorPalette="purple" variant="subtle" size="sm" borderRadius="full">
                                Category: {categories.find(c => c.value === categoryId)?.label}
                            </Badge>
                        )}
                        {assetId && (
                            <Badge colorPalette="orange" variant="subtle" size="sm" borderRadius="full">
                                Wallet: {wallets.find(w => w.value === assetId)?.label}
                            </Badge>
                        )}
                    </Flex>
                )}
            </Stack>
        </Box>
    );
}
