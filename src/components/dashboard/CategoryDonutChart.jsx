import React from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from 'recharts';

/**
 * Color palette for categories
 */
const COLORS = [
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#F97316', // orange
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#F59E0B', // amber
];

/**
 * Custom tooltip for donut chart
 */
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        return (
            <Box
                bg="gray.800"
                color="white"
                p={3}
                borderRadius="lg"
                boxShadow="lg"
                minW="150px"
            >
                <Text fontWeight="bold" mb={1}>{data.name}</Text>
                <Text fontSize="sm">
                    Rp {data.value?.toLocaleString('id-ID')}
                </Text>
                <Text fontSize="xs" color="gray.300">
                    {((data.payload.percent || 0) * 100).toFixed(1)}%
                </Text>
            </Box>
        );
    }
    return null;
};

/**
 * Custom legend component
 */
const CustomLegend = ({ payload }) => {
    return (
        <VStack align="stretch" gap={2} mt={4}>
            {payload?.map((entry, index) => (
                <Flex key={index} justify="space-between" align="center">
                    <Flex align="center" gap={2}>
                        <Box w={3} h={3} borderRadius="full" bg={entry.color} />
                        <Text fontSize="sm" noOfLines={1} maxW="120px">
                            {entry.value}
                        </Text>
                    </Flex>
                    <Text fontSize="sm" fontWeight="medium">
                        {entry.payload?.percent
                            ? `${(entry.payload.percent * 100).toFixed(0)}%`
                            : ''}
                    </Text>
                </Flex>
            ))}
        </VStack>
    );
};

/**
 * Category donut chart component
 */
export default function CategoryDonutChart({
    data = [],
    emptyMessage = "No data available"
}) {

    // Transform data for chart - ensure we have name and value
    const chartData = data.map((item, index) => ({
        name: item.category_name || item.name || `Category ${index + 1}`,
        value: item.total_amount || item.amount || item.value || 0,
    }));

    // Calculate total for percentages
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    // Add percent to each item
    const chartDataWithPercent = chartData.map(item => ({
        ...item,
        percent: total > 0 ? item.value / total : 0,
    }));

    if (chartData.length === 0 || total === 0) {
        return (
            <Box h="300px" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.500">{emptyMessage}</Text>
            </Box>
        );
    }

    return (
        <Box h="350px" w="100%">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartDataWithPercent}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {chartDataWithPercent.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                                stroke="none"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        content={<CustomLegend />}
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                    />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
}
