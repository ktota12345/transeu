import React from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    const bg = useColorModeValue('gray.50', 'gray.900');

    return (
        <Box minH="100vh" bg={bg}>
            <Sidebar />
            <Header />
            <Box ml={{ base: 0, md: 60 }} pt="16">
                {children}
            </Box>
        </Box>
    );
};

export default Layout;
