import { Box, Heading, Text, Stack, Card, Flex } from '@chakra-ui/react';
import { FiCalendar, FiUser, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SettingsCard = ({ icon: Icon, title, description, onClick }) => {
  return (
    <Card.Root
      cursor="pointer"
      onClick={onClick}
      borderWidth="1px"
      borderColor="gray.200"
      _hover={{ borderColor: 'blue.500', shadow: 'md' }}
      transition="all 0.2s"
      bg={{ base: 'white', _dark: 'gray.800' }}
      p={6}
    >
      <Flex align="center" gap={4}>
        {Icon && <Icon boxSize={8} color="blue.500" />}
        <Box flex={1}>
          <Text fontWeight="bold" fontSize="lg">{title}</Text>
          <Text color="gray.500" fontSize="sm">{description}</Text>
        </Box>
      </Flex>
    </Card.Root>
  );
};

const Settings = () => {
  const navigate = useNavigate();

  return (
    <Box maxW="800px" mx="auto" px={4} py={8}>
      <Box mb={6}>
        <Heading as="h3" size="lg">
          Settings
        </Heading>
        <Text color="gray.500" mt={1}>
          Configure your application settings
        </Text>
      </Box>

      <Stack gap={4}>
        <SettingsCard
          icon={FiCalendar}
          title="Pay Cycle"
          description="Configure your financial period to match your income schedule"
          onClick={() => navigate('/settings/pay-cycle')}
        />
      </Stack>
    </Box>
  );
};

export default Settings;