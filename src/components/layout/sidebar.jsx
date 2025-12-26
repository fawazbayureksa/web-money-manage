import { Box, Flex, Icon, Text, VStack } from '@chakra-ui/react'
import { FiHome, FiUser, FiSettings, FiDollarSign, FiChrome, FiHardDrive, FiArrowDownLeft, FiArrowLeft, FiPlusSquare, FiPackage, FiTrendingUp, FiBell, FiPieChart } from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()
  const menuItems = [
    { label: 'Dashboard', icon: FiHome, path: '/' },
    { label: 'Financials', icon: FiPieChart, path: '/financials' },
    { label: 'Users', icon: FiUser, path: '/users' },
    { label: 'Banks', icon: FiDollarSign, path: '/banks' },
    { label: 'Category', icon: FiHardDrive, path: '/categories' },
    { label: 'Transaction', icon: FiPackage, path: '/transaction' },
    { label: 'Budget', icon: FiTrendingUp, path: '/budget' },
    { label: 'Budget Alerts', icon: FiBell, path: '/budget-alerts' },
    { label: 'Settings', icon: FiSettings, path: '/settings' },
    { label: 'Logout', icon: FiArrowLeft, path: '/logout' },
  ]

  return (
    <Box
      bg="gray.800"
      color="white"
      w="250px"
      h="100vh"
      p="4"
      position="fixed"
    >
      <Text fontSize="2xl" fontWeight="bold" mb="6">
        MyApp
      </Text>
      <VStack align="stretch" spacing={4}>
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path
          return (
            <Link to={item.path} key={idx}>
              <Flex
                align="center"
                p="2"
                borderRadius="md"
                bg={isActive ? 'gray.700' : 'transparent'}
                _hover={{ bg: 'gray.700' }}
              >
                <Icon as={item.icon} boxSize={5} mr={3} />
                <Text>{item.label}</Text>
              </Flex>
            </Link>
          )
        })}
      </VStack>
    </Box>
  )
}

export default Sidebar
