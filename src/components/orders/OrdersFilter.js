import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  Flex,
  Stack,
  IconButton,
  useDisclosure,
  Collapse,
} from '@chakra-ui/react';
import { FiFilter, FiX, FiSearch, FiCalendar } from 'react-icons/fi';
import { setFilters, selectFilters } from '../../features/orders/ordersSlice';

const OrdersFilter = () => {
  const dispatch = useDispatch();
  const filters = useSelector(selectFilters);
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: false });
  
  // Stan lokalny dla filtrów
  const [localFilters, setLocalFilters] = React.useState({
    status: filters.status || 'all',
    search: filters.search || '',
    dateFrom: filters.dateRange?.from || '',
    dateTo: filters.dateRange?.to || '',
  });
  
  // Obsługa zmiany filtrów
  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };
  
  // Zastosowanie filtrów
  const applyFilters = () => {
    dispatch(setFilters({
      status: localFilters.status,
      search: localFilters.search,
      dateRange: {
        from: localFilters.dateFrom,
        to: localFilters.dateTo,
      },
    }));
  };
  
  // Wyczyszczenie filtrów
  const clearFilters = () => {
    setLocalFilters({
      status: 'all',
      search: '',
      dateFrom: '',
      dateTo: '',
    });
    
    dispatch(setFilters({
      status: 'all',
      search: '',
      dateRange: null,
    }));
  };
  
  return (
    <Box>
      <Flex align="center">
        <Button 
          leftIcon={<FiFilter />} 
          variant="outline" 
          onClick={onToggle}
          size="sm"
          mr={2}
        >
          Filtry
        </Button>
        
        <Input
          placeholder="Szukaj zlecenia..."
          value={localFilters.search}
          name="search"
          onChange={handleChange}
          size="sm"
          width="auto"
          mr={2}
        />
        <IconButton
          icon={<FiSearch />}
          onClick={applyFilters}
          size="sm"
          aria-label="Szukaj"
        />
      </Flex>
      
      <Collapse in={isOpen} animateOpacity>
        <Box
          p={4}
          mt={2}
          bg="white"
          rounded="md"
          shadow="sm"
          borderWidth="1px"
          position="absolute"
          zIndex="dropdown"
          width="100%"
          maxWidth="800px"
        >
          <Grid templateColumns="repeat(12, 1fr)" gap={4}>
            <GridItem colSpan={{ base: 12, md: 3 }}>
              <FormControl>
                <FormLabel fontSize="sm">Status</FormLabel>
                <Select 
                  name="status" 
                  value={localFilters.status} 
                  onChange={handleChange}
                  size="sm"
                >
                  <option value="all">Wszystkie</option>
                  <option value="new">Nowe</option>
                  <option value="negotiating">W negocjacji</option>
                  <option value="operator_assigned">Operator</option>
                  <option value="accepted">Zaakceptowane</option>
                  <option value="rejected">Odrzucone</option>
                  <option value="expired">Wygasłe</option>
                </Select>
              </FormControl>
            </GridItem>
            
            <GridItem colSpan={{ base: 12, md: 3 }}>
              <FormControl>
                <FormLabel fontSize="sm">Data od</FormLabel>
                <Input
                  type="date"
                  name="dateFrom"
                  value={localFilters.dateFrom}
                  onChange={handleChange}
                  size="sm"
                />
              </FormControl>
            </GridItem>
            
            <GridItem colSpan={{ base: 12, md: 3 }}>
              <FormControl>
                <FormLabel fontSize="sm">Data do</FormLabel>
                <Input
                  type="date"
                  name="dateTo"
                  value={localFilters.dateTo}
                  onChange={handleChange}
                  size="sm"
                />
              </FormControl>
            </GridItem>
            
            <GridItem colSpan={{ base: 12, md: 3 }}>
              <Stack direction="row" spacing={2} mt={7}>
                <Button 
                  colorScheme="brand" 
                  onClick={applyFilters}
                  size="sm"
                  leftIcon={<FiFilter />}
                >
                  Zastosuj
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  size="sm"
                  leftIcon={<FiX />}
                >
                  Wyczyść
                </Button>
              </Stack>
            </GridItem>
          </Grid>
        </Box>
      </Collapse>
    </Box>
  );
};

export default OrdersFilter;
