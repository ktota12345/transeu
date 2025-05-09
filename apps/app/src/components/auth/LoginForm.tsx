import React from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    Button,
    Input,
    VStack,
    FormControl,
    FormLabel,
    useToast
} from '@chakra-ui/react';
import { useAuth } from '../auth/useAuth';
type LoginData = {
    email: string;
    password: string;
};

export const LoginForm: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>();
    const { login } = useAuth();
    const toast = useToast();

    const onSubmit = async (data: LoginData) => {
        const success = await login(data);
        if (success) {
            onLoginSuccess();
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
                                autoFocus
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
