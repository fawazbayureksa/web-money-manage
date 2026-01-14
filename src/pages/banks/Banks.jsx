import React from 'react'
import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Spinner,
  Table,
  Text,
  Button,
  Dialog,
  Portal,
  CloseButton,
  Field,
  Input
} from "@chakra-ui/react";
import { toaster } from "./../../components/ui/toaster"
export default function Banks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState(null);
  const [bankName, setBankName] = useState('');
  const [logo, setLogo] = useState('');
  const [color, setColor] = useState('');

  
  useEffect(() => {
    fetchBanks();
  }, []);

    const fetchBanks = async () => {
      setLoading(true);
      
      try {
        let url = import.meta.env.VITE_API_URL + 'banks';
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBanks(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const handleAddBank = async () => {
      try {
        let body = {
          bank_name: bankName,
          image: logo,
          color: color,
        }

        const response = await fetch(import.meta.env.VITE_API_URL + 'banks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
      
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        toaster.create({
          description: "Create Bank Successful",
          type: "success",
        })
        setBanks([...banks, data.data]);
        setModal(false);
        setBankName('');
        setLogo('');
        setColor('');
      } catch (error) {
        toaster.create({
          description: "Create Bank Failed",
          type: "error",
        })
        setError(error.message);
      }
    }

    const deleteBank = async (id) => {
      try {
        let url = import.meta.env.VITE_API_URL + 'banks';
        const response = await fetch(`${url}/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        toaster.create({
          description: "Delete Bank Successful",
          type: "success",
        })
        fetchBanks();
      } catch (error) {
        setError(error.message);
      }
    };

    const handleDelete = (id) => {
      if (window.confirm('Are you sure you want to delete this bank?')) {
        deleteBank(id);
      }
    }

    return (
      <>
        <Box maxW="6xl" mx="auto" px={4} py={8}>
        <Heading as="h3" size="lg" textAlign="start" mb={6}>
            Bank List
        </Heading>
       <Box display="flex" justifyContent="flex-end">
        <Button variant={"outline"} colorScheme={"blue"} colorPalette={"bg"} onClick={() => setModal(true)}>
          Add Bank
        </Button>
       </Box>

        {loading && (
            <Spinner size="xl" color="blue.500" />
        )}

        {error && (
            <Text color="red.500" textAlign="center">
                Error: {error}
            </Text>
        )}

        {banks.length > 0 ? (
            <Table.Root>
                <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Logo</Table.ColumnHeader>
                    <Table.ColumnHeader>Color</Table.ColumnHeader>
                    <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
                </Table.Header>
                <Table.Body>
                {banks.map((item) => (
                    <Table.Row key={item.id}>
                    <Table.Cell>{item.bank_name}</Table.Cell>
                    <Table.Cell>{item.image}</Table.Cell>
                    <Table.Cell>{item.color}</Table.Cell>
                    <Table.Cell>
                        {/* <Button
                        variant="link"
                        colorScheme="blue"
                        size="sm"
                        mr={2}
                        >
                        Edit
                        </Button> */}
                        <Button
                        variant="link"
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        >
                        Delete
                        </Button>
                    </Table.Cell>
                    </Table.Row>
                ))}
                </Table.Body>
            </Table.Root>
        ) : (
            <Text textAlign="center" fontSize="lg" color="gray.500">
                No banks found.
            </Text>
        )}
        </Box>
         <>
            <Dialog.Root lazyMount open={modal} onOpenChange={(e) => setModal(e.open)}>
                    <Portal>
                      <Dialog.Backdrop />
                      <Dialog.Positioner>
                        <Dialog.Content>
                          <Dialog.Header>
                            <Dialog.Title>Edit</Dialog.Title>
                          </Dialog.Header>
                          <Dialog.Body>
                            <Field.Root required marginBottom={'20px'}>
                                <Field.Label>
                                    Bank Name <Field.RequiredIndicator />
                                </Field.Label>
                                <Input placeholder="Enter bank name" value={bankName}
                                onChange={(e) => setBankName(e.target.value)} />
                            </Field.Root>
                              <Field.Root required marginBottom={'20px'}>
                                <Field.Label>
                                    Logo <Field.RequiredIndicator />
                                </Field.Label>
                                <Input placeholder="Enter logo" value={logo}
                                onChange={(e) => setLogo(e.target.value)} />
                            </Field.Root>
                              <Field.Root required marginBottom={'20px'}>
                                <Field.Label>
                                    Color <Field.RequiredIndicator />
                                </Field.Label>
                                <Input placeholder="Enter Color" value={color}
                                onChange={(e) => setColor(e.target.value)} />
                            </Field.Root>
                          </Dialog.Body>
                          <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                              <Button variant="outline">Cancel</Button>
                            </Dialog.ActionTrigger>
                            <Button variant="outline" colorScheme="blue" type="submit" onClick={handleAddBank}>Save</Button>
                          </Dialog.Footer>
                          <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                          </Dialog.CloseTrigger>
                        </Dialog.Content>
                      </Dialog.Positioner>
                    </Portal>
            </Dialog.Root>
            </>
        </>
  );
}
