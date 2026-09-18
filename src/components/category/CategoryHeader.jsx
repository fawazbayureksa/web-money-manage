import React from 'react';
import { Box, Flex, Heading, Text, Button } from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import { FiPlus } from 'react-icons/fi';

export default function CategoryHeader({ onOpenModal }) {
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Flex
      justify="space-between"
      align={{ base: 'flex-start', sm: 'center' }}
      direction={{ base: 'column', sm: 'row' }}
      gap={4}
      mb={8}
      pb={6}
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Box>
        <Flex align="center" gap={2} mb={2}>
          {/* <Box w={2} h={2} borderRadius="full" bg="blue.500" /> */}
          <Text fontSize="xs" fontWeight="600" textTransform="uppercase" letterSpacing="widest" color={subtitleColor}>
            Category Classification
          </Text>
        </Flex>
        <Heading as="h5" size={{ base: 'xl', md: '2xl' }} fontWeight="800" letterSpacing="tight" mb={1.5}>
          Transaction Categories
        </Heading>
        <Text color={subtitleColor} fontSize="md">
          Organize income origins and expense targets for refined analytics.
        </Text>
      </Box>

      <Button
        onClick={onOpenModal}
        bg="blue.500"
        color="white"
        _hover={{ bg: "blue.600" }}
        size="md"
        borderRadius="xl"
        px={5}
        fontWeight="600"
        boxShadow="xs"
      >
        <FiPlus style={{ marginRight: '6px' }} />
        Add Category
      </Button>
    </Flex>
  );
}
