import React, { useState } from 'react'
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  useBreakpointValue,
  Circle,
  IconButton,
  HStack,
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import {
  FiHome,
  FiUser,
  FiSettings,
  FiDollarSign,
  FiHardDrive,
  FiArrowLeft,
  FiPackage,
  FiTrendingUp,
  FiBell,
  FiPieChart,
  FiMenu,
  FiX,
  FiList,
  FiCreditCard
} from 'react-icons/fi'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const MotionBox = motion(Box)

const Sidebar = () => {
  const location = useLocation()
  const isMobile = useBreakpointValue({ base: true, lg: false })
  const [isOpen, setIsOpen] = useState(false)

  const menuItems = [
    { label: 'Dashboard', icon: FiHome, path: '/' },
    { label: 'Financials', icon: FiPieChart, path: '/financials' },
    // { label: 'Users', icon: FiUser, path: '/users' },
    { label: 'Banks', icon: FiDollarSign, path: '/banks' },
    { label: 'Wallets', icon: FiCreditCard, path: '/wallets' },
    { label: 'Category', icon: FiHardDrive, path: '/categories' },
    { label: 'Add Transaction', icon: FiPackage, path: '/transaction' },
    { label: 'Transactions', icon: FiList, path: '/transactions' },
    { label: 'Budget', icon: FiTrendingUp, path: '/budget' },
    { label: 'Budget Alerts', icon: FiBell, path: '/budget-alerts' },
    { label: 'Settings', icon: FiSettings, path: '/settings' },
    { label: 'Logout', icon: FiArrowLeft, path: '/logout' },
  ]

  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')
  const activeBg = useColorModeValue('blue.50', 'blue.900/30')
  const activeColor = useColorModeValue('blue.600', 'blue.300')

  const SidebarContent = ({ onItemClick }) => (
    <VStack align="stretch" spacing={2}>
      {menuItems.map((item, idx) => {
        const isActive = location.pathname === item.path
        return (
          <Link to={item.path} key={idx} onClick={onItemClick}>
            <Flex
              align="center"
              p="3"
              borderRadius="xl"
              bg={isActive ? activeBg : 'transparent'}
              color={isActive ? activeColor : 'inherit'}
              _hover={{ bg: activeBg, color: activeColor }}
              transition="all 0.2s"
              fontWeight={isActive ? "bold" : "medium"}
            >
              <Icon as={item.icon} boxSize={5} mr={3} />
              <Text fontSize="md">{item.label}</Text>
            </Flex>
          </Link>
        )
      })}
    </VStack>
  )

  if (isMobile) {
    return (
      <>
        {/* Floating Toggle Button */}
        <Box position="fixed" bottom="6" right="6" zIndex={1500}>
          <IconButton
            size="lg"
            rounded="full"
            colorPalette="blue"
            shadow="2xl"
            onClick={() => setIsOpen(!isOpen)}
            variant="solid"
            _active={{ transform: 'scale(0.9)' }}
            transition="0.2s"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </IconButton>
        </Box>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              position="fixed"
              bottom="24"
              right="6"
              w="260px"
              maxH="70vh"
              bg={glassBg}
              backdropFilter="blur(16px)"
              borderRadius="3xl"
              boxShadow="2xl"
              p="4"
              zIndex={1500}
              border="1px solid"
              borderColor="whiteAlpha.300"
              overflowY="auto"
            >
              <SidebarContent onItemClick={() => setIsOpen(false)} />
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Backdrop for mobile */}
        <AnimatePresence>
          {isOpen && (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              position="fixed"
              inset="0"
              // bg="blackAlpha.600"
              // backdropFilter="blur(4px)"
              zIndex="overlay"
              onClick={() => setIsOpen(false)}
            />
          )}
        </AnimatePresence>
      </>
    )
  }

  // Desktop Glassmorphism Sidebar
  return (
    <Box
      w="260px"
      h="100vh"
      p="6"
      position="fixed"
      left="0"
      top="0"
      bg={glassBg}
      backdropFilter="blur(12px)"
      borderRight="1px solid"
      borderColor="gray.200"
      _dark={{ borderColor: 'gray.700' }}
    >
      <Link to="/">
        <HStack mb="10" gap={3}>
          <Circle size="40px" bg="blue.500" color="white" shadow="md">
            <FiPieChart size={20} />
          </Circle>
          <Text fontSize="2xl" fontWeight="black" tracking="tight" color="blue.600" _dark={{ color: 'blue.400' }}>
            MoneyManage
          </Text>
        </HStack>
      </Link>
      <SidebarContent />
    </Box>
  )
}

export default Sidebar
