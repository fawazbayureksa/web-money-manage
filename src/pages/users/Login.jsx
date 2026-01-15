import React, { useState } from 'react';
import {
  Box,
  Flex,
  Stack,
  Heading,
  Text,
  Container,
  Input,
  Button,
  SimpleGrid,
  Image,
  AbsoluteCenter,
  Span,
} from '@chakra-ui/react';
import { Toaster, toaster } from "./../../components/ui/toaster"
import { useColorModeValue } from'./../../components/ui/color-mode';
import { RiArrowRightCircleLine } from 'react-icons/ri';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
      console.log(import.meta.env.VITE_API_URL);
        e.preventDefault();
        setIsLoading(true);
        try {
          let url = import.meta.env.VITE_API_URL + 'login';
          const response = await axios.post(url, {
            email,
            password
          });
         
          if (response.data.success) {
            localStorage.setItem('token', response.data.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
            toaster.create({
              description: "Login successful",
              type: "success",
            })
            window.location.href = '/';
          } else {
            toaster.create({
              description: "Invalid email or password",
              type: "error",
            })
          }
        } catch (error) {
          toaster.create({
            description: "Failed to login",
            type: "error",
          })
        } finally {
          setIsLoading(false);
        }
    }

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box position="relative" minH="100vh">
        <Toaster />
      <SimpleGrid columns={{ base: 1, md: 2 }} minH="100vh">
        {/* Left Side - Hero Image (Hidden on Mobile) */}
        <Flex
          bg="blue.600"
          position="relative"
          display={{ base: 'none', md: 'flex' }}
          align="center"
          justify="center"
        >
          <Image
            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80"
            alt="Money Management"
            objectFit="cover"
            w="full"
            h="full"
            opacity={0.6}
            position="absolute"
            top={0}
            left={0}
          />
          <Stack position="relative" zIndex={1} spacing={6} px={10} color="white" textAlign="center">
            <Heading fontSize="5xl" fontWeight="bold">
              Manage Your Wealth
            </Heading>
            <Text fontSize="xl" fontWeight="medium">
              Track expenses, budgets, and investments in one place.
            </Text>
          </Stack>
        </Flex>

        {/* Right Side - Login Form */}
        <Flex bg={bgColor} align="center" justify="center" p={8}>
          <Stack spacing={8} w="full" maxW="md">
            <Stack spacing={2} textAlign="center">
              <Heading fontSize="3xl">Welcome Back</Heading>
              <Text fontSize="lg" color={textColor}>
                Sign in to your account
              </Text>
            </Stack>

            <Box
              rounded="xl"
              bg={cardBgColor}
              boxShadow="2xl"
              p={10}
            >
              <form onSubmit={handleLogin}>
                <Stack spacing={6}>
                  <Box>
                    <Text mb={2} fontWeight="semibold">Email Address</Text>
                    <Input 
                        placeholder="you@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="lg"
                        borderRadius="md"
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="semibold">Password</Text>
                    <Input 
                        type="password" 
                        placeholder="••••••••" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        size="lg"
                        borderRadius="md"
                    />
                  </Box>

                  <Button
                    type="submit"
                    colorPalette="blue"
                    size="lg"
                    fontSize="md"
                    isLoading={isLoading}
                    disabled={isLoading}
                    w="full"
                    mt={4}
                  >
                   <RiArrowRightCircleLine style={{ marginRight: '8px' }} /> Sign in
                  </Button>
                </Stack>
              </form>
            </Box>
            
             <Text align="center" color={textColor}>
                Don't have an account? <Span color="blue.500" fontWeight="bold" cursor="pointer">Sign up</Span>
              </Text>

          </Stack>
        </Flex>
      </SimpleGrid>
    </Box>
  );
}
