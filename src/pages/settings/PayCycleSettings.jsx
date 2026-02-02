import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Field,
  Input,
  Flex,
  Stack,
  Card,
  Spinner,
  Badge,
  IconButton,
  HStack,
  VStack
} from '@chakra-ui/react';
import { Radio, RadioGroup } from '@chakra-ui/radio';
import { FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { toaster } from '../../components/ui/toaster';
import { SelectComponent } from '../../components/form/SelectComponent';
import { getSettings, createSettings, updateSettings, resetSettings } from '../../services/userSettings';
import { PAY_CYCLE_OPTIONS, OFFSET_OPTIONS } from '../../types/userSettings';

const PayCycleTypeCard = ({ option, isSelected, onSelect }) => {
  return (
    <Card.Root
      cursor="pointer"
      onClick={() => onSelect(option.value)}
      borderWidth="2px"
      borderColor={isSelected ? 'blue.500' : 'gray.200'}
      _hover={{ borderColor: 'blue.300' }}
      transition="all 0.2s"
      bg={{ base: 'white', _dark: 'gray.800' }}
      p={4}
    >
      <Flex align="center" gap={3}>
        <Radio value={option.value} isChecked={isSelected} onChange={() => onSelect(option.value)} />
        <Text fontSize="2xl">{option.icon}</Text>
        <Box flex={1}>
          <Text fontWeight="bold">{option.label}</Text>
          <Text fontSize="sm" color="gray.500">{option.description}</Text>
        </Box>
      </Flex>
    </Card.Root>
  );
};

const PeriodPreview = ({ settings }) => {
  if (!settings || settings.pay_cycle_type === 'calendar') {
    return null;
  }

  const getPreviewText = () => {
    const type = PAY_CYCLE_OPTIONS.find(opt => opt.value === settings.pay_cycle_type);
    if (!type) return '';

    let text = '';
    if (settings.pay_cycle_type === 'last_weekday') {
      text = 'Your financial period will start on the last weekday of each month';
    } else if (settings.pay_cycle_type === 'custom_day' && settings.pay_day) {
      const offsetText = settings.cycle_start_offset === 0 
        ? `on the ${settings.pay_day}${getDaySuffix(settings.pay_day)}`
        : `on the ${settings.pay_day}${getDaySuffix(settings.pay_day)} + ${settings.cycle_start_offset} day(s)`;
      text = `Your financial period will start ${offsetText} of each month`;
    } else if (settings.pay_cycle_type === 'bi_weekly' && settings.pay_day !== null) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const offsetText = settings.cycle_start_offset === 0 
        ? `on ${dayNames[settings.pay_day]}`
        : `on ${dayNames[settings.pay_day]} + ${settings.cycle_start_offset} day(s)`;
      text = `Your financial period will start ${offsetText} every 2 weeks`;
    }
    return text;
  };

  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th';
    const lastDigit = day % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };

  return (
    <Card.Root mt={6} bg="blue.50" _dark={{ bg: 'blue.900' }} p={4}>
      <HStack gap={2}>
        <FiCalendar color="blue.500" />
        <Text fontWeight="bold" color="blue.700" _dark={{ color: 'blue.200' }}>
          Period Preview:
        </Text>
      </HStack>
      <Text mt={2} color="blue.600" _dark={{ color: 'blue.300' }}>
        {getPreviewText()}
      </Text>
    </Card.Root>
  );
};

const CurrentSettingsCard = ({ settings }) => {
  const type = PAY_CYCLE_OPTIONS.find(opt => opt.value === settings.pay_cycle_type);
  const getCurrentSettingsText = () => {
    if (settings.pay_cycle_type === 'calendar') {
      return 'Calendar months';
    }
    if (settings.pay_cycle_type === 'last_weekday') {
      return 'Last weekday of each month';
    }
    if (settings.pay_cycle_type === 'custom_day' && settings.pay_day) {
      const offsetText = settings.cycle_start_offset === 0 
        ? `${settings.pay_day}${getDaySuffix(settings.pay_day)}`
        : `${settings.pay_day}${getDaySuffix(settings.pay_day)} + ${settings.cycle_start_offset} day(s)`;
      return `Custom day: ${offsetText} of each month`;
    }
    if (settings.pay_cycle_type === 'bi_weekly' && settings.pay_day !== null) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const offsetText = settings.cycle_start_offset === 0 
        ? dayNames[settings.pay_day]
        : `${dayNames[settings.pay_day]} + ${settings.cycle_start_offset} day(s)`;
      return `Bi-weekly: Every 2 weeks starting ${offsetText}`;
    }
    return 'Unknown';
  };

  const getDaySuffix = (day) => {
    if (day >= 11 && day <= 13) return 'th';
    const lastDigit = day % 10;
    if (lastDigit === 1) return 'st';
    if (lastDigit === 2) return 'nd';
    if (lastDigit === 3) return 'rd';
    return 'th';
  };

  return (
    <Card.Root bg="green.50" _dark={{ bg: 'green.900' }} p={4} mb={6}>
      <HStack gap={2}>
        <Badge colorScheme="green" variant="solid">
          Active
        </Badge>
        <Text fontWeight="bold" color="green.700" _dark={{ color: 'green.200' }}>
          Current Pay Cycle:
        </Text>
      </HStack>
      <Text mt={2} color="green.600" _dark={{ color: 'green.300' }} fontSize="lg">
        {getCurrentSettingsText()}
      </Text>
      <Text mt={1} fontSize="sm" color="green.500" _dark={{ color: 'green.400' }}>
        Last updated: {settings.updated_at ? new Date(settings.updated_at).toLocaleDateString() : 'Recently created'}
      </Text>
    </Card.Root>
  );
};

