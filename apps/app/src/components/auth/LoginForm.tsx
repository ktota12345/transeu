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
            localStorage.setItem('token', result.token); // zakładamy, że API zwraca { token: "..." }
            toast({ title: 'Zalogowano pomyślnie', status: 'success' });
            onLoginSuccess();
        } catch (err: any) {
            toast({ title: err.message, status: 'error' });
        }
    };

    return (
        <Box as="form" onSubmit={handleSubmit(onSubmit)} p={4}>
            <VStack spacing={4}>
                <FormControl isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <Input {...register('email', { required: 'Wymagany email' })} />
                </FormControl>
                <FormControl isInvalid={!!errors.password}>
                    <FormLabel>Hasło</FormLabel>
                    <Input type="password" {...register('password', { required: 'Wymagane hasło' })} />
                </FormControl>
                <Button type="submit" colorScheme="blue">Zaloguj się</Button>
            </VStack>
        </Box>
    );
};
