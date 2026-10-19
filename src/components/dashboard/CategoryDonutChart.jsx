import React, { useState } from 'react';
import { Box, Text, Flex, VStack, HStack } from '@chakra-ui/react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';
import { useColorModeValue } from '../ui/color-mode';

/**
 * Harmonious, distinguishable color palette with 16 distinct hues
 * to prevent immediate repetition when lists have 10-15+ categories.
 */
const COLORS = [
    '#4F46E5', // indigo
    '#7C3AED', // violet
    '#EC4899', // pink
    '#F97316', // orange
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#2563EB', // blue
    '#F59E0B', // amber
    '#84CC16', // lime
    '#14B8A6', // teal
    '#6366F1', // soft indigo
    '#D946EF', // fuchsia
    '#E11D48', // rose
    '#0EA5E9', // sky
    '#8B5CF6', // purple
    '#64748B', // slate
];

/**
 * Formats decimal percentage safely, ensuring 0% is rendered (not empty string)
 */
const formatPercent = (percent) => {
    if (typeof percent !== 'number' || isNaN(percent)) return '0%';
    const pct = percent * 100;
    if (pct === 0) return '0%';
    if (pct > 0 && pct < 1) return '<1%';
    return `${Math.round(pct)}%`;
};

/**
 * Custom tooltip for donut chart
 */
const CustomTooltip = ({ active, payload, formatCurrency }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const formattedAmount = formatCurrency
            ? formatCurrency(data.value)
            : `Rp ${(data.value || 0).toLocaleString('id-ID')}`;

        return (
            <Box
                bg="gray.900"
                color="white"
                px={3}
                py={2}
                borderRadius="lg"
                boxShadow="md"
                border="1px solid"
                borderColor="gray.700"
                minW="130px"
            >
                <Text fontWeight="600" fontSize="xs" color="gray.200" mb={0.5}>
                    {data.name}
                </Text>
                <Text fontSize="sm" fontWeight="700" color="white">
                    {formattedAmount}
                </Text>
                <Text fontSize="10px" color="gray.400" mt={0.5}>
                    {((data.payload?.percent || 0) * 100).toFixed(1)}% of total
                </Text>
            </Box>
        );
    }
    return null;
};

/**
 * Responsive Category donut chart component with decoupled scrollable legend
 */
export default function CategoryDonutChart({
    data = [],
    emptyMessage = "No data available",
    formatCurrency,
}) {
    const [activeIndex, setActiveIndex] = useState(null);

    const titleColor = useColorModeValue('gray.800', 'white');
    const subtitleColor = useColorModeValue('gray.500', 'gray.400');
    const itemHoverBg = useColorModeValue('gray.100/70', 'gray.700/50');
    const scrollThumbColor = useColorModeValue('rgba(0,0,0,0.15)', 'rgba(255,255,255,0.15)');

    const defaultFormatCurrency = (amount) => `Rp ${(amount || 0).toLocaleString('id-ID')}`;
    const formatVal = formatCurrency || defaultFormatCurrency;

    // Transform data for chart - ensure we have name and value
    const chartData = data.map((item, index) => ({
        name: item.category_name || item.name || `Item ${index + 1}`,
        value: item.total_amount || item.amount || item.value || 0,
    }));

    // Calculate total for percentages
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // Add percent to each item
    const chartDataWithPercent = chartData.map((item) => ({
        ...item,
        percent: total > 0 ? item.value / total : 0,
    }));

    if (chartData.length === 0 || total === 0) {
        return (
            <Box h="260px" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.500" fontSize="sm">{emptyMessage}</Text>
            </Box>
        );
    }

    const activeItem = activeIndex !== null ? chartDataWithPercent[activeIndex] : null;

    return (
        <Flex
            direction={{ base: 'column', sm: 'row' }}
            align={{ base: 'center', sm: 'stretch' }}
            justify="space-between"
            gap={{ base: 4, md: 5 }}
            w="100%"
            minH="260px"
        >
            {/* Donut Chart with center summary */}
            <Box
                w={{ base: '100%', sm: '190px', md: '210px' }}
                h={{ base: '200px', sm: '240px' }}
                flexShrink={0}
                position="relative"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartDataWithPercent}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={chartDataWithPercent.length > 1 ? 2 : 0}
                            dataKey="value"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {chartDataWithPercent.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.35}
                                    stroke={activeIndex === index ? '#fff' : 'none'}
                                    strokeWidth={activeIndex === index ? 2 : 0}
                                    style={{ transition: 'all 0.2s ease', cursor: 'pointer' }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip formatCurrency={formatVal} />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center content in donut hole */}
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    textAlign="center"
                    pointerEvents="none"
                    px={1}
                    maxW="95px"
                >
                    <Text
                        fontSize="9px"
                        fontWeight="700"
                        textTransform="uppercase"
                        letterSpacing="wider"
                        color={subtitleColor}
                        truncate
                    >
                        {activeItem ? activeItem.name : 'Total'}
                    </Text>
                    <Text
                        fontSize="xs"
                        fontWeight="800"
                        color={titleColor}
                        lineHeight="shorter"
                        truncate
                    >
                        {activeItem ? formatVal(activeItem.value) : formatVal(total)}
                    </Text>
                    <Text
                        fontSize="9px"
                        fontWeight="600"
                        color={activeItem ? "blue.500" : subtitleColor}
                        mt={0.5}
                    >
                        {activeItem
                            ? formatPercent(activeItem.percent)
                            : `${chartDataWithPercent.length} items`}
                    </Text>
                </Box>
            </Box>

            {/* Responsive scrollable items list */}
            <Box
                flex="1"
                w="100%"
                minW="0"
                maxH={{ base: '220px', sm: '250px' }}
                overflowY="auto"
                pr={1}
                css={{
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-track': { background: 'transparent' },
                    '&::-webkit-scrollbar-thumb': { background: scrollThumbColor, borderRadius: '4px' },
                }}
            >
                <VStack align="stretch" gap={1}>
                    {chartDataWithPercent.map((item, index) => {
                        const isHovered = activeIndex === index;
                        return (
                            <Flex
                                key={index}
                                align="center"
                                justify="space-between"
                                px={2.5}
                                py={1.5}
                                borderRadius="lg"
                                bg={isHovered ? itemHoverBg : 'transparent'}
                                transition="all 0.15s ease"
                                cursor="pointer"
                                onMouseEnter={() => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                opacity={activeIndex === null || isHovered ? 1 : 0.6}
                            >
                                <Flex align="center" gap={2} minW="0" flex="1" mr={2}>
                                    <Box
                                        w={2.5}
                                        h={2.5}
                                        flexShrink={0}
                                        borderRadius="full"
                                        bg={COLORS[index % COLORS.length]}
                                    />
                                    <Text
                                        fontSize="xs"
                                        fontWeight={isHovered ? '600' : '500'}
                                        color={titleColor}
                                        truncate
                                        title={item.name}
                                    >
                                        {item.name}
                                    </Text>
                                </Flex>
                                <HStack gap={2} flexShrink={0}>
                                    <Text fontSize="xs" fontWeight="600" color={titleColor} minW="32px" textAlign="right">
                                        {formatPercent(item.percent)}
                                    </Text>
                                </HStack>
                            </Flex>
                        );
                    })}
                </VStack>
            </Box>
        </Flex>
    );
}
