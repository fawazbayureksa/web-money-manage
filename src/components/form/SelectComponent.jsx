import { Portal, Select, createListCollection } from "@chakra-ui/react";

export const SelectComponent = ({
  options,
  onChange,
  value,
  placeholder = "Select framework",
  label = "Select framework",
  width = "320px",
  size = "sm",
}) => {
  const collection = createListCollection({ items: options });

  return (
    <Select.Root 
      collection={collection} 
      size={size} 
      width={width}
      value={value}
      onValueChange={({ value }) => onChange(value)}
    >
      <Select.Label>{label}</Select.Label>
      <Select.Control>
        <Select.Trigger>
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map((option) => (
              <Select.Item item={option} key={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
      <Select.HiddenSelect />
    </Select.Root>
  );
};