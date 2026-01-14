import React,{ useState, useEffect } from 'react'
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
import { toaster } from "./../../components/ui/toaster";
import axios from 'axios';
// import { isLogin } from '../../components/isLogin';
import Config from '../../components/axios/Config';

export default function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');

  
  useEffect(() => {
    fetchCategory();
  }, []);

    const fetchCategory = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
     
      const url = import.meta.env.VITE_API_URL + 'categories';
      
      let axiosInstance = axios.get(url, Config({ Authorization: `Bearer ${token}` }))

      await axiosInstance.then(response => {
          setCategories(response.data.data);
        }).catch(error => {
          console.error(error);
          setError(error);
        }).finally(() => {
          setLoading(false);
        });
    };

    const handleAddCategory = async () => {
     
      const body = {
        categoryName,
        description
      };

      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'categories';
     
      let axiosInstance = axios.post(url, body, Config({ Authorization: `Bearer ${token}` }))
        
      axiosInstance.then(response => {
          setCategories([...categories, response.data.data]);
          setModal(false);
          setCategoryName('');
          setDescription('');
          toaster.create({
            description: "Create Category Successful",
            type: "success",
          });

        }).catch(error => {
          console.error(error);
          setError(error);
        }).finally(() => {
          setLoading(false)
          setError(null)
        });
    };

    const deleteCategory = async (id) => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = import.meta.env.VITE_API_URL + 'categories/' + id;
     
      let axiosInstance = axios.delete(url, Config({ Authorization: `Bearer ${token}` }))

      axiosInstance.then(response => {
        if(response.data.success) {
          setCategories(categories.filter(category => category.ID!== id));
          toaster.create({
            description: "Delete Category Successful",
            type: "success",
          });
        }
      }).catch(error => {
        toaster.create({});
        console.error(error);
        setError(error);
      }).finally(() => {
        setLoading(false)
        setError(null)
      });
    };

    const handleDelete = (id) => {
      if (window.confirm('Are you sure you want to delete this category?')) {
        deleteCategory(id);
      }
    };

    return (
      <>
        <Box maxW="6xl" mx="auto" px={4} py={8}>
          <Heading as="h3" size="lg" textAlign="start" mb={6}>
            Category List
          </Heading>
          <Box display="flex" justifyContent="flex-end">
            <Button  mb={5} variant={"outline"} colorScheme={"blue"} colorPalette={"bg"} onClick={() => setModal(true)}>
              Add Category
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

          {categories.length > 0 ? (
              <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Name</Table.ColumnHeader>
                      <Table.ColumnHeader>Description</Table.ColumnHeader>
                      <Table.ColumnHeader>Actions</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {categories.map((item) => (
                      <Table.Row key={item.ID}>
                        <Table.Cell>{item.CategoryName}</Table.Cell>
                        <Table.Cell>{item.Description}</Table.Cell>
                        <Table.Cell>
                          <Button
                            variant="link"
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDelete(item.ID)}
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
                  No categories found.
              </Text>
          )}
        </Box>

        <Dialog.Root lazyMount open={modal} onOpenChange={(e) => setModal(e.open)}>
          <Portal>
            <Dialog.Backdrop />
            <Dialog.Positioner>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Add Category</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Field.Root required marginBottom={'20px'}>
                    <Field.Label>
                      Category Name <Field.RequiredIndicator />
                    </Field.Label>
                    <Input 
                      placeholder="Enter category name" 
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)} 
                    />
                  </Field.Root>
                  <Field.Root required marginBottom={'20px'}>
                    <Field.Label>
                      Description <Field.RequiredIndicator />
                    </Field.Label>
                    <Input 
                      placeholder="Enter description" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)} 
                    />
                  </Field.Root>
                </Dialog.Body>
                <Dialog.Footer>
                  <Dialog.ActionTrigger asChild>
                    <Button variant="outline">Cancel</Button>
                  </Dialog.ActionTrigger>
                  <Button variant="outline" colorScheme="blue" type="submit" onClick={handleAddCategory}>Save</Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </>
    );
}