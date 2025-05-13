import {Controller, Get, Query, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {OpenAIService} from '../services/openai/openai.service';
import {SerpapiService} from '../services/serp/serpapi.service';

@Controller('dataFinder')
export class DataFinderController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly openaiService: OpenAIService,
        private readonly serpapiService: SerpapiService
    ) {
    }

    // Endpoint do obsługi paczek
    @Get('batch')
    async findContactsBatch(
        @Query('batchSize') batchSize: number = 10, // domyślny rozmiar paczki to 10
    ) {
        let skip = 0;
        let hasMore = true;

        // Proces przetwarzania paczek
        while (hasMore) {
            const carriers = await this.prisma.carrier.findMany({
                where: {
                    NOT: {
                        contacts: {
                            some: {},
                        },
                    },
                },
                take: batchSize,
                skip: skip,
            });

            if (carriers.length === 0) {
                hasMore = false;
                break;
            }

            // Wysłanie zapytania do GPT o dane kontaktowe dla każdej firmy
            for (const carrier of carriers) {
                const fullName = `${carrier.name}, ${carrier.address} ${carrier.postalCode} ${carrier.city}, województwo ${carrier.region}`;

                const results = await this.serpapiService.searchCompany(fullName);

                if(results.place_results){
                    const data = results.place_results;
                    await this.prisma.carrierContact.create({
                        data: {
                            carrierId: carrier.id,
                            name: data.title??'',
                            email: data.email??'',
                            phone: data.phone??'',
                            source: 'google maps',
                        },
                    });
                }else{

                    await this.prisma.carrierContact.create({
                        data: {
                            carrierId: carrier.id,
                            name: 'no data',
                            email: '',
                            phone: '',
                            source: 'google maps',
                        },
                    });
                }
            }

            // Zwiększanie indeksu do pobrania kolejnej paczki
            skip += batchSize;
        }

        return {message: 'Przetwarzanie zakończone'};
    }
}
