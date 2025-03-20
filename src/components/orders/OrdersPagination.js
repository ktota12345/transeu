import React from 'react';
import {
  Flex,
  Button,
  IconButton,
  Text,
  Select,
  HStack,
  Box,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

const OrdersPagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  limit, 
  onLimitChange,
  total
}) => {
  // Generowanie opcji stron do wyświetlenia
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Jeśli jest mniej stron niż maksymalna liczba do wyświetlenia, pokaż wszystkie
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Zawsze pokazuj pierwszą stronę
      pages.push(1);
      
      // Oblicz zakres stron do wyświetlenia wokół aktualnej strony
      let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      // Dostosuj zakres, jeśli jesteśmy blisko początku lub końca
      if (endPage - startPage < maxVisiblePages - 3) {
        startPage = Math.max(2, endPage - (maxVisiblePages - 3));
      }
      
      // Dodaj wielokropek po pierwszej stronie, jeśli potrzeba
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Dodaj strony z zakresu
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Dodaj wielokropek przed ostatnią stroną, jeśli potrzeba
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Zawsze pokazuj ostatnią stronę
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  // Obsługa zmiany ilości elementów na stronie
  const handleLimitChange = (e) => {
    onLimitChange(Number(e.target.value));
  };
  
  // Jeśli nie ma stron, nie pokazuj paginacji
  if (totalPages <= 0) {
    return null;
  }
  
  return (
    <Flex 
      justifyContent="space-between" 
      alignItems="center" 
      mt={6} 
      flexWrap="wrap"
      gap={2}
    >
      <HStack spacing={2}>
        <Text fontSize="sm">Elementy na stronie:</Text>
        <Select 
          value={limit} 
          onChange={handleLimitChange} 
          size="sm" 
          width="70px"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </Select>
      </HStack>
      
      <HStack spacing={2}>
        <IconButton
          icon={<FiChevronsLeft />}
          onClick={() => onPageChange(1)}
          isDisabled={currentPage === 1}
          aria-label="First page"
          size="sm"
        />
        <IconButton
          icon={<FiChevronLeft />}
          onClick={() => onPageChange(currentPage - 1)}
          isDisabled={currentPage === 1}
          aria-label="Previous page"
          size="sm"
        />
        
        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <Text key={`ellipsis-${index}`} mx={1}>...</Text>
          ) : (
            <Button
              key={page}
              size="sm"
              variant={currentPage === page ? 'solid' : 'outline'}
              colorScheme={currentPage === page ? 'brand' : 'gray'}
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        ))}
        
        <IconButton
          icon={<FiChevronRight />}
          onClick={() => onPageChange(currentPage + 1)}
          isDisabled={currentPage === totalPages}
          aria-label="Next page"
          size="sm"
        />
        <IconButton
          icon={<FiChevronsRight />}
          onClick={() => onPageChange(totalPages)}
          isDisabled={currentPage === totalPages}
          aria-label="Last page"
          size="sm"
        />
      </HStack>
      
      <Box>
        <Text fontSize="sm">
          Pokazuje {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, total)} z {total} elementów
        </Text>
      </Box>
    </Flex>
  );
};

export default OrdersPagination;
