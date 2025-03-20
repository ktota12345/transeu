import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Spinner,
  Select,
} from '@chakra-ui/react';
import { 
  FiArrowLeft, 
  FiCheck, 
  FiX, 
  FiMessageSquare, 
  FiUser, 
  FiDollarSign, 
  FiClock,
  FiFileText,
} from 'react-icons/fi';
import { 
  fetchOrder, 
  acceptOrder, 
  rejectOrder, 
  transferToAgent,
  selectOrderById, 
  selectOrderStatus, 
  selectOrderError 
} from '../../features/orders/ordersSlice';
import { fetchAgents } from '../../features/agents/agentsSlice';
import OrderHeader from './OrderHeader';
import OrderDetails from './OrderDetails';
import OrderFinancials from './OrderFinancials';
import OrderConversation from './OrderConversation';
import OrderTimeline from './OrderTimeline';
import OrderProfitability from './OrderProfitability';

const OrderCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  
  // Pobierz dane ze store
  const order = useSelector((state) => selectOrderById(state, id));
  const status = useSelector(selectOrderStatus);
  const error = useSelector(selectOrderError);
  const agents = useSelector((state) => state.agents.agents);
  
  // Stan lokalny
  const [rejectReason, setRejectReason] = useState('');
  const [transferAgent, setTransferAgent] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  
  // Modalne okna
  const { 
    isOpen: isRejectModalOpen, 
    onOpen: onRejectModalOpen, 
    onClose: onRejectModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isTransferModalOpen, 
    onOpen: onTransferModalOpen, 
    onClose: onTransferModalClose 
  } = useDisclosure();
  
  // Pobierz dane zlecenia przy pierwszym renderowaniu
  useEffect(() => {
    if (id) {
      dispatch(fetchOrder(id));
    }
  }, [dispatch, id]);

  // Pobierz listę agentów automatyzacji
  useEffect(() => {
    dispatch(fetchAgents());
  }, [dispatch]);
  
  // Obsługa błędów
  useEffect(() => {
    if (error) {
      toast({
        title: 'Błąd',
        description: error,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);
  
  // Obsługa zmiany zakładki
  const handleTabsChange = (index) => {
    setTabIndex(index);
  };
  
  // Obsługa powrotu do listy zleceń
  const handleBackToList = () => {
    navigate('/orders');
  };
  
  // Obsługa akceptacji zlecenia
  const handleAcceptOrder = () => {
    dispatch(acceptOrder(id))
      .unwrap()
      .then(() => {
        toast({
          title: 'Sukces',
          description: 'Zlecenie zostało zaakceptowane',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((err) => {
        toast({
          title: 'Błąd',
          description: `Nie udało się zaakceptować zlecenia: ${err.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };
  
  // Obsługa odrzucenia zlecenia
  const handleRejectOrder = () => {
    if (!rejectReason.trim()) {
      toast({
        title: 'Uwaga',
        description: 'Proszę podać powód odrzucenia zlecenia',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    dispatch(rejectOrder({ id, reason: rejectReason }))
      .unwrap()
      .then(() => {
        toast({
          title: 'Sukces',
          description: 'Zlecenie zostało odrzucone',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onRejectModalClose();
      })
      .catch((err) => {
        toast({
          title: 'Błąd',
          description: `Nie udało się odrzucić zlecenia: ${err.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };
  
  // Obsługa przekazania zlecenia
  const handleTransferOrder = () => {
    if (!transferAgent.trim()) {
      toast({
        title: 'Uwaga',
        description: 'Proszę wybrać agenta automatyzacji do przekazania zlecenia',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    dispatch(transferToAgent({ orderId: id, agentId: transferAgent }))
      .unwrap()
      .then(() => {
        toast({
          title: 'Sukces',
          description: 'Zlecenie zostało przekazane do agenta automatyzacji',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onTransferModalClose();
      })
      .catch((err) => {
        toast({
          title: 'Błąd',
          description: `Nie udało się przekazać zlecenia: ${err.message}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      });
  };
  
  // Jeśli dane są ładowane, pokaż spinner
  if (status === 'loading') {
    return (
      <Flex justify="center" align="center" height="80vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }
  
  // Jeśli nie znaleziono zlecenia, pokaż komunikat
  if (!order) {
    return (
      <Box p={5}>
        <Button leftIcon={<FiArrowLeft />} onClick={handleBackToList} mb={3} size="sm">
          Powrót do listy zleceń
        </Button>
        <Flex direction="column" align="center" justify="center" height="60vh">
          <Heading size="lg" mb={4}>Nie znaleziono zlecenia</Heading>
          <Text>Zlecenie o podanym ID nie istnieje lub zostało usunięte.</Text>
        </Flex>
      </Box>
    );
  }
  
  return (
    <Box p={3}>
      {/* Przycisk powrotu i nagłówek */}
      <Button leftIcon={<FiArrowLeft />} onClick={handleBackToList} mb={2} size="sm" variant="outline">
        Powrót do listy zleceń
      </Button>
      
      {/* Nagłówek zlecenia */}
      <OrderHeader order={order} />
      
      {/* Przyciski akcji */}
      <Flex mt={2} mb={2} gap={2} wrap="wrap">
        {order.status === 'new' && (
          <>
            <Button 
              leftIcon={<FiCheck />} 
              colorScheme="green" 
              onClick={handleAcceptOrder}
              isLoading={status === 'loading'}
              size="sm"
            >
              Akceptuj zlecenie
            </Button>
            <Button 
              leftIcon={<FiX />} 
              colorScheme="red" 
              onClick={onRejectModalOpen}
              isLoading={status === 'loading'}
              size="sm"
            >
              Odrzuć zlecenie
            </Button>
          </>
        )}
      </Flex>
      
      {/* Zakładki ze szczegółami zlecenia */}
      <Tabs 
        isLazy 
        colorScheme="brand" 
        index={tabIndex} 
        onChange={handleTabsChange}
        size="sm"
        variant="enclosed"
      >
        <TabList>
          <Tab>
            <Flex align="center">
              <FiFileText style={{ marginRight: '4px' }} />
              <Text fontSize="sm">Szczegóły</Text>
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <FiDollarSign style={{ marginRight: '4px' }} />
              <Text fontSize="sm">Finanse</Text>
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <FiMessageSquare style={{ marginRight: '4px' }} />
              <Text fontSize="sm">Konwersacja</Text>
            </Flex>
          </Tab>
          <Tab>
            <Flex align="center">
              <FiClock style={{ marginRight: '4px' }} />
              <Text fontSize="sm">Historia</Text>
            </Flex>
          </Tab>
        </TabList>
        
        <TabPanels>
          {/* Zakładka ze szczegółami */}
          <TabPanel p={2}>
            <OrderDetails order={order} />
          </TabPanel>
          
          {/* Zakładka z finansami */}
          <TabPanel p={2}>
            <Flex direction={{ base: 'column', lg: 'row' }} gap={3}>
              <Box flex="2">
                <OrderFinancials data={order.financials} />
              </Box>
              <Box flex="1">
                <OrderProfitability score={order.profitabilityScore} />
              </Box>
            </Flex>
          </TabPanel>
          
          {/* Zakładka z konwersacją */}
          <TabPanel p={2}>
            <OrderConversation conversation={order.conversation} />
          </TabPanel>
          
          {/* Zakładka z historią */}
          <TabPanel p={2}>
            <OrderTimeline events={order.timeline} currentStatus={order.status} />
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Modal odrzucenia zlecenia */}
      <Modal isOpen={isRejectModalOpen} onClose={onRejectModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Odrzuć zlecenie</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Powód odrzucenia</FormLabel>
              <Textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Podaj powód odrzucenia zlecenia..."
                rows={4}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onRejectModalClose}>
              Anuluj
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleRejectOrder}
              isLoading={status === 'loading'}
            >
              Odrzuć zlecenie
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Modal przekazania zlecenia */}
      <Modal isOpen={isTransferModalOpen} onClose={onTransferModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Przekaż zlecenie do agenta automatyzacji</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired>
              <FormLabel>Wybierz agenta automatyzacji</FormLabel>
              <Select 
                value={transferAgent}
                onChange={(e) => setTransferAgent(e.target.value)}
                placeholder="Wybierz agenta automatyzacji..."
              >
                {agents && agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name} {agent.isActive ? '(Aktywny)' : '(Nieaktywny)'}
                  </option>
                ))}
              </Select>
              {agents && agents.length === 0 && (
                <Text mt={2} color="orange.500">
                  Brak zdefiniowanych agentów automatyzacji. Dodaj agentów w zakładce "Agenci".
                </Text>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTransferModalClose}>
              Anuluj
            </Button>
            <Button 
              colorScheme="purple" 
              onClick={handleTransferOrder}
              isLoading={status === 'loading'}
              isDisabled={agents && agents.length === 0}
            >
              Przekaż zlecenie
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default OrderCard;
