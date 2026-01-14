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
export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [isVerified, setIsVerified] = useState(true);
    const [isAdmin, setIsAdmin] = useState(true);
    
    const handleSubmit = async(e) => {
        e.preventDefault();
     setIsLoading(true);
     let url = import.meta.env.VITE_API_URL + '/register';
        try {
          await axios.post(url, {
                name,
                email,
                password,
                address,
                is_verified: isVerified,
                is_admin: isAdmin
            });

            toaster.create({
                description: "User register successfully",
                type: "info",
            })
            // Clear form on success
            setName('');
            setEmail('');
            setPassword('');
        } catch (error) {
            toaster.create({
                description: "User register failed",
                type: "error",
            })
        } finally {
            console.log('Form submission finished');
            setIsLoading(false);
        }

    };



  return (
    <Flex
      minH={'100vh'}
      align={'center'}
      justify={'center'}
      bg={useColorModeValue('gray.50', 'gray.800')}
      >
      <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
        <Stack align={'center'}>
          <Heading fontSize={'2xl'}>Register</Heading>
        </Stack>
        <Box
          rounded={'lg'}
          boxShadow={'lg'}
          p={8}
          bg={useColorModeValue('white', 'gray.700')}
          >
         <Field.Root required marginBottom={'20px'}>
            <Field.Label>
                Name <Field.RequiredIndicator />
            </Field.Label>
            <Input placeholder="Enter your name"  onChange={(e) => setName(e.target.value)} />
        </Field.Root>
         <Field.Root required marginBottom={'20px'}>
            <Field.Label>
                Email <Field.RequiredIndicator />
            </Field.Label>
            <Input placeholder="Enter your email" onChange={(e) => setEmail(e.target.value)} />
            <Field.HelperText>We'll never share your email.</Field.HelperText>
        </Field.Root>
        <Field.Root required marginBottom={'20px'}>
            <Field.Label>
                Password <Field.RequiredIndicator />
            </Field.Label>  
            <Input type="password" placeholder="Enter your password"  onChange={(e) => setPassword(e.target.value)} />
            <Field.HelperText>
                Password must be at least 8 characters long.
            </Field.HelperText>
        </Field.Root>
          <HStack>
      <Button colorPalette="teal" variant="solid" onClick={(e) => handleSubmit(e)}>
        <RiArrowRightCircleLine /> Register
      </Button>
    </HStack>
        </Box>
      </Stack>
    </Flex>
  );
}
