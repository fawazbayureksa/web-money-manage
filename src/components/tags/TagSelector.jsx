import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Badge,
  Input,
  Text,
  IconButton,
  Popover,
  Portal,
  Button,
  Flex,
} from '@chakra-ui/react';
import { useColorModeValue } from '../ui/color-mode';
import axios from 'axios';
import Config from '../axios/Config';
import { FiTag, FiX, FiPlus } from 'react-icons/fi';
import { toaster } from '../ui/toaster';

const EMOJI_OPTIONS = ['🏷️', '🔖', '💰', '🛒', '🏠', '🚗', '✈️', '🎁', '💳', '📱', '💻', '🍔', '☕', '🏥', '📚', '🎬', '🎵', '🎮', '⚽', '🎯'];

export const TagSelector = ({ selectedTags, onTagsChange, categoryId, description }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTag, setNewTag] = useState({ name: '', color: '#6366F1', icon: '' });
  const [suggestions, setSuggestions] = useState([]);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchTags();
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, description]);

  const fetchTags = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(
        import.meta.env.VITE_API_URL + 'v2/tags',
        Config({ Authorization: `Bearer ${token}` })
      );
      setTags(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    const token = localStorage.getItem('token');
    if (!categoryId && !description) {
      setSuggestions([]);
      return;
    }

    try {
      const params = new URLSearchParams();
      if (categoryId) params.append('category_id', categoryId);
      if (description) params.append('description', description);

      const response = await axios.get(
        import.meta.env.VITE_API_URL + `v2/tags/suggest?${params.toString()}`,
        Config({ Authorization: `Bearer ${token}` })
      );
      setSuggestions(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tag suggestions:', error);
    }
  };

  const toggleTag = (tag) => {
    const isSelected = selectedTags.some(t => t.id === tag.id);
    if (isSelected) {
      onTagsChange(selectedTags.filter(t => t.id !== tag.id));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagId) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId));
  };

  const handleCreateTag = async () => {
    if (!newTag.name) {
      toaster.create({
        description: "Please enter a tag name",
        type: "error",
      });
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        import.meta.env.VITE_API_URL + 'v2/tags',
        newTag,
        Config({ Authorization: `Bearer ${token}` })
      );
      const createdTag = response.data.data;
      onTagsChange([...selectedTags, createdTag]);
      setTags([createdTag, ...tags]);
      setNewTag({ name: '', color: '#6366F1', icon: '' });
      setShowCreateTag(false);
      toaster.create({
        description: "Tag created successfully",
        type: "success",
      });
    } catch {
      toaster.create({
        description: "Failed to create tag",
        type: "error",
      });
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.some(t => t.id === tag.id)
  );

  const displayTags = suggestions.length > 0 && !searchQuery ? suggestions : filteredTags;

  return (
    <Box>
      <Popover.Root open={isOpen} onOpenChange={(e) => setIsOpen(e.open)}>
        <PopoverTrigger asChild>
          <Box
            p={3}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            bg={cardBg}
            cursor="pointer"
            _hover={{ borderColor: 'blue.400' }}
            transition="all 0.2s"
            onClick={() => setIsOpen(true)}
          >
            {selectedTags.length > 0 ? (
              <Flex gap={2} flexWrap="wrap">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    px={2}
                    py={1}
                    borderRadius="md"
                    display="inline-flex"
                    alignItems="center"
                    gap={1}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag.id);
                    }}
                    style={{
                      backgroundColor: tag.color + '20',
                      border: `1px solid ${tag.color}60`,
                      color: tag.color
                    }}
                    cursor="pointer"
                  >
                    {tag.icon && <span>{tag.icon}</span>}
                    {tag.name}
                    <FiX size={12} onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag.id);
                    }} />
                  </Badge>
                ))}
                {selectedTags.length === 0 && (
                  <Flex align="center" gap={2} color="gray.400">
                    <FiTag />
                    <Text>Select tags...</Text>
                  </Flex>
                )}
              </Flex>
            ) : (
              <Flex align="center" gap={2} color="gray.400">
                <FiTag />
                <Text>Select tags...</Text>
              </Flex>
            )}
          </Box>
        </PopoverTrigger>
        <Portal>
          <PopoverContent w="400px" p={0} boxShadow="xl" borderRadius="xl" border="1px solid" borderColor={borderColor}>
            <PopoverBody p={3}>
              <VStack gap={3} align="stretch">
                <HStack gap={2}>
                  <Input
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="sm"
                    borderColor={borderColor}
                  />
                  <IconButton
                    size="sm"
                    variant="ghost"
                    colorPalette="blue"
                    onClick={() => setShowCreateTag(!showCreateTag)}
                    aria-label="Create new tag"
                  >
                    <FiPlus />
                  </IconButton>
                </HStack>

                {showCreateTag && (
                  <VStack gap={2} p={3} bg={hoverBg} borderRadius="md">
                    <Text fontSize="sm" fontWeight="bold">Create New Tag</Text>
                    <Input
                      placeholder="Tag name"
                      value={newTag.name}
                      onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                      size="sm"
                      borderColor={borderColor}
                    />
                    <Flex gap={2} align="center">
                      <Input
                        type="color"
                        value={newTag.color}
                        onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                        w="12"
                        h="8"
                        p="0"
                        borderRadius="md"
                      />
                      <Text fontSize="xs" color="gray.500">{newTag.color}</Text>
                    </Flex>
                    <Flex gap={1} flexWrap="wrap">
                      <Box
                        p={1}
                        borderRadius="sm"
                        border="1px solid"
                        borderColor={newTag.icon === '' ? 'blue.500' : borderColor}
                        bg={newTag.icon === '' ? 'blue.50' : 'transparent'}
                        cursor="pointer"
                        onClick={() => setNewTag({ ...newTag, icon: '' })}
                      >
                        <Text fontSize="sm">None</Text>
                      </Box>
                      {EMOJI_OPTIONS.slice(0, 10).map((emoji) => (
                        <Box
                          key={emoji}
                          p={1}
                          borderRadius="sm"
                          border="1px solid"
                          borderColor={newTag.icon === emoji ? 'blue.500' : borderColor}
                          bg={newTag.icon === emoji ? 'blue.50' : 'transparent'}
                          cursor="pointer"
                          onClick={() => setNewTag({ ...newTag, icon: emoji })}
                        >
                          <Text fontSize="md">{emoji}</Text>
                        </Box>
                      ))}
                    </Flex>
                    <Button size="sm" colorPalette="blue" onClick={handleCreateTag} w="full">
                      Create Tag
                    </Button>
                  </VStack>
                )}

                {suggestions.length > 0 && !searchQuery && !showCreateTag && (
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={2}>Suggested tags</Text>
                  </Box>
                )}

                {loading ? (
                  <Text fontSize="sm" color="gray.500" textAlign="center">Loading tags...</Text>
                ) : displayTags.length > 0 ? (
                  <VStack gap={1} align="stretch" maxH="250px" overflowY="auto">
                    {displayTags.map((tag) => (
                      <Box
                        key={tag.id}
                        p={2}
                        borderRadius="md"
                        _hover={{ bg: hoverBg }}
                        cursor="pointer"
                        onClick={() => toggleTag(tag)}
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        {tag.icon && <Text fontSize="md">{tag.icon}</Text>}
                        <Text fontSize="sm" flex={1}>{tag.name}</Text>
                        <Box
                          w="4"
                          h="4"
                          borderRadius="full"
                          bg={tag.color}
                          border="1px solid"
                          borderColor={borderColor}
                        />
                      </Box>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="gray.500" textAlign="center">No tags found</Text>
                )}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        </Portal>
      </Popover.Root>
    </Box>
  );
};
