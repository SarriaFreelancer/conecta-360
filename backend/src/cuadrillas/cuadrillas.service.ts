import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuadrillaDto, CreateCuadrillaProposalDto, UpdateProposalStatusDto } from './dto/cuadrilla.dto';

@Injectable()
export class CuadrillasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { category?: string; pricingModel?: string; city?: string; search?: string }) {
    const { category, pricingModel, city, search } = params;

    const where: any = {};

    if (city && city !== 'Todas' && city !== 'Tu ciudad') {
      where.city = { contains: city };
    }

    if (category && category !== 'ALL') {
      where.category = { contains: category };
    }

    if (pricingModel && pricingModel !== 'TODOS') {
      where.preferredPricingModel = pricingModel;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { leaderName: { contains: q } },
        { category: { contains: q } },
      ];
    }

    const cuadrillas = await this.prisma.cuadrilla.findMany({
      where,
      include: {
        members: true,
        proposals: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { rating: 'desc' },
    });

    // Parsear activities JSON si viene serializado
    return cuadrillas.map((c) => {
      let parsedActivities: string[] = [];
      try {
        parsedActivities = JSON.parse(c.activities);
      } catch {
        parsedActivities = c.activities ? c.activities.split(',').map((s) => s.trim()) : [];
      }
      return {
        ...c,
        activities: parsedActivities,
      };
    });
  }

  async findOne(id: number) {
    const cuadrilla = await this.prisma.cuadrilla.findUnique({
      where: { id },
      include: {
        members: true,
        proposals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cuadrilla) {
      throw new NotFoundException(`Cuadrilla con ID ${id} no encontrada.`);
    }

    let parsedActivities: string[] = [];
    try {
      parsedActivities = JSON.parse(cuadrilla.activities);
    } catch {
      parsedActivities = cuadrilla.activities ? cuadrilla.activities.split(',').map((s) => s.trim()) : [];
    }

    return {
      ...cuadrilla,
      activities: parsedActivities,
    };
  }

  async create(createDto: CreateCuadrillaDto) {
    const { members, activities, ...data } = createDto;

    const slug = `${data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')}-${Date.now().toString().slice(-4)}`;

    const created = await this.prisma.cuadrilla.create({
      data: {
        ...data,
        slug,
        activities: JSON.stringify(activities || []),
        members: {
          create: members.map((m) => ({
            name: m.name,
            role: m.role,
            experience: m.experience,
            specialty: m.specialty,
          })),
        },
      },
      include: {
        members: true,
      },
    });

    return {
      ...created,
      activities: activities || [],
    };
  }

  async createProposal(cuadrillaId: number, dto: CreateCuadrillaProposalDto) {
    const cuadrilla = await this.prisma.cuadrilla.findUnique({
      where: { id: cuadrillaId },
    });

    if (!cuadrilla) {
      throw new NotFoundException(`Cuadrilla con ID ${cuadrillaId} no encontrada.`);
    }

    return this.prisma.cuadrillaProposal.create({
      data: {
        cuadrillaId,
        clientName: dto.clientName,
        clientPhone: dto.clientPhone,
        clientEmail: dto.clientEmail,
        projectName: dto.projectName,
        description: dto.description,
        pricingModel: dto.pricingModel,
        proposedRate: dto.proposedRate,
        estimatedDuration: dto.estimatedDuration,
        agreementNotes: dto.agreementNotes,
        status: 'PROPUESTA_ENVIADA',
      },
      include: {
        cuadrilla: {
          select: {
            id: true,
            name: true,
            leaderName: true,
            leaderPhone: true,
            category: true,
          },
        },
      },
    });
  }

  async findAllProposals() {
    return this.prisma.cuadrillaProposal.findMany({
      include: {
        cuadrilla: {
          select: {
            id: true,
            name: true,
            leaderName: true,
            leaderPhone: true,
            category: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateProposalStatus(proposalId: number, dto: UpdateProposalStatusDto) {
    const proposal = await this.prisma.cuadrillaProposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException(`Propuesta con ID ${proposalId} no encontrada.`);
    }

    return this.prisma.cuadrillaProposal.update({
      where: { id: proposalId },
      data: {
        status: dto.status,
        ...(dto.agreementNotes ? { agreementNotes: dto.agreementNotes } : {}),
      },
      include: {
        cuadrilla: true,
      },
    });
  }
}
