import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SerpapiService {
    private readonly apiKey = process.env.SERPAPI_API_KEY;

    async searchCompany(companyName: string, location = 'Poland') {
        const params = {
            engine: 'google_maps',
            q: `${companyName} ${location}`,
            api_key: this.apiKey,
            hl: 'pl',
            gl: 'pl',
        };

        const response = await axios.get('https://serpapi.com/search', { params });

        return response.data;
    }
}
