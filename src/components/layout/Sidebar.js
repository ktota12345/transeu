import React from 'react';
import { Box, VStack, Icon, Text, Flex, Divider, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { FiHome, FiUsers, FiTruck, FiSettings, FiBarChart2, FiCalendar, FiSearch } from 'react-icons/fi';

const NavItem = ({ icon, children, to, ...rest }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    const activeBg = useColorModeValue('brand.50', 'brand.900');
    const activeColor = useColorModeValue('brand.600', 'brand.200');
    const inactiveColor = useColorModeValue('gray.600', 'gray.400');

    return (
        <Flex
            as={RouterLink}
            to={to}
            align="center"
            p="4"
            mx="4"
            borderRadius="lg"
            role="group"
            cursor="pointer"
            bg={isActive ? activeBg : 'transparent'}
            color={isActive ? activeColor : inactiveColor}
            fontWeight={isActive ? 'semibold' : 'normal'}
            _hover={{
                bg: activeBg,
                color: activeColor,
            }}
            {...rest}
        >
            {icon && (
                <Icon
                    mr="4"
                    fontSize="16"
                    as={icon}
                />
            )}
            {children}
        </Flex>
    );
};

const Sidebar = () => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Box
            w={{ base: 'full', md: 60 }}
            pos="fixed"
            h="full"
            bg={bg}
            borderRight="1px"
            borderRightColor={borderColor}
            boxShadow="sm"
        >
            <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
                <Text fontSize="2xl" fontWeight="bold" color="brand.500">
                    TransEU Agent
                </Text>
            </Flex>
            <VStack spacing={1} align="stretch">
                <NavItem icon={FiHome} to="/">
                    Dashboard
                </NavItem>
                <NavItem icon={FiSearch} to="/quick-search">
                    Szybkie wyszukiwanie
                </NavItem>
                <NavItem icon={FiUsers} to="/agents">
                    Agenci
                </NavItem>
                <NavItem icon={FiTruck} to="/orders">
                    Zlecenia
                </NavItem>
                <NavItem icon={FiCalendar} to="/schedule">
                    Harmonogram
                </NavItem>
                <NavItem icon={FiBarChart2} to="/reports">
                    Raporty
                </NavItem>
                <Divider my={2} />
                <NavItem icon={FiSettings} to="/settings">
                    Ustawienia
                </NavItem>
            </VStack>
        </Box>
    );
};

export default Sidebar;
