import React from 'react';
import { Box, Table } from '@chakra-ui/react';
import { useColorModeValue } from './ui/color-mode';

export const BaseTable = ({ columns, data, keyField = "id", ...props }) => {
  return (
    <Box overflowX="auto" w="full" {...props}>
      <Table.Root variant="line" size="md" w="full">
        <BaseTableHeader>
          {columns.map((col, idx) => (
            <BaseTableColumnHeader key={idx} textAlign={col.textAlign || 'start'} {...col.headerProps}>
              {col.header}
            </BaseTableColumnHeader>
          ))}
        </BaseTableHeader>
        <BaseTableBody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <BaseTableRow key={row[keyField] || row.ID || rowIndex}>
                {columns.map((col, colIndex) => (
                  <BaseTableCell key={colIndex} textAlign={col.textAlign || 'start'} {...col.cellProps}>
                    {col.render ? col.render(row, rowIndex) : row[col.accessor]}
                  </BaseTableCell>
                ))}
              </BaseTableRow>
            ))
          ) : (
            <BaseTableRow>
              <BaseTableCell colSpan={columns.length} textAlign="center" color="gray.500" py={8}>
                No data available
              </BaseTableCell>
            </BaseTableRow>
          )}
        </BaseTableBody>
      </Table.Root>
    </Box>
  );
};

export const BaseTableHeader = ({ children, ...props }) => {
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bg = useColorModeValue("gray.50/50", "transparent");

  return (
    <Table.Header>
      <Table.Row bg={bg} borderBottom="1px solid" borderColor={borderColor} {...props}>
        {children}
      </Table.Row>
    </Table.Header>
  );
};

export const BaseTableColumnHeader = ({ children, textAlign = "start", ...props }) => {
  const color = useColorModeValue("gray.500", "gray.400");
  
  return (
    <Table.ColumnHeader 
      py={3} 
      px={4} 
      fontSize="sm" 
      fontWeight="600" 
      color={color} 
      textAlign={textAlign}
      {...props}
    >
      {children}
    </Table.ColumnHeader>
  );
};

export const BaseTableBody = Table.Body;

export const BaseTableRow = ({ children, ...props }) => {
  const hoverBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const borderColor = useColorModeValue("gray.100", "gray.800");

  return (
    <Table.Row
      borderBottom="1px solid"
      borderColor={borderColor}
      transition="background-color 0.2s"
      _hover={{ bg: hoverBg }}
      _last={{ borderBottom: "none" }}
      {...props}
    >
      {children}
    </Table.Row>
  );
};

export const BaseTableCell = ({ children, textAlign = "start", ...props }) => {
  return (
    <Table.Cell py={3} px={4} textAlign={textAlign} {...props}>
      {children}
    </Table.Cell>
  );
};
