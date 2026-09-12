import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ActivateProviderDto } from './dto/provider.dto';

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.providerProfile.findMany({
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
