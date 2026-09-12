import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivateProviderDto } from './dto/provider.dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(city?: string, category?: string, search?: string) {
    const where: any = {};

    if (city && city !== 'Todas' && city !== 'Tu ciudad') {
      where.user = {
        profile: {
          city: {
            contains: city,
          },
        },
      };
    }

    if (category) {
      where.providerServices = {
        some: {
          service: {
            category: {
              name: {
                contains: category,
              },
            },
          },
        },
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { user: { firstName: { contains: q } } },
        { user: { lastName: { contains: q } } },
        {
          providerServices: {
            some: {
              service: {
                name: { contains: q },
              },
            },
          },
        },
      ];
    }

    return this.prisma.providerProfile.findMany({
      where,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        providerServices: {
          include: {
            service: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { rating: 'desc' },
    });
  }

  async findByUserId(userId: number) {
    const provider = await this.prisma.providerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
        providerServices: {
          include: {
            service: true,
          },
        },
      },
    });

    if (!provider) {
      throw new NotFoundException(`El usuario con ID ${userId} no ha activado su perfil de prestador`);
    }

    return provider;
  }

  async activate(userId: number, dto?: ActivateProviderDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const existing = await this.prisma.providerProfile.findUnique({ where: { userId } });
    if (existing) {
      throw new ConflictException('El perfil de prestador ya se encuentra activo para este usuario');
    }

    return this.prisma.providerProfile.create({
      data: {
        userId,
        isVerified: dto?.isVerified ?? false,
      },
    });
  }
}
