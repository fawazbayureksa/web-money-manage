import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  HStack,
  Button,
} from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const formatCurrencyCompact = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box
        bg="gray.900"
        color="white"
        p={3}
        borderRadius="xl"
        boxShadow="xl"
        border="1px solid"
        borderColor="gray.700"
        minW="180px"
      >
        <Text fontSize="xs" fontWeight="bold" color="gray.300" mb={1.5}>
          {label}
        </Text>
        {payload.map((entry, index) => (
          <Flex key={index} justify="space-between" gap={3} fontSize="xs" mb={0.5}>
            <Text color={entry.color}>{entry.name}:</Text>
            <Text fontWeight="bold">Rp {Number(entry.value).toLocaleString('id-ID')}</Text>
          </Flex>
        ))}
      </Box>
    );
  }
  return null;
};

export default function DebtTimelineChart({ timeline = [] }) {
  const [viewMode, setViewMode] = useState('balance'); // 'balance' | 'breakdown'

  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const axisColor = useColorModeValue('#718096', '#A0AEC0');
  const balanceColor = useColorModeValue('#3182CE', '#63B3ED'); // blue
  const principalColor = useColorModeValue('#38A169', '#48BB78'); // green
  const interestColor = useColorModeValue('#E53E3E', '#F56565'); // red

  if (!timeline || timeline.length === 0) {
    return (
      <Box py={10} textAlign="center" color="gray.500">
        <Text fontSize="sm">No projection data available for this selection.</Text>
      </Box>
    );
  }

  return (
    <Box w="full">
      <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={2}>
        <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="wider" color="gray.500">
          Projection Curve
        </Text>
        <HStack gap={1} bg={useColorModeValue('gray.100', 'gray.800')} p={0.5} borderRadius="lg">
          <Button
            size="xs"
            variant={viewMode === 'balance' ? 'solid' : 'ghost'}
            bg={viewMode === 'balance' ? 'blue.500' : 'transparent'}
            color={viewMode === 'balance' ? 'white' : undefined}
            borderRadius="md"
            onClick={() => setViewMode('balance')}
          >
            Remaining Balance
          </Button>
          <Button
            size="xs"
            variant={viewMode === 'breakdown' ? 'solid' : 'ghost'}
            bg={viewMode === 'breakdown' ? 'blue.500' : 'transparent'}
            color={viewMode === 'breakdown' ? 'white' : undefined}
            borderRadius="md"
            onClick={() => setViewMode('breakdown')}
          >
            Principal vs Interest
          </Button>
        </HStack>
      </Flex>

      <Box h="280px" w="full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'balance' ? (
            <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={balanceColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={balanceColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrencyCompact}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="remaining_balance"
                name="Remaining Balance"
                stroke={balanceColor}
                strokeWidth={2.5}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          ) : (
            <BarChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="month"
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={axisColor}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatCurrencyCompact}
                width={55}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 10, fontSize: '12px' }}
              />
              <Bar
                dataKey="principal_paid"
                name="Principal Paid"
                stackId="a"
                fill={principalColor}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="interest_paid"
                name="Interest Paid"
                stackId="a"
                fill={interestColor}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
