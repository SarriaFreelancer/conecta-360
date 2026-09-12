import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: number) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            uuid: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
            role: true,
            status: true,
            isActive: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException(`Perfil para el usuario con ID ${userId} no encontrado`);
    }

    return profile;
  }

  async create(userId: number, createProfileDto: CreateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    return this.prisma.profile.upsert({
      where: { userId },
      update: createProfileDto,
      create: {
        userId,
        ...createProfileDto,
      },
    });
  }

  async update(userId: number, updateProfileDto: UpdateProfileDto) {
    await this.findByUserId(userId);
    return this.prisma.profile.update({
      where: { userId },
      data: updateProfileDto,
    });
  }
}
