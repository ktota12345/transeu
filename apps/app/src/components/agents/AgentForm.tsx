import React from 'react';
import { useForm } from 'react-hook-form';
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    ButtonGroup,
    Input
} from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Select } from '@chakra-ui/select';
import { Switch } from '@chakra-ui/switch';
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/number-input';
import { useToast } from '@chakra-ui/toast';
import { AgentFormData, CheckFrequency } from '../../types/agent';

interface AgentFormProps {
    onSubmit: (data: AgentFormData) => void;
    onTest?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    initialData?: AgentFormData;
}

const checkFrequencyOptions = [
    { value: 'live', label: 'Na żywo (ciągłe monitorowanie)' },
    { value: 'hourly', label: 'Co godzinę' },
    { value: '30min', label: 'Co 30 minut' },
    { value: '15min', label: 'Co 15 minut' },
    { value: 'custom', label: 'Niestandardowa' }
];

export const AgentForm: React.FC<AgentFormProps> = ({
    onSubmit,
    onTest,
    onDuplicate,
    onDelete,
    initialData
}) => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<AgentFormData>({
        defaultValues: initialData || {
            name: '',
            isActive: false,
            checkFrequency: 'hourly',
            maxConcurrentNegotiations: 5,
            workingHours: {
                start: '09:00',
                end: '17:00'
            },
            isDraft: true
        }
    });

    const toast = useToast();
    const checkFrequency = watch('checkFrequency');

    const handleFormSubmit = (data: AgentFormData, isDraft: boolean) => {
        onSubmit({ ...data, isDraft });
    };

    return (
        <Box as="form" onSubmit={handleSubmit((data) => handleFormSubmit(data, data.isDraft))} p={4}>
            <VStack spacing={6} align="stretch">
                <FormControl isRequired isInvalid={!!errors.name}>
                    <FormLabel>Nazwa agenta</FormLabel>
                    <Input {...register('name', { required: 'To pole jest wymagane' })} />
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Częstotliwość sprawdzania giełdy</FormLabel>
                    <Select {...register('checkFrequency')}>
                        {checkFrequencyOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Select>
                </FormControl>

                {checkFrequency === 'custom' && (
                    <FormControl isRequired>
                        <FormLabel>Interwał sprawdzania (minuty)</FormLabel>
                        <NumberInput min={1} max={60}>
                            <NumberInputField {...register('customCheckInterval', {
                                required: checkFrequency === 'custom',
                                min: 1,
                                max: 60
                            })} />
                            <NumberInputStepper>
                                <NumberIncrementStepper />
                                <NumberDecrementStepper />
                            </NumberInputStepper>
                        </NumberInput>
                    </FormControl>
                )}

                <FormControl isRequired>
                    <FormLabel>Maksymalna liczba jednoczesnych negocjacji</FormLabel>
                    <NumberInput min={1} max={20}>
                        <NumberInputField {...register('maxConcurrentNegotiations', {
                            required: true,
                            min: 1,
                            max: 20
                        })} />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
                </FormControl>

                <FormControl isRequired>
                    <FormLabel>Godziny pracy</FormLabel>
                    <HStack>
                        <Input
                            type="time"
                            {...register('workingHours.start', { required: true })}
                        />
                        <Text>do</Text>
                        <Input
                            type="time"
                            {...register('workingHours.end', { required: true })}
                        />
                    </HStack>
                </FormControl>

                <FormControl display="flex" alignItems="center">
                    <FormLabel mb="0">Status aktywności</FormLabel>
                    <Switch {...register('isActive')} />
                </FormControl>

                <ButtonGroup spacing={4}>
                    <Button
                        type="submit"
                        onClick={() => handleFormSubmit(watch(), true)}
                        colorScheme="gray"
                    >
                        Zapisz jako szkic
                    </Button>
                    <Button
                        type="submit"
                        onClick={() => handleFormSubmit(watch(), false)}
                        colorScheme="blue"
                    >
                        Zapisz i aktywuj
                    </Button>
                    {onTest && (
                        <Button onClick={onTest} colorScheme="green">
                            Testuj profil
                        </Button>
                    )}
                    {onDuplicate && (
                        <Button onClick={onDuplicate} colorScheme="purple">
                            Duplikuj profil
                        </Button>
                    )}
                    {onDelete && (
                        <Button onClick={onDelete} colorScheme="red">
                            Usuń profil
                        </Button>
                    )}
                </ButtonGroup>
            </VStack>
        </Box>
    );
};
