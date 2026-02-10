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
  IconButton,
} from '@chakra-ui/react';
import { Toaster, toaster } from "./../../components/ui/toaster"
import { useColorModeValue } from './../../components/ui/color-mode';
import { RiArrowRightCircleLine } from 'react-icons/ri';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import axios from 'axios';

// Chakra spacing token (16 corresponds to 4rem in the default scale) for the toggle button.
const PASSWORD_INPUT_PADDING_RIGHT = 16;

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setIsLoading(true);
        let url = import.meta.env.VITE_API_URL + 'register';
        try {
            await axios.post(url, {
                name,
                email,
                password,
                address
            });

            toaster.create({
                description: "User registered successfully",
                type: "success",
            })
            // Clear form on success
            setName('');
            setEmail('');
            setPassword('');
            setAddress('');
            window.location.href = '/login';
        } catch {
            toaster.create({
                description: "Registration failed",
                type: "error",
            })
        } finally {
            setIsLoading(false);
        }
    };



  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box position="relative" minH="100vh">
        <Toaster />
      <SimpleGrid columns={{ base: 1, md: 2 }} minH="100vh">
        {/* Left Side - Hero Image (Hidden on Mobile) */}
        <Flex
          bg="green.600"
          position="relative"
          display={{ base: 'none', md: 'flex' }}
          align="center"
          justify="center"
        >
          <Image
            src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&q=80"
            alt="Financial Planning"
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
              Start Your Journey
            </Heading>
            <Text fontSize="xl" fontWeight="medium">
              Join thousands managing their finances smarter.
            </Text>
          </Stack>
        </Flex>

        {/* Right Side - Register Form */}
        <Flex bg={bgColor} align="center" justify="center" p={8}>
          <Stack spacing={8} w="full" maxW="md">
            <Stack spacing={2} textAlign="center">
              <Heading fontSize="3xl">Create Account</Heading>
              <Text fontSize="lg" color={textColor}>
                Sign up to get started
              </Text>
            </Stack>

            <Box
              rounded="xl"
              bg={cardBgColor}
              boxShadow="2xl"
              p={10}
            >
              <form onSubmit={handleSubmit}>
                <Stack spacing={6}>
                  <Box>
                    <Text mb={2} fontWeight="semibold">Full Name</Text>
                    <Input
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        required
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="semibold">Email Address</Text>
                    <Input
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        size="lg"
                        borderRadius="md"
                        required
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="semibold">Password</Text>
                    <Box position="relative">
                      <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          size="lg"
                          borderRadius="md"
                          required
                          pr={PASSWORD_INPUT_PADDING_RIGHT}
                      />
                      <IconButton
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        size="sm"
                        variant="ghost"
                        bg="transparent"
                        _hover={{ bg: "transparent" }}
                        position="absolute"
                        top="50%"
                        right={2}
                        transform="translateY(-50%)"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <LuEyeOff /> : <LuEye />}
                      </IconButton>
                    </Box>
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="semibold">Address</Text>
                    <Input
                        placeholder="Enter your address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        size="lg"
                        borderRadius="md"
                    />
                  </Box>

                  <Button
                    type="submit"
                    colorPalette="green"
                    size="lg"
                    bg={"green.600"}
                    fontSize="md"
                    isLoading={isLoading}
                    disabled={isLoading}
                    w="full"
                    mt={4}
                  >
                   <RiArrowRightCircleLine style={{ marginRight: '8px' }} /> Sign up
                  </Button>
                </Stack>
              </form>
            </Box>

             <Text align="center" color={textColor}>
                Already have an account? <Span onClick={() => window.location.href = '/login'} color="green.500" fontWeight="bold" cursor="pointer">Sign in</Span>
              </Text>

          </Stack>
        </Flex>
      </SimpleGrid>
    </Box>
  );
}
