import React, { useState } from 'react';
import {
  Flex,
  Box,
  Input,
  Stack,
  Button,
  Heading,
  Field,
  HStack
} from '@chakra-ui/react';

import { toaster } from "./../../components/ui/toaster"

import { useColorModeValue } from'./../../components/ui/color-mode';
import { RiArrowRightCircleLine } from 'react-icons/ri';
import axios from 'axios';
export default function Login() {
    const [name, setName] = useState('');
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
          console.log('Form submission finished');
          setIsLoading(false);
        }
    }

  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'2xl'}>Login</Heading>
        </Stack>
        <Box
          rounded={'lg'}
          boxShadow={'lg'}
          p={8}
          bg={useColorModeValue('white', 'gray.700')}
          >
         <Field.Root required marginBottom={'20px'}>
            <Field.Label>
                Email <Field.RequiredIndicator />
            </Field.Label>
            <Input placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
        </Field.Root>
        <Field.Root required marginBottom={'20px'}>
            <Field.Label>
                Password <Field.RequiredIndicator />
            </Field.Label>  
            <Input type="password" placeholder="Enter your password"  onChange={(e) => setPassword(e.target.value)} />
        </Field.Root>
          <HStack>
      <Button colorPalette="teal" variant="outline" onClick={(e) => handleLogin(e)}>
        <RiArrowRightCircleLine /> Login
      </Button>
    </HStack>
        </Box>
      </Stack>
    </Flex>
  );
}
