import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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
 * Custom tooltip
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
 * Net savings area chart component
 */
export default function NetSavingsChart({ data = [] }) {
    const netColor = useColorModeValue('#3182CE', '#63B3ED'); // blue
    const gridColor = useColorModeValue('#E2E8F0', '#4A5568');
    const textColor = useColorModeValue('#4A5568', '#A0AEC0');

    // Transform data for chart
    const chartData = data.map(item => ({
        name: new Date(item.month + '-01').toLocaleDateString('en-US', {
            month: 'short'
        }),
        'Net Savings': item.net,
        Income: item.income,
        Expense: item.expense,
    }));

    if (chartData.length === 0) {
        return (
            <Box h="250px" display="flex" alignItems="center" justifyContent="center">
                <Text color="gray.500">No data available</Text>
            </Box>
        );
    }

    return (
        <Box h="250px" w="100%">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={netColor} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={netColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
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
                    <Area
                        type="monotone"
                        dataKey="Net Savings"
                        stroke={netColor}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#netGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Box>
    );
}
