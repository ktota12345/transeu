// src/openai/openai.service.ts
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        // Konstruktor bez przekazywania modelu, model będzie ustawiany przy wywołaniu zapytania
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async getContactInfo(prompt: string): Promise<string> {
        try {
            // Przekazujemy model bezpośrednio w wywołaniu
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',  // Wybierz model, np. 'gpt-4' lub 'gpt-3.5-turbo'
                messages: [
                    { role: 'user', content: prompt },
                ],
            });

            return response.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('Błąd podczas komunikacji z OpenAI:', error);
            throw new Error('Błąd podczas komunikacji z OpenAI');
        }
    }
}
