import React from 'react';
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Flex,
  Icon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { 
  FiPackage, 
  FiTruck, 
  FiMapPin, 
  FiInfo,
  FiFileText
} from 'react-icons/fi';

const OrderDetails = ({ order }) => {
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
  
  return (
    <Box>
      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* Informacje o ładunku */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" h="100%">
            <Flex align="center" mb={4}>
              <Icon as={FiPackage} mr={2} fontSize="xl" color="orange.500" />
              <Heading as="h3" size="md">Informacje o ładunku</Heading>
            </Flex>
            
            <TableContainer>
              <Table variant="simple" size="sm">
                <Tbody>
                  <Tr>
                    <Th>Typ ładunku</Th>
                    <Td>{order.cargo?.type || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Waga</Th>
                    <Td>{order.cargo?.weight ? `${order.cargo.weight} kg` : '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Wymiary</Th>
                    <Td>
                      {order.cargo?.dimensions ? 
                        `${order.cargo.dimensions.length}m × ${order.cargo.dimensions.width}m × ${order.cargo.dimensions.height}m` 
                        : '-'}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>Objętość</Th>
                    <Td>{order.cargo?.volume ? `${order.cargo.volume} m³` : '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>ADR</Th>
                    <Td>
                      {order.cargo?.adr ? (
                        <Badge colorScheme="red">Tak - {order.cargo.adr}</Badge>
                      ) : 'Nie'}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>Dodatkowe informacje</Th>
                    <Td>{order.cargo?.notes || '-'}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </GridItem>
        
        {/* Wymagania pojazdu */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" h="100%">
            <Flex align="center" mb={4}>
              <Icon as={FiTruck} mr={2} fontSize="xl" color="purple.500" />
              <Heading as="h3" size="md">Wymagania pojazdu</Heading>
            </Flex>
            
            <TableContainer>
              <Table variant="simple" size="sm">
                <Tbody>
                  <Tr>
                    <Th>Typ pojazdu</Th>
                    <Td>{order.vehicle?.type || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Ładowność</Th>
                    <Td>{order.vehicle?.capacity ? `${order.vehicle.capacity} kg` : '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Wymagane wyposażenie</Th>
                    <Td>
                      {order.vehicle?.equipment && order.vehicle.equipment.length > 0 ? (
                        order.vehicle.equipment.map((item, index) => (
                          <Badge key={index} mr={1} mb={1}>{item}</Badge>
                        ))
                      ) : '-'}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>Certyfikaty</Th>
                    <Td>
                      {order.vehicle?.certificates && order.vehicle.certificates.length > 0 ? (
                        order.vehicle.certificates.map((cert, index) => (
                          <Badge key={index} colorScheme="green" mr={1} mb={1}>{cert}</Badge>
                        ))
                      ) : '-'}
                    </Td>
                  </Tr>
                  <Tr>
                    <Th>Dodatkowe wymagania</Th>
                    <Td>{order.vehicle?.requirements || '-'}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </GridItem>
        
        {/* Miejsce załadunku */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Flex align="center" mb={4}>
              <Icon as={FiMapPin} mr={2} fontSize="xl" color="blue.500" />
              <Heading as="h3" size="md">Miejsce załadunku</Heading>
            </Flex>
            
            <TableContainer>
              <Table variant="simple" size="sm">
                <Tbody>
                  <Tr>
                    <Th>Adres</Th>
                    <Td>{order.pickup?.location?.address || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Miasto</Th>
                    <Td>{order.pickup?.location?.city || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Kraj</Th>
                    <Td>{order.pickup?.location?.country || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Kod pocztowy</Th>
                    <Td>{order.pickup?.location?.postalCode || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Data i godzina</Th>
                    <Td>{formatDate(order.pickup?.date)}</Td>
                  </Tr>
                  <Tr>
                    <Th>Osoba kontaktowa</Th>
                    <Td>{order.pickup?.contact?.name || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Telefon</Th>
                    <Td>{order.pickup?.contact?.phone || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Email</Th>
                    <Td>{order.pickup?.contact?.email || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Uwagi</Th>
                    <Td>{order.pickup?.notes || '-'}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </GridItem>
        
        {/* Miejsce rozładunku */}
        <GridItem colSpan={{ base: 12, md: 6 }}>
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Flex align="center" mb={4}>
              <Icon as={FiMapPin} mr={2} fontSize="xl" color="green.500" />
              <Heading as="h3" size="md">Miejsce rozładunku</Heading>
            </Flex>
            
            <TableContainer>
              <Table variant="simple" size="sm">
                <Tbody>
                  <Tr>
                    <Th>Adres</Th>
                    <Td>{order.delivery?.location?.address || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Miasto</Th>
                    <Td>{order.delivery?.location?.city || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Kraj</Th>
                    <Td>{order.delivery?.location?.country || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Kod pocztowy</Th>
                    <Td>{order.delivery?.location?.postalCode || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Data i godzina</Th>
                    <Td>{formatDate(order.delivery?.date)}</Td>
                  </Tr>
                  <Tr>
                    <Th>Osoba kontaktowa</Th>
                    <Td>{order.delivery?.contact?.name || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Telefon</Th>
                    <Td>{order.delivery?.contact?.phone || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Email</Th>
                    <Td>{order.delivery?.contact?.email || '-'}</Td>
                  </Tr>
                  <Tr>
                    <Th>Uwagi</Th>
                    <Td>{order.delivery?.notes || '-'}</Td>
                  </Tr>
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </GridItem>
        
        {/* Dodatkowe informacje */}
        <GridItem colSpan={12}>
          <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
            <Flex align="center" mb={4}>
              <Icon as={FiInfo} mr={2} fontSize="xl" color="cyan.500" />
              <Heading as="h3" size="md">Dodatkowe informacje</Heading>
            </Flex>
            
            <Text whiteSpace="pre-wrap">{order.additionalInfo || 'Brak dodatkowych informacji.'}</Text>
          </Box>
        </GridItem>
        
        {/* Dokumenty */}
        {order.documents && order.documents.length > 0 && (
          <GridItem colSpan={12}>
            <Box p={4} borderWidth="1px" borderRadius="lg" bg="white">
              <Flex align="center" mb={4}>
                <Icon as={FiFileText} mr={2} fontSize="xl" color="teal.500" />
                <Heading as="h3" size="md">Dokumenty</Heading>
              </Flex>
              
              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Nazwa</Th>
                      <Th>Typ</Th>
                      <Th>Data dodania</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {order.documents.map((doc, index) => (
                      <Tr key={index}>
                        <Td>{doc.name}</Td>
                        <Td>{doc.type}</Td>
                        <Td>{formatDate(doc.addedAt)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </GridItem>
        )}
      </Grid>
    </Box>
  );
};

export default OrderDetails;
