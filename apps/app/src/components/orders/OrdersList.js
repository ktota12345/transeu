import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Heading,
  useToast,
  Flex,
  Spinner,
  Text,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiEye, FiMoreVertical, FiCheck, FiX, FiUser } from 'react-icons/fi';
import { fetchOrders, selectOrders, selectOrdersStatus, selectOrdersError, selectFilters, selectPagination, setPagination } from '../../features/orders/ordersSlice';
import OrdersFilter from './OrdersFilter';
import OrdersPagination from './OrdersPagination';
import OrdersToolbar from './OrdersToolbar';

// Komponent dla statusu zlecenia
const OrderStatusBadge = ({ status }) => {
  let colorScheme = 'gray';
  let label = 'Nieznany';

  switch (status) {
    case 'new':
      colorScheme = 'blue';
      label = 'Nowe';
      break;
    case 'negotiating':
      colorScheme = 'orange';
      label = 'W negocjacji';
      break;
    case 'operator_assigned':
      colorScheme = 'purple';
      label = 'Operator';
      break;
    case 'accepted':
      colorScheme = 'green';
      label = 'Zaakceptowane';
      break;
    case 'rejected':
      colorScheme = 'red';
      label = 'Odrzucone';
      break;
    case 'expired':
      colorScheme = 'gray';
      label = 'Wygasłe';
      break;
    default:
      break;
  }

  return (
    <Badge colorScheme={colorScheme} borderRadius="full" px={2} py={1}>
      {label}
    </Badge>
  );
};

