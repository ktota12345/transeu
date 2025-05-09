import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Input, VStack, FormControl, FormLabel, useToast } from '@chakra-ui/react';

type LoginData = {
    email: string;
    password: string;
};

export const LoginForm: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
    const toast = useToast();

    const onSubmit = async (data: LoginData) => {
        try {
            const response = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Błędne dane logowania');

            const result = await response.json();
            localStorage.setItem('token', result.access_token);
            toast({ title: 'Zalogowano pomyślnie', status: 'success' });
            onLoginSuccess();
        } catch (err: any) {
            toast({ title: err.message, status: 'error' });
        }
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight="100vh"
            bg="gray.100"
        >
            <Box
                p={6}
                maxWidth="400px"
                width="100%"
                bg="white"
                boxShadow="lg"
                borderRadius="md"
                border="1px solid #e2e8f0"
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <VStack spacing={4}>
                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel>Email</FormLabel>
                            <Input
                                {...register('email', { required: 'Wymagany email' })}
                                autoFocus // Ustawienie focus na pierwsze pole
                            />
                        </FormControl>
                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel>Hasło</FormLabel>
                            <Input
                                type="password"
                                {...register('password', { required: 'Wymagane hasło' })}
                            />
                        </FormControl>
                        <Button type="submit" colorScheme="blue">
                            Zaloguj się
                        </Button>
                    </VStack>
                </form>
            </Box>
        </Box>
    );
};
