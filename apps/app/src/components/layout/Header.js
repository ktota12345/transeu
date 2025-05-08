import React from 'react';
import {
    Box,
    Flex,
    IconButton,
    Avatar,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    InputGroup,
    InputLeftElement,
    Input,
    useColorModeValue,
    Badge,
    Text
} from '@chakra-ui/react';
import { FiBell, FiSearch, FiHelpCircle, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const Header = () => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Flex
            as="header"
            position="fixed"
            w="100%"
            h="16"
            px={4}
            zIndex="1"
            alignItems="center"
            bg={bg}
            borderBottomWidth="1px"
            borderBottomColor={borderColor}
            justifyContent="space-between"
            boxShadow="sm"
        >
            <Flex alignItems="center" ml={{ base: 0, md: 60 }}>
                <InputGroup w={{ base: '100%', md: '400px' }} mr={4} display={{ base: 'none', md: 'block' }}>
                    <InputLeftElement pointerEvents="none">
                        <FiSearch color="gray.300" />
                    </InputLeftElement>
                    <Input 
                        type="text" 
                        placeholder="Szukaj..." 
                        borderRadius="full"
                        bg={useColorModeValue('gray.50', 'gray.700')}
                    />
                </InputGroup>
            </Flex>

            <Flex alignItems="center">
                <IconButton
                    aria-label="Pomoc"
                    variant="ghost"
                    icon={<FiHelpCircle />}
                    size="md"
                    mr={2}
                    color="gray.500"
                    _hover={{ color: 'brand.500' }}
                />
                <Menu>
                    <MenuButton
                        as={IconButton}
                        aria-label="Powiadomienia"
                        variant="ghost"
                        icon={
                            <Box position="relative">
                                <FiBell />
                                <Badge
                                    position="absolute"
                                    top="-6px"
                                    right="-6px"
                                    colorScheme="red"
                                    borderRadius="full"
                                    size="xs"
                                >
                                    3
                                </Badge>
                            </Box>
                        }
                        size="md"
                        mr={4}
                        color="gray.500"
                        _hover={{ color: 'brand.500' }}
                    />
                    <MenuList zIndex={2}>
                        <Box px={4} py={2}>
                            <Text fontWeight="bold">Powiadomienia</Text>
                        </Box>
                        <MenuDivider />
                        {[1, 2, 3].map((item) => (
                            <MenuItem key={item}>
                                <Box>
                                    <Text fontWeight="medium">Nowe zlecenie #{item}001</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        {item} {item === 1 ? 'godzinę' : 'godziny'} temu
                                    </Text>
                                </Box>
                            </MenuItem>
                        ))}
                        <MenuDivider />
                        <MenuItem fontWeight="medium" color="brand.500">
                            Zobacz wszystkie
                        </MenuItem>
                    </MenuList>
                </Menu>

                <Menu>
                    <MenuButton>
                        <Avatar
                            size="sm"
                            name="Jan Kowalski"
                            src="https://bit.ly/dan-abramov"
                            cursor="pointer"
                        />
                    </MenuButton>
                    <MenuList zIndex={2}>
                        <Box px={4} py={2}>
                            <Text fontWeight="bold">Jan Kowalski</Text>
                            <Text fontSize="sm" color="gray.500">jan.kowalski@transeu.com</Text>
                        </Box>
                        <MenuDivider />
                        <MenuItem icon={<FiUser />}>Profil</MenuItem>
                        <MenuItem icon={<FiSettings />}>Ustawienia</MenuItem>
                        <MenuDivider />
                        <MenuItem icon={<FiLogOut />}>Wyloguj</MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
        </Flex>
    );
};

export default Header;
