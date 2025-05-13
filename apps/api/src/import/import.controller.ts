
import {
    Controller,
    Get,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as csvParser from 'csv-parser';
import { PrismaService } from '../prisma/prisma.service';

@Controller('import')
export class ImportController {
    constructor(private readonly prisma: PrismaService) {}

    @Get('carriers')
    async importCarriers() {
        return {
            message: `disabled`
        };
        const results: any[] = [];
        const filePath = path.join(process.cwd(), 'src', 'assets', 'Licencje.csv');

        await new Promise<void>((resolve, reject) => {
            fs.createReadStream(filePath, { encoding: 'utf-8' }) // cp1250 ≈ latin1
                .pipe(csvParser({ separator: ';', mapHeaders: ({ header }) => header.trim() }))
                .on('data', (data: Record<string, string>) => results.push(data))
                .on('end', resolve)
                .on('error', reject);
        });

        const carriers = results.map((row) => ({
            type: row['type'],
            name: row['name'],
            postalCode: row['postalCode'],
            city: row['city'],
            address: row['address'],
            region: row['region'],
            licenseNumber: row['licenseNumber'],
            licenseExpiryDate: this.parseDate(row['licenseExpiryDate']),
        }));

        const created = await this.prisma.carrier.createMany({
            data: carriers,
            skipDuplicates: true,
        });

        return {
            message: `Zaimportowano ${created.count} przewoźników`,
        };
    }

    private parseDate(dateStr: string | undefined): Date | null {
        if (!dateStr || !dateStr.includes('.')) {
            return null; // lub new Date(), jeśli chcesz ustawić datę domyślną
        }

        const [day, month, year] = dateStr.split('.');
        return new Date(`${year}-${month}-${day}`);
    }

}
