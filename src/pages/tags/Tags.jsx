import React, { useState, useEffect } from "react";
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
  Input,
  Flex,
  HStack,
  Icon,
  VStack,
  Badge,
  IconButton,
} from "@chakra-ui/react";
import { toaster } from "./../../components/ui/toaster";
import { useColorModeValue } from "../../components/ui/color-mode";
import axios from "axios";
import Config from "../../components/axios/Config";
import { FiTag, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";

const EMOJI_OPTIONS = [
  "🏷️",
  "🔖",
  "💰",
  "🛒",
  "🏠",
  "🚗",
  "✈️",
  "🎁",
  "💳",
  "📱",
  "💻",
  "🍔",
  "☕",
  "🏥",
  "📚",
  "🎬",
  "🎵",
  "🎮",
  "⚽",
  "🎯",
];

export default function Tags() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null); // tag to confirm-delete
  const [formData, setFormData] = useState({
    name: "",
    color: "#6366F1",
    icon: "",
  });

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const subtitleColor = useColorModeValue("gray.600", "gray.400");

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");

    const url = import.meta.env.VITE_API_URL + "v2/tags?sort=usage";

    let axiosInstance = axios.get(
      url,
      Config({ Authorization: `Bearer ${token}` }),
    );

    await axiosInstance
      .then((response) => {
        setTags(response.data.data || []);
      })
      .catch((error) => {
        console.error(error);
        toaster.create({
          description: "Failed to fetch tags",
          type: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSaveTag = async () => {
    if (!formData.name) {
      toaster.create({
        description: "Please enter a tag name",
        type: "error",
      });
      return;
    }

    setLoading(true);

    const body = {
      name: formData.name,
      color: formData.color,
      icon: formData.icon,
    };

    const token = localStorage.getItem("token");
    let url = import.meta.env.VITE_API_URL + "v2/tags";
    let axiosInstance;

    if (editMode) {
      url = import.meta.env.VITE_API_URL + `v2/tags/${formData.id}`;
      axiosInstance = axios.put(
        url,
        body,
        Config({ Authorization: `Bearer ${token}` }),
      );
    } else {
      axiosInstance = axios.post(
        url,
        body,
        Config({ Authorization: `Bearer ${token}` }),
      );
    }

    axiosInstance
      .then((response) => {
        if (editMode) {
          setTags(
            tags.map((tag) =>
              tag.id === formData.id ? response.data.data : tag,
            ),
          );
          toaster.create({
            description: "Tag updated successfully",
            type: "success",
          });
        } else {
          setTags([response.data.data, ...tags]);
          toaster.create({
            description: "Tag created successfully",
            type: "success",
          });
        }
        setModal(false);
        setFormData({ name: "", color: "#6366F1", icon: "" });
        setEditMode(false);
      })
      .catch((error) => {
        console.error(error);
        toaster.create({
          description: editMode
            ? "Failed to update tag"
            : "Failed to create tag",
          type: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteTag = async (id) => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const url = import.meta.env.VITE_API_URL + `v2/tags/${id}`;

    let axiosInstance = axios.delete(
      url,
      Config({ Authorization: `Bearer ${token}` }),
    );

    axiosInstance
      .then(() => {
        setTags(tags.filter((tag) => tag.id !== id));
        toaster.create({
          description: "Tag deleted successfully",
          type: "success",
        });
      })
      .catch((error) => {
        toaster.create({
          description: "Failed to delete tag",
          type: "error",
        });
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDelete = (tag) => {
    setDeleteTarget(tag);
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteTag(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (tag) => {
    setFormData({
      id: tag.id,
      name: tag.name,
      color: tag.color || "#6366F1",
      icon: tag.icon || "",
    });
    setEditMode(true);
    setModal(true);
  };

  const handleOpenModal = () => {
    setFormData({ name: "", color: "#6366F1", icon: "" });
    setEditMode(false);
    setModal(true);
  };

  const handleInputChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <Box maxW="6xl" mx="auto" px={4} py={6}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Flex align="center" gap={3}>
              <Icon as={FiTag} boxSize={6} color="blue.500" />
              <Heading as="h1" size="xl" fontWeight="bold">
                Tags
              </Heading>
            </Flex>
            <Text color={subtitleColor} mt={1}>
              Manage your transaction tags and labels
            </Text>
          </Box>
          <Button
            colorPalette="blue"
            onClick={handleOpenModal}
            leftIcon={<FiPlus />}
          >
            Add Tag
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py={16}>
            <Spinner size="xl" color="blue.500" />
          </Flex>
        ) : tags.length > 0 ? (
          <Table.Root
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            <Table.Header>
              <Table.Row bg={{ base: "gray.50", _dark: "gray.900" }}>
                <Table.ColumnHeader>Tag</Table.ColumnHeader>
                <Table.ColumnHeader>Color</Table.ColumnHeader>
                <Table.ColumnHeader>Usage</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="end">Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tags.map((tag) => (
                <Table.Row
                  key={tag.id}
                  borderBottom="1px solid"
                  borderBottomColor={borderColor}
                >
                  <Table.Cell>
                    <HStack gap={2}>
                      {tag.icon && <Text fontSize="lg">{tag.icon}</Text>}
                      <Text fontWeight="medium">{tag.name}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex align="center" gap={2}>
                      <Box
                        w="6"
                        h="6"
                        borderRadius="full"
                        bg={tag.color}
                        border="2px solid"
                        borderColor={borderColor}
                      />
                      <Text fontSize="sm" color="gray.500">
                        {tag.color}
                      </Text>
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      colorPalette="blue"
                      variant="subtle"
                      px={2}
                      py={1}
                      borderRadius="md"
                      fontSize="sm"
                    >
                      {tag.usage_count || 0} uses
                    </Badge>
                  </Table.Cell>
                  <Table.Cell textAlign="end">
                    <HStack gap={2} justify="flex-end">
                      <IconButton
                        variant="ghost"
                        colorPalette="blue"
                        size="sm"
                        onClick={() => handleEdit(tag)}
                        aria-label="Edit tag"
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton
                        variant="ghost"
                        colorPalette="red"
                        size="sm"
                        onClick={() => handleDelete(tag)}
                        aria-label="Delete tag"
                      >
                        <FiTrash2 />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : (
          <Box
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            p={12}
            textAlign="center"
          >
            <VStack gap={4}>
              <Box
                w="16"
                h="16"
                borderRadius="full"
                bg="blue.50"
                _dark={{ bg: "blue.900" }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Icon as={FiTag} boxSize={8} color="blue.500" />
              </Box>
              <VStack gap={2}>
                <Text fontSize="xl" fontWeight="bold">
                  No tags yet
                </Text>
                <Text color={subtitleColor} maxW="sm">
                  Get started by creating your first tag to organize and
                  categorize your transactions.
                </Text>
              </VStack>
              <Button
                colorPalette="blue"
                onClick={handleOpenModal}
                leftIcon={<FiPlus />}
              >
                Create First Tag
              </Button>
            </VStack>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        lazyMount
        open={!!deleteTarget}
        onOpenChange={(e) => {
          if (!e.open) setDeleteTarget(null);
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Delete Tag</Dialog.Title>
                <Dialog.Description>
                  Are you sure you want to delete the tag{" "}
                  <Text as="span" fontWeight="bold">
                    {deleteTarget?.icon} {deleteTarget?.name}
                  </Text>
                  ? This action cannot be undone.
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteTarget(null)}
                  >
                    Cancel
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  colorPalette="red"
                  onClick={confirmDelete}
                  loading={loading}
                >
                  Delete
                </Button>
              </Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      {/* Create / Edit Tag Dialog */}
      <Dialog.Root
        lazyMount
        open={modal}
        onOpenChange={(e) => setModal(e.open)}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {editMode ? "Edit Tag" : "Create New Tag"}
                </Dialog.Title>
                <Dialog.Description>
                  {editMode
                    ? "Update tag details"
                    : "Add a new tag to organize your transactions"}
                </Dialog.Description>
              </Dialog.Header>
              <Dialog.Body>
                <VStack gap={4}>
                  <Field.Root required>
                    <Field.Label>
                      Tag Name <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                      placeholder="e.g., Groceries, Bills, Travel"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Color</Field.Label>
                    <Flex gap={2} align="center">
                      <Input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleInputChange}
                        w="16"
                        p="0"
                        h="10"
                        borderRadius="md"
                        border="1px solid"
                        borderColor={borderColor}
                      />
                      <Text fontSize="sm" color="gray.500">
                        {formData.color}
                      </Text>
                    </Flex>
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>Icon (Optional)</Field.Label>
                    <Box>
                      <Flex gap={2} flexWrap="wrap">
                        <HStack
                          p={2}
                          borderRadius="md"
                          border="1px solid"
                          borderColor={
                            formData.icon === "" ? "blue.500" : borderColor
                          }
                          bg={formData.icon === "" ? "blue.50" : "transparent"}
                          cursor="pointer"
                          onClick={() => setFormData({ ...formData, icon: "" })}
                        >
                          <Text fontSize="sm" color="gray.500">
                            None
                          </Text>
                        </HStack>
                        {EMOJI_OPTIONS.map((emoji) => (
                          <Box
                            key={emoji}
                            p={2}
                            borderRadius="md"
                            border="1px solid"
                            borderColor={
                              formData.icon === emoji ? "blue.500" : borderColor
                            }
                            bg={
                              formData.icon === emoji
                                ? "blue.50"
                                : "transparent"
                            }
                            cursor="pointer"
                            onClick={() =>
                              setFormData({ ...formData, icon: emoji })
                            }
                          >
                            <Text fontSize="lg">{emoji}</Text>
                          </Box>
                        ))}
                      </Flex>
                    </Box>
                  </Field.Root>
                </VStack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <Button
                  type="submit"
                  onClick={handleSaveTag}
                  loading={loading}
                  colorPalette="blue"
                >
                  {editMode ? "Update Tag" : "Create Tag"}
                </Button>
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
