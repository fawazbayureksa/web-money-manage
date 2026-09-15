import React from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  HStack,
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { BaseTable } from '../BaseTable';
import { FiLink2, FiMail, FiRefreshCw } from 'react-icons/fi';
import { useEmailSync } from '../../hooks/useEmailSync';

const currencyFormatter = new Intl.NumberFormat('id-ID');

const statusColorPalette = {
  imported: 'green',
  skipped: 'yellow',
  failed: 'red',
};

function formatAmount(amount) {
  if (!amount || amount <= 0) {
    return '—';
  }
  return `Rp ${currencyFormatter.format(amount)}`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return '—';
  }

  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('id-ID');
}

function StatusBadge({ status }) {
  const colorPalette = statusColorPalette[status] || 'gray';

  return (
    <Badge colorPalette={colorPalette} variant="solid" textTransform="capitalize">
      {status || 'unknown'}
    </Badge>
  );
}

export default function EmailSyncCard() {
  const {
    connected,
    logs,
    total,
    syncing,
    connecting,
    disconnecting,
    syncResult,
    error,
    connect,
    sync,
    disconnect,
    fetchStatus,
  } = useEmailSync();

  const columns = [
    {
      header: 'Date',
      render: (log) => formatDate(log.email_date),
    },
    {
      header: 'Bank',
      render: (log) => log.bank_name || '—',
    },
    {
      header: 'Amount',
      textAlign: 'end',
      render: (log) => formatAmount(log.amount),
    },
    {
      header: 'Status',
      render: (log) => <StatusBadge status={log.status} />,
    },
    {
      header: 'Description',
      cellProps: {
        color: 'gray.600',
        maxW: '320px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      render: (log) => log.error_message || log.subject || '—',
    },
  ];

  return (
    <Card.Root borderWidth="1px" borderColor="gray.200" bg={{ base: 'white', _dark: 'gray.800' }}>
      <Card.Body>
        <VStack align="stretch" gap={5}>
          <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} direction={{ base: 'column', md: 'row' }} gap={3}>
            <Box>
              <HStack gap={2} mb={1}>
                <FiMail color="var(--chakra-colors-blue-500)" />
                <Heading as="h3" size="md">Gmail Bank Sync</Heading>
              </HStack>
              <Text color="gray.500" fontSize="sm">
                Import transaction emails from BCA, Permata, and SeaBank.
              </Text>
            </Box>

            <HStack gap={2}>
              <Badge colorPalette={connected ? 'green' : 'red'} variant="subtle">
                {connected ? 'Connected' : 'Not connected'}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                color={{ base: 'gray.700', _dark: 'gray.200' }}
                borderColor={{ base: 'gray.300', _dark: 'gray.600' }}
                _hover={{ bg: { base: 'gray.50', _dark: 'gray.700' } }}
                onClick={() => fetchStatus()}
              >
                Refresh
              </Button>
            </HStack>
          </Flex>

          {error && (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          <Flex gap={3} wrap="wrap">
            {!connected ? (
              <Button
                bg={{ base: 'blue.600', _dark: 'blue.500' }}
                color="white"
                _hover={{ bg: { base: 'blue.700', _dark: 'blue.400' } }}
                onClick={connect}
                disabled={connecting}
              >
                {connecting ? <Spinner size="sm" /> : 'Connect Gmail'}
              </Button>
            ) : (
              <>
                <Button
                  bg={{ base: 'blue.600', _dark: 'blue.500' }}
                  color="white"
                  _hover={{ bg: { base: 'blue.700', _dark: 'blue.400' } }}
                  onClick={sync}
                  disabled={syncing}
                >
                  {syncing ? <Spinner size="sm" /> : <FiRefreshCw />}
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </Button>
                <Button
                  variant="outline"
                  color={{ base: 'red.600', _dark: 'red.300' }}
                  borderColor={{ base: 'red.300', _dark: 'red.500' }}
                  _hover={{ bg: { base: 'red.50', _dark: 'red.900' } }}
                  onClick={disconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? <Spinner size="sm" /> : <FiLink2 />}
                  Disconnect
                </Button>
              </>
            )}
          </Flex>

          {syncResult && (
            <Text fontSize="sm" color="gray.600">
              {syncResult.imported || 0} imported · {syncResult.skipped || 0} skipped · {syncResult.failed || 0} failed
            </Text>
          )}

          {logs.length > 0 && (
            <Box overflowX="auto">
              <Text mb={2} fontWeight="semibold" fontSize="sm">Sync Logs ({total})</Text>
              <BaseTable
                keyField="id"
                data={logs}
                columns={columns}
              />
            </Box>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
