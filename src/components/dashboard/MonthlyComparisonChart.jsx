import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

/**
 * Format currency for IDR
 */
const formatCurrency = (value) => {
    if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
};

/**
 * Custom tooltip for the chart
 */
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <Box
                bg="gray.800"
                color="white"
                p={3}
                borderRadius="lg"
                boxShadow="lg"
                minW="150px"
            >
                <Text fontWeight="bold" mb={2}>{label}</Text>
                {payload.map((entry, index) => (
                    <Text key={index} fontSize="sm" color={entry.color}>
                        {entry.name}: Rp {entry.value?.toLocaleString('id-ID')}
                    </Text>
                ))}
            </Box>
        );
    }
    return null;
};

/**
 * Monthly comparison bar chart component
 */
export default function MonthlyComparisonChart({ data = [] }) {
    const incomeColor = useColorModeValue('#38A169', '#48BB78'); // green
    const expenseColor = useColorModeValue('#E53E3E', '#FC8181'); // red
    const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
    const textColor = useColorModeValue('#4A5568', '#A0AEC0');

    // Transform data for chart
    const chartData = data.map(item => ({
        name: new Date(item.month + '-01').toLocaleDateString('en-US', {
            month: 'short',
            year: '2-digit'
        }),
        Income: item.income,
        Expense: item.expense,
        Net: item.net,
    }));

    if (chartData.length === 0) {
        return (
            <Box h="300px" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.500">No data available</Text>
            </Box>
        );
    }

    return (
        <Box h="350px" w="100%">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: textColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                    />
                    <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fill: textColor, fontSize: 12 }}
                        axisLine={{ stroke: gridColor }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Bar
                        dataKey="Income"
                        fill={incomeColor}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                    <Bar
                        dataKey="Expense"
                        fill={expenseColor}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={50}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}