export default function PayCycleSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  const [formData, setFormData] = useState({
    pay_cycle_type: 'calendar',
    pay_day: null,
    cycle_start_offset: 1
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await getSettings();
      if (response.data) {
        setSettings(response.data);
        setFormData({
          pay_cycle_type: response.data.pay_cycle_type || 'calendar',
          pay_day: response.data.pay_day || null,
          cycle_start_offset: response.data.cycle_start_offset || 1
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error fetching settings:', error);
        toaster.create({
          description: "Failed to fetch pay cycle settings",
          type: "error",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const selectedType = PAY_CYCLE_OPTIONS.find(opt => opt.value === formData.pay_cycle_type);
      const submitData = {
        pay_cycle_type: formData.pay_cycle_type,
        pay_day: selectedType?.requiresPayDay ? formData.pay_day : null,
        cycle_start_offset: parseInt(formData.cycle_start_offset)
      };

      if (settings) {
        await updateSettings(submitData);
        toaster.create({
          description: "Pay cycle settings updated successfully",
          type: "success",
        });
      } else {
        await createSettings(submitData);
        toaster.create({
          description: "Pay cycle settings created successfully",
          type: "success",
        });
      }

      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toaster.create({
        description: error.response?.data?.message || "Failed to save pay cycle settings",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async () => {
    if (!settings) return;

    if (!confirm('Are you sure you want to reset to calendar months? This will delete your custom pay cycle configuration.')) {
      return;
    }

    setSubmitting(true);
    try {
      await resetSettings();
      toaster.create({
        description: "Pay cycle settings reset to calendar months",
        type: "success",
      });
      setSettings(null);
      setFormData({
        pay_cycle_type: 'calendar',
        pay_day: null,
        cycle_start_offset: 1
      });
    } catch (error) {
      console.error('Error resetting settings:', error);
      toaster.create({
        description: "Failed to reset pay cycle settings",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTypeChange = (value) => {
    const selectedType = PAY_CYCLE_OPTIONS.find(opt => opt.value === value);
    setFormData(prev => ({
      ...prev,
      pay_cycle_type: value,
      pay_day: selectedType?.requiresPayDay ? (selectedType.payDayRange?.min ?? 0) : null
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? null : parseInt(value)
    }));
  };

  const handleSelectChange = (field, val) => {
    setFormData(prev => ({
      ...prev,
      [field]: parseInt(val[0])
    }));
  };

  const selectedType = PAY_CYCLE_OPTIONS.find(opt => opt.value === formData.pay_cycle_type);

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box maxW="800px" mx="auto" px={4} py={8}>
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Heading as="h3" size="lg">
            Pay Cycle Settings
          </Heading>
          <Text color="gray.500" mt={1}>
            Configure your financial period to match your actual income schedule
          </Text>
        </Box>
        {settings && (
          <IconButton
            aria-label="Reset to calendar"
            icon={<FiRefreshCw />}
            variant="outline"
            colorScheme="red"
            onClick={handleReset}
            isLoading={submitting}
          >
            Reset to Calendar
          </IconButton>
        )}
      </Flex>

      {settings && <CurrentSettingsCard settings={settings} />}

      <Card.Root p={6} bg={{ base: 'white', _dark: 'gray.800' }}>
        <form onSubmit={handleSubmit}>
          <Stack gap={6}>
            <Box>
              <Text fontWeight="bold" mb={3}>Choose Pay Cycle Type</Text>
              <Stack gap={3}>
                {PAY_CYCLE_OPTIONS.map(option => (
                  <PayCycleTypeCard
                    key={option.value}
                    option={option}
                    isSelected={formData.pay_cycle_type === option.value}
                    onSelect={handleTypeChange}
                  />
                ))}
              </Stack>
            </Box>

            {selectedType?.requiresPayDay && (
              <Field.Root required>
                <Field.Label>
                  {selectedType.payDayLabel} <Field.RequiredIndicator />
                </Field.Label>
                {selectedType.payDayOptions ? (
                  <SelectComponent
                    options={selectedType.payDayOptions}
                    label=''
                    onChange={(val) => handleSelectChange('pay_day', val)}
                    placeholder='Select day'
                    value={formData.pay_day !== null ? [formData.pay_day] : []}
                    width="100%"
                  />
                ) : (
                  <Input
                    type="number"
                    name="pay_day"
                    placeholder={`Enter day (${selectedType.payDayRange?.min}-${selectedType.payDayRange?.max})`}
                    value={formData.pay_day || ''}
                    onChange={handleInputChange}
                    min={selectedType.payDayRange?.min}
                    max={selectedType.payDayRange?.max}
                    required
                  />
                )}
              </Field.Root>
            )}

            {formData.pay_cycle_type !== 'calendar' && (
              <Field.Root required>
                <Field.Label>
                  Cycle Start Offset <Field.RequiredIndicator />
                </Field.Label>
                <SelectComponent
                  options={OFFSET_OPTIONS}
                  label=''
                  onChange={(val) => handleSelectChange('cycle_start_offset', val)}
                  placeholder='Select offset'
                  value={[formData.cycle_start_offset]}
                  width="100%"
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {OFFSET_OPTIONS.find(opt => opt.value === formData.cycle_start_offset)?.description}
                </Text>
              </Field.Root>
            )}

            <PeriodPreview settings={formData} />

            <Flex gap={3} justify="flex-end" mt={4}>
              <Button
                type="submit"
                isLoading={submitting}
                bg={{ base: 'blue.500', _dark: 'blue.600' }}
                color="white"
                _hover={{ bg: { base: 'blue.600', _dark: 'blue.700' } }}
              >
                {settings ? 'Update' : 'Save'} Settings
              </Button>
            </Flex>
          </Stack>
        </form>
      </Card.Root>
    </Box>
  );
}
