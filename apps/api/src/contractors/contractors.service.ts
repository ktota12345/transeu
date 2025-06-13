import {BadRequestException, Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {Prisma, Contractor} from '../../generated/prisma/client';
import {isNumber} from "class-validator";

@Injectable()
export class ContractorsService {
    constructor(private prisma: PrismaService) {
    }

    async create(data: Prisma.ContractorCreateInput): Promise<Contractor> {

        if (data.taxId) {
            const exists = await this.prisma.contractor.findFirst({
                where: { taxId: data.taxId },
            });
            if (exists) {
                throw new BadRequestException(`Kontrahent z NIP-em ${data.taxId} już istnieje.`);
            }
        }
        const {aliases, ratings, ...rest} = data as any;

        return this.prisma.contractor.create({
            data: {
                ...rest,
                aliases: {
                    create: (aliases || []).map((a: any) => ({name: a.name})),
                },
                ratings: {
                    create: (ratings || []).map((r: any) => ({
                        ratedByCompany: r.ratedByCompany,
                        ratingAverage: r.ratingAverage,
                        communication: r.communication,
                        loadAsDescribed: r.loadAsDescribed,
                        waitingForLoading: r.waitingForLoading,
                        waitingForUnloading: r.waitingForUnloading,
                        paymentIssue: r.paymentIssue,
                        comment: r.comment,
                    })),
                },
            },
            include: {
                aliases: true,
                ratings: true,
            },
        });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.ContractorWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[Contractor[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.contractor.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
                include: {
                    aliases: true,
                    ratings: true,
                },
            }),
            this.prisma.contractor.count({where: filter}),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<Contractor | null> {
        return this.prisma.contractor.findUnique({
            where: {id},
            include: {
                aliases: true,
                ratings: true,
            },
        });
    }

    async update(id: number, data: Prisma.ContractorUpdateInput): Promise<Contractor> {
        const {aliases, ratings,country, ...rest} = data as any;

        // Usuń stare aliasy i oceny
        await this.prisma.contractorAlias.deleteMany({where: {contractorId: id}});
        let countryCode: string | undefined = undefined;
        if (country) {
            const countryEntity = await this.prisma.country.findFirstOrThrow({
                where: { code: country }, // zakładam, że ID to np. "PL"
            });

            if (countryEntity) {
                countryCode = countryEntity.code;
            }
        }
        return this.prisma.contractor.update({
            where: {id},
            data: {
                ...rest,
                ...(countryCode && { country: countryCode }),
                aliases: {
                    create: (aliases || []).map((a: any) => ({name: a.name})),
                },
                ratings: {
                    create: (ratings || []).map((r: any) => ({
                        ratedByCompany: r.ratedByCompany,
                        ratingAverage: r.ratingAverage,
                        communication: r.communication,
                        loadAsDescribed: r.loadAsDescribed,
                        waitingForLoading: r.waitingForLoading,
                        waitingForUnloading: r.waitingForUnloading,
                        paymentIssue: r.paymentIssue,
                        comment: r.comment,
                    })),
                },
            },
            include: {
                aliases: true,
                ratings: true,
            },
        });
    }

    async remove(id: number): Promise<Contractor> {
        return this.prisma.contractor.delete({where: {id}});
    }

    async toggleBlacklist(id: number, blacklisted: boolean, reason?: string): Promise<Contractor> {
        const contractor = await this.prisma.contractor.findUnique({where: {id}});
        if (!contractor) {
            throw new Error(`Contractor with ID ${id} not found`);
        }

        return this.prisma.contractor.update({
            where: {id},
            data: {
                blacklisted,
                blacklistReason: blacklisted ? reason : null,
            },
        });
    }


}