const OrdersList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  // Pobierz dane ze store
  const orders = useSelector(selectOrders);
  const status = useSelector(selectOrdersStatus);
  const error = useSelector(selectOrdersError);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  
  // Stan lokalny dla grupowania
  const [grouping, setGrouping] = useState(null);
  const [sorting, setSorting] = useState({ field: 'createdAt', direction: 'desc' });
  
  // Pobierz dane przy pierwszym renderowaniu i zmianie filtrów/paginacji
  useEffect(() => {
    console.log(`useEffect - Sortowanie: pole=${sorting.field}, kierunek=${sorting.direction}`);
    dispatch(fetchOrders({ ...filters, ...pagination, sortBy: sorting.field, sortDirection: sorting.direction }));
  }, [dispatch, filters, pagination, sorting]);
  
  // Obsługa błędów
  useEffect(() => {
    if (error) {
      toast({
        title: 'Błąd',
        description: `Nie udało się pobrać listy zleceń: ${error}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);
  
  // Obsługa zmiany strony
  const handlePageChange = (page) => {
    dispatch(setPagination({ page }));
  };
  
  // Obsługa zmiany ilości elementów na stronie
  const handleLimitChange = (limit) => {
    dispatch(setPagination({ limit, page: 1 }));
  };
  
  // Obsługa kliknięcia w zlecenie
  const handleOrderClick = (orderId) => {
    navigate(`/order/${orderId}`);
  };
  
  // Obsługa sortowania
  const handleSortChange = (field) => {
    // Sprawdź, czy kliknięto tę samą kolumnę
    if (sorting.field === field) {
      // Jeśli tak, zmień kierunek sortowania
      const newDirection = sorting.direction === 'asc' ? 'desc' : 'asc';
      console.log(`Sortowanie (ta sama kolumna): pole=${field}, kierunek=${newDirection}`);
      setSorting({
        field,
        direction: newDirection
      });
    } else {
      // Jeśli kliknięto inną kolumnę, ustaw domyślny kierunek sortowania
      console.log(`Sortowanie (nowa kolumna): pole=${field}, kierunek=asc`);
      setSorting({
        field,
        direction: 'asc'
      });
    }
  };
  
  // Formatowanie daty
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Renderowanie ładowania
  if (status === 'loading' && !orders.length) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }
  
  return (
    <Box p={4}>
      <Heading as="h1" size="lg" mb={6}>Lista zleceń</Heading>
      
      <Flex justify="space-between" align="center" mb={4}>
        <Flex flex="1">
          <OrdersFilter />
        </Flex>
        
        <Flex gap={2} ml={4}>
          <OrdersToolbar 
            onExport={() => console.log('Export')}
            onGroupingChange={setGrouping}
            grouping={grouping}
            sorting={sorting}
            onSortingChange={handleSortChange}
          />
        </Flex>
      </Flex>
      
      {status === 'loading' && (
        <Flex justify="center" my={4}>
          <Spinner size="md" color="brand.500" />
        </Flex>
      )}
      
      {orders.length === 0 ? (
        <Box textAlign="center" py={10} px={6}>
          <Text fontSize="xl">Brak zleceń spełniających kryteria</Text>
          <Button mt={4} colorScheme="brand" onClick={() => dispatch(fetchOrders({}))}>
            Wyczyść filtry
          </Button>
        </Box>
      ) : (
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th cursor="pointer" onClick={() => handleSortChange('id')}>
                  ID {sorting.field === 'id' && (sorting.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSortChange('clientName')}>
                  Kontrahent {sorting.field === 'clientName' && (sorting.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th>Status</Th>
                <Th cursor="pointer" onClick={() => handleSortChange('assignedAgentId')}>
                  Agent automatyzacji {sorting.field === 'assignedAgentId' && (sorting.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSortChange('pickup.date')}>
                  Data załadunku {sorting.field === 'pickup.date' && (sorting.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSortChange('delivery.date')}>
                  Data rozładunku {sorting.field === 'delivery.date' && (sorting.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSortChange('financials.value')}>
                  Wartość {sorting.field === 'financials.value' && (sorting.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSortChange('profitabilityScore')}>
                  Opłacalność {sorting.field === 'profitabilityScore' && (sorting.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSortChange('createdAt')}>
                  Data utworzenia {sorting.field === 'createdAt' && (sorting.direction === 'asc' ? '↑' : '↓')}
                </Th>
                <Th>Akcje</Th>
              </Tr>
            </Thead>
            <Tbody>
              {orders.map((order) => (
                <Tr 
                  key={order.id} 
                  _hover={{ bg: 'gray.50' }}
                  cursor="pointer"
                  onClick={() => handleOrderClick(order.id)}
                >
                  <Td>{order.id}</Td>
                  <Td>{order.clientName}</Td>
                  <Td><OrderStatusBadge status={order.status} /></Td>
                  <Td>
                    {order.assignedAgentName ? (
                      <Text>
                        {order.assignedAgentName}
                        {order.assignedAgentType === 'automation' && (
                          <Badge ml={2} colorScheme="purple" fontSize="xs">
                            Auto
                          </Badge>
                        )}
                      </Text>
                    ) : (
                      <Text color="gray.500">Nieprzypisany</Text>
                    )}
                  </Td>
                  <Td>{order.pickup?.date ? formatDate(order.pickup.date) : '-'}</Td>
                  <Td>{order.delivery?.date ? formatDate(order.delivery.date) : '-'}</Td>
                  <Td>{order.financials?.value ? `${order.financials.value} ${order.financials.currency}` : '-'}</Td>
                  <Td>{order.profitabilityScore ? `${order.profitabilityScore}%` : '-'}</Td>
                  <Td>{formatDate(order.createdAt)}</Td>
                  <Td onClick={(e) => e.stopPropagation()}>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<FiMoreVertical />}
                        variant="ghost"
                        size="sm"
                      />
                      <MenuList>
                        <MenuItem icon={<FiEye />} onClick={() => handleOrderClick(order.id)}>
                          Szczegóły
                        </MenuItem>
                        {order.status === 'new' && (
                          <>
                            <MenuItem icon={<FiCheck />} onClick={() => navigate(`/order/${order.id}/accept`)}>
                              Akceptuj
                            </MenuItem>
                            <MenuItem icon={<FiX />} onClick={() => navigate(`/order/${order.id}/reject`)}>
                              Odrzuć
                            </MenuItem>
                          </>
                        )}
                        {['new', 'negotiating'].includes(order.status) && (
                          <MenuItem icon={<FiUser />} onClick={() => navigate(`/order/${order.id}/transfer`)}>
                            Przekaż operatorowi
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
      
      <OrdersPagination 
        currentPage={pagination.page}
        totalPages={Math.ceil(pagination.total / pagination.limit)}
        onPageChange={handlePageChange}
        limit={pagination.limit}
        onLimitChange={handleLimitChange}
        total={pagination.total}
      />
    </Box>
  );
};

export default OrdersList;
