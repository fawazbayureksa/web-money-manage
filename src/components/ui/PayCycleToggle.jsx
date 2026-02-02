import { Switch as ChakraSwitch } from '@chakra-ui/react';

export const PayCycleToggle = ({ isEnabled, onToggle }) => {
  return (
    <ChakraSwitch.Root
      checked={isEnabled}
      onCheckedChange={(details) => onToggle(details.checked)}
      colorPalette="blue"
      size="md"
    >
      <ChakraSwitch.HiddenInput />
      <ChakraSwitch.Control>
        <ChakraSwitch.Thumb />
      </ChakraSwitch.Control>
      <ChakraSwitch.Label>{isEnabled ? 'Pay Cycle' : 'Monthly'}</ChakraSwitch.Label>
    </ChakraSwitch.Root>
  );
};
