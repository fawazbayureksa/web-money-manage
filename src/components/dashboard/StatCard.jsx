import React from 'react';
import { Box, Card, Flex, Text, Icon } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

/**
 * Reusable stat card component for dashboard metrics
 */
export default function StatCard({
    title,
    value,
    icon: IconComponent,
    change,
    changeLabel,
    colorScheme = 'blue',
    formatValue
}) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.100', 'gray.700');
    const labelColor = useColorModeValue('gray.600', 'gray.400');

    const colorMap = {
        blue: { light: 'blue.500', dark: 'blue.400', bg: 'blue.50', bgDark: 'blue.900' },
        green: { light: 'green.500', dark: 'green.400', bg: 'green.50', bgDark: 'green.900' },
        red: { light: 'red.500', dark: 'red.400', bg: 'red.50', bgDark: 'red.900' },
        purple: { light: 'purple.500', dark: 'purple.400', bg: 'purple.50', bgDark: 'purple.900' },
        orange: { light: 'orange.500', dark: 'orange.400', bg: 'orange.50', bgDark: 'orange.900' },
    };

    const colors = colorMap[colorScheme] || colorMap.blue;
    const iconColor = useColorModeValue(colors.light, colors.dark);
    const iconBg = useColorModeValue(colors.bg, colors.bgDark);

    const isPositiveChange = change > 0;
    const changeColor = isPositiveChange
        ? useColorModeValue('green.600', 'green.400')
        : useColorModeValue('red.600', 'red.400');

    const displayValue = formatValue ? formatValue(value) : value;

    return (
        <Card.Root
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
            _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
            transition="all 0.2s ease"
            overflow="hidden"
        >
            <Card.Body p={5}>
                <Flex justify="space-between" align="flex-start">
                    <Box flex={1}>
                        <Text fontSize="sm" fontWeight="medium" color={labelColor} mb={1}>
                            {title}
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" letterSpacing="tight">
                            {displayValue}
                        </Text>
                        {change !== undefined && (
                            <Flex align="center" gap={1} mt={2}>
                                <Icon
                                    as={isPositiveChange ? FiTrendingUp : FiTrendingDown}
                                    color={changeColor}
                                    boxSize={4}
                                />
                                <Text fontSize="sm" fontWeight="medium" color={changeColor}>
                                    {isPositiveChange ? '+' : ''}{change.toFixed(1)}%
                                </Text>
                                {changeLabel && (
                                    <Text fontSize="xs" color={labelColor} ml={1}>
                                        {changeLabel}
                                    </Text>
                                )}
                            </Flex>
                        )}
                    </Box>
                    {IconComponent && (
                        <Flex
                            w={12}
                            h={12}
                            align="center"
                            justify="center"
                            borderRadius="xl"
                            bg={iconBg}
                        >
                            <Icon as={IconComponent} boxSize={6} color={iconColor} />
                        </Flex>
                    )}
                </Flex>
            </Card.Body>
        </Card.Root>
    );
}
