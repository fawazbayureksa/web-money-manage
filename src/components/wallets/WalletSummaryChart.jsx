import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Text } from '@chakra-ui/react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const WalletSummaryChart = ({ data }) => {

  const chartData = Object.entries(data).map(([currency, value], index) => ({
    name: currency,
    value: value,
    color: COLORS[index % COLORS.length],
  }));

  if (chartData.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500">No data to display</Text>
      </Box>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Box bg="white" p={3} borderRadius="md" shadow="md" border="1px solid" borderColor="gray.200">
          <Text fontWeight="semibold">{data.payload.name}</Text>
          <Text color="green.500">
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: data.payload.name,
            }).format(data.value)}
          </Text>
        </Box>
      );
    }
    return null;
  };

  return (
    <Box h="300px">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default WalletSummaryChart;