import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Heading,
  Text,
  Flex,
  Icon,
  VStack,
  HStack,
  Avatar,
  Input,
  IconButton,
  Divider,
  Spinner,
  useToast,
  Badge,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiMessageSquare, 
  FiSend, 
  FiPaperclip, 
  FiUser, 
  FiRefreshCw,
  FiInfo
} from 'react-icons/fi';
import { 
  sendMessage, 
  fetchOrder, 
  selectConversationStatus, 
  selectConversationError 
} from '../../features/orders/ordersSlice';

// Komponent pojedynczej wiadomości
const MessageItem = ({ message, isCurrentUser }) => {
  // Formatowanie daty
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Określenie koloru i pozycji wiadomości w zależności od nadawcy
  const bgColor = isCurrentUser ? 'brand.50' : 'gray.50';
  const textAlign = isCurrentUser ? 'right' : 'left';
  const borderRadius = isCurrentUser 
    ? '8px 8px 0 8px' 
    : '8px 8px 8px 0';
  
  // Określenie koloru i etykiety dla typu nadawcy
  const getSenderBadge = (senderId) => {
    switch (senderId) {
      case 'agent':
        return { color: 'green', label: 'Automatyzacja' };
      case 'operator':
        return { color: 'purple', label: 'Użytkownik' };
      case 'contractor':
        return { color: 'blue', label: 'Kontrahent' };
      case 'system':
        return { color: 'gray', label: 'System' };
      default:
        return { color: 'gray', label: senderId };
    }
  };
  
  const { color, label } = getSenderBadge(message.senderId);
  
  return (
    <Box 
      maxW="80%" 
      alignSelf={isCurrentUser ? 'flex-end' : 'flex-start'}
      mb={2}
    >
      <Flex justify={isCurrentUser ? 'flex-end' : 'flex-start'} mb={0}>
        <HStack spacing={1}>
          {!isCurrentUser && (
            <Avatar size="2xs" name={message.senderName} />
          )}
          <Text fontSize="xs" fontWeight="medium">
            {message.senderName}
          </Text>
          {message.senderId === 'agent' && (
            <Badge colorScheme={color} size="sm" fontSize="2xs">
              {label}
            </Badge>
          )}
          {message.senderId !== 'agent' && message.senderId !== 'operator' && (
            <Badge colorScheme={color} size="sm" fontSize="2xs">
              {label}
            </Badge>
          )}
        </HStack>
      </Flex>
      
      <Box
        p={2}
        bg={bgColor}
        borderRadius={borderRadius}
        borderWidth="1px"
        borderColor={message.isHandover ? `${color}.300` : 'transparent'}
      >
        {message.isHandover && (
          <Flex align="center" mb={1} color={`${color}.500`}>
            <Icon as={FiInfo} mr={1} boxSize="0.8em" />
            <Text fontSize="xs" fontStyle="italic">
              Zmiana obsługującego
            </Text>
          </Flex>
        )}
        
        <Text fontSize="sm" whiteSpace="pre-wrap">{message.content}</Text>
        
        {message.attachments && message.attachments.length > 0 && (
          <VStack align="stretch" mt={1} spacing={1}>
            {message.attachments.map((attachment, index) => (
              <Box 
                key={index} 
                p={1} 
                borderWidth="1px" 
                borderRadius="md" 
                bg="white"
              >
                <Text fontSize="xs">{attachment.name}</Text>
              </Box>
            ))}
          </VStack>
        )}
      </Box>
      
      <Text fontSize="2xs" color="gray.500" textAlign={textAlign} mt={0}>
        {formatDate(message.sentAt)}
      </Text>
    </Box>
  );
};

// Główny komponent konwersacji
const OrderConversation = ({ conversation }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const messagesEndRef = useRef(null);
  
  // Stan lokalny
  const [message, setMessage] = useState('');
  
  // Pobierz dane ze store
  const conversationStatus = useSelector(selectConversationStatus);
  const conversationError = useSelector(selectConversationError);
  
  // Przewijanie do ostatniej wiadomości
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Przewiń do dołu po załadowaniu lub dodaniu nowej wiadomości
  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages]);
  
  // Obsługa błędów
  useEffect(() => {
    if (conversationError) {
      toast({
        title: 'Błąd',
        description: `Nie udało się wysłać wiadomości: ${conversationError}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [conversationError, toast]);
  
  // Obsługa zmiany wiadomości
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  
  // Obsługa wysłania wiadomości
  const handleSendMessage = () => {
    if (!message.trim() || !conversation?.id) return;
    
    dispatch(sendMessage({
      conversationId: conversation.id,
      content: message,
      attachments: []
    }));
    
    setMessage('');
  };
  
  // Obsługa klawisza Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Obsługa odświeżenia konwersacji
  const handleRefreshConversation = () => {
    if (conversation?.orderId) {
      dispatch(fetchOrder(conversation.orderId));
    }
  };
  
  // Jeśli nie ma konwersacji, pokaż informację
  if (!conversation) {
    return (
      <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
        <Flex align="center" mb={4}>
          <Icon as={FiMessageSquare} mr={2} fontSize="xl" color="teal.500" />
          <Heading as="h3" size="md">Konwersacja</Heading>
        </Flex>
        <Text>Brak konwersacji dla tego zlecenia.</Text>
      </Box>
    );
  }
  
  return (
    <Box p={2} borderWidth="1px" borderRadius="lg" bg="white">
      <Flex align="center" justify="space-between" mb={2}>
        <Flex align="center">
          <Icon as={FiMessageSquare} mr={2} fontSize="md" color="teal.500" />
          <Heading as="h3" size="sm">Konwersacja</Heading>
        </Flex>
        
        <Tooltip label="Odśwież konwersację">
          <IconButton
            icon={<FiRefreshCw />}
            onClick={handleRefreshConversation}
            aria-label="Odśwież konwersację"
            size="xs"
            isLoading={conversationStatus === 'loading'}
          />
        </Tooltip>
      </Flex>
      
      {/* Obszar wiadomości */}
      <Box
        height="300px"
        overflowY="auto"
        p={2}
        borderWidth="1px"
        borderRadius="md"
        bg="gray.50"
        mb={2}
      >
        {conversation.messages && conversation.messages.length > 0 ? (
          <VStack spacing={0} align="stretch">
            {conversation.messages.map((msg, index) => (
              <MessageItem
                key={index}
                message={msg}
                isCurrentUser={msg.senderId === 'agent'}
              />
            ))}
            <div ref={messagesEndRef} />
          </VStack>
        ) : (
          <Flex justify="center" align="center" height="100%">
            <Text color="gray.500">Brak wiadomości w konwersacji.</Text>
          </Flex>
        )}
      </Box>
      
      {/* Formularz wysyłania wiadomości */}
      <Flex align="center" mt={1}>
        <Input
          value={message}
          onChange={handleMessageChange}
          onKeyPress={handleKeyPress}
          placeholder="Wpisz wiadomość..."
          size="sm"
          mr={1}
          disabled={conversationStatus === 'loading' || conversation.status === 'completed'}
        />
        <IconButton
          icon={<FiPaperclip />}
          aria-label="Dodaj załącznik"
          size="sm"
          mr={1}
          disabled={conversationStatus === 'loading' || conversation.status === 'completed'}
        />
        <IconButton
          icon={<FiSend />}
          aria-label="Wyślij wiadomość"
          colorScheme="brand"
          size="sm"
          onClick={handleSendMessage}
          isLoading={conversationStatus === 'loading'}
          disabled={!message.trim() || conversation.status === 'completed'}
        />
      </Flex>
      
      {conversation.status === 'completed' && (
        <Text fontSize="xs" color="red.500" mt={1}>
          Konwersacja została zakończona. Nie można wysyłać nowych wiadomości.
        </Text>
      )}
    </Box>
  );
};

export default OrderConversation;
