import React from 'react';
import {
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { 
  FiDownload, 
  FiGrid, 
  FiList, 
  FiRefreshCw, 
  FiArrowUp, 
  FiArrowDown,
  FiFilter
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { fetchOrders } from '../../features/orders/ordersSlice';

const OrdersToolbar = ({ 
  onExport, 
  onGroupingChange, 
  grouping, 
  sorting, 
  onSortingChange 
}) => {
  const dispatch = useDispatch();
  
  // Obsługa odświeżania danych
  const handleRefresh = () => {
    dispatch(fetchOrders());
  };
  
  return (
    <Flex align="center" gap={2}>
      <Tooltip label="Odśwież dane">
        <IconButton
          icon={<FiRefreshCw />}
          onClick={handleRefresh}
          aria-label="Odśwież dane"
          size="sm"
        />
      </Tooltip>
      
      <Menu>
        <Tooltip label="Sortowanie">
          <MenuButton
            as={IconButton}
            icon={sorting.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />}
            aria-label="Sortowanie"
            size="sm"
          />
        </Tooltip>
        <MenuList>
          <MenuItem onClick={() => onSortingChange('createdAt')}>
            Data utworzenia {sorting.field === 'createdAt' && (sorting.direction === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => onSortingChange('clientName')}>
            Kontrahent {sorting.field === 'clientName' && (sorting.direction === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => onSortingChange('status')}>
            Status {sorting.field === 'status' && (sorting.direction === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => onSortingChange('assignedAgent')}>
            Agent {sorting.field === 'assignedAgent' && (sorting.direction === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => onSortingChange('pickup.date')}>
            Data załadunku {sorting.field === 'pickup.date' && (sorting.direction === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => onSortingChange('delivery.date')}>
            Data rozładunku {sorting.field === 'delivery.date' && (sorting.direction === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => onSortingChange('financials.value')}>
            Wartość {sorting.field === 'financials.value' && (sorting.direction === 'asc' ? '↑' : '↓')}
          </MenuItem>
          <MenuItem onClick={() => onSortingChange('profitabilityScore')}>
            Opłacalność {sorting.field === 'profitabilityScore' && (sorting.direction === 'asc' ? '↑' : '↓')}
          </MenuItem>
        </MenuList>
      </Menu>
      
      <Menu>
        <Tooltip label="Grupowanie">
          <MenuButton
            as={IconButton}
            icon={<FiGrid />}
            aria-label="Grupowanie"
            size="sm"
          />
        </Tooltip>
        <MenuList>
          <MenuItem onClick={() => onGroupingChange(null)}>
            Brak grupowania {grouping === null && '✓'}
          </MenuItem>
          <MenuItem onClick={() => onGroupingChange('status')}>
            Według statusu {grouping === 'status' && '✓'}
          </MenuItem>
          <MenuItem onClick={() => onGroupingChange('clientName')}>
            Według kontrahenta {grouping === 'clientName' && '✓'}
          </MenuItem>
          <MenuItem onClick={() => onGroupingChange('assignedAgent')}>
            Według agenta {grouping === 'assignedAgent' && '✓'}
          </MenuItem>
          <MenuItem onClick={() => onGroupingChange('date')}>
            Według daty {grouping === 'date' && '✓'}
          </MenuItem>
        </MenuList>
      </Menu>
      
      <Tooltip label="Eksportuj dane">
        <Button
          leftIcon={<FiDownload />}
          onClick={onExport}
          size="sm"
          variant="outline"
        >
          Eksportuj
        </Button>
      </Tooltip>
    </Flex>
  );
};

export default OrdersToolbar;
