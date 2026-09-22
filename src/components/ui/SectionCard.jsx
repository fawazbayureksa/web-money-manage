import React from 'react';
import { Box, Flex, Heading, Text, Badge } from '@chakra-ui/react';
import { useColorModeValue } from './color-mode';

/**
 * Card wrapper with a title/subtitle header and optional badge.
 * Replaces the repeated card chrome across analytics pages.
 */
export default function SectionCard({
  title,
  subtitle,
  badge,
  badgeColor = 'blue',
  mb,
  children,
}) {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      bg={cardBg}
      borderRadius="2xl"
      border="1px solid"
      borderColor={borderColor}
      p={{ base: 5, md: 6 }}
      shadow="xs"
      mb={mb}
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading as="h2" size="sm" fontWeight="700" letterSpacing="tight">
            {title}
          </Heading>
          {subtitle && (
            <Text color={subtitleColor} fontSize="xs" mt={0.5}>
              {subtitle}
            </Text>
          )}
        </Box>
        {badge && (
          <Badge
            colorPalette={badgeColor}
            variant="subtle"
            px={2.5}
            py={0.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="600"
          >
            {badge}
          </Badge>
        )}
      </Flex>
      {children}
    </Box>
  );
}
