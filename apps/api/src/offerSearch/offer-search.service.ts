import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OfferSearchService {
    constructor(private prisma: PrismaService) {}

}
