import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private excludePassword(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findAll(role?: string, category?: string, search?: string) {
    const where: any = {};

    if (role && role !== 'ALL') {
      if (role === 'PROVIDER') {
        where.providerProfile = { isNot: null };
      } else if (role === 'CLIENT' || role === 'USER') {
        where.providerProfile = null;
      } else {
        where.role = { name: role };
      }
    }

    if (category && category !== 'ALL') {
      where.providerProfile = {
        providerServices: {
          some: {
            service: {
              category: {
                name: { contains: category },
              },
            },
          },
        },
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { email: { contains: q } },
        { phone: { contains: q } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        role: true,
        profile: true,
        providerProfile: {
          include: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((user) => this.excludePassword(user));
  }

  async findOne(identifier: string) {
    const isInt = !isNaN(Number(identifier));
    const user = await this.prisma.user.findUnique({
      where: isInt ? { id: Number(identifier) } : { uuid: identifier },
      include: {
        role: true,
        profile: true,
        providerProfile: {
          include: {
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
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con identificador ${identifier} no encontrado`);
    }

    return this.excludePassword(user);
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email.trim().toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Identificar el rol seleccionado
    const role = await this.prisma.role.findUnique({
      where: { id: createUserDto.roleId },
    });

    const isProvider = role?.name === 'PROVIDER';
    const status = createUserDto.status || 'ACTIVE';
    const isActive = status === 'ACTIVE';

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email.trim().toLowerCase(),
        password: hashedPassword,
        firstName: createUserDto.firstName.trim(),
        lastName: createUserDto.lastName.trim(),
        phone: createUserDto.phone?.trim() || null,
        roleId: createUserDto.roleId,
        status,
        isActive,
        emailVerified: true,
        profile: {
          create: {
            city: 'Cali',
            department: 'Valle del Cauca',
            country: 'Colombia',
            reputationPoints: 100,
            negativePoints: 0,
            showWhatsApp: true,
            whatsappNumber: createUserDto.phone?.trim() || null,
          },
        },
        ...(isProvider
          ? {
              providerProfile: {
                create: {
                  title: 'Profesional de Servicios',
                  rating: 5.0,
                  totalReviews: 0,
                  experienceYears: 1,
                  isVerified: false,
                },
              },
            }
          : {}),
      },
      include: {
        role: true,
        profile: true,
        providerProfile: true,
      },
    });

    return this.excludePassword(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    let existing: any = null;
    try {
      existing = await this.findOne(String(id));
    } catch (notFound) {
      if (updateUserDto.email) {
        existing = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email.trim().toLowerCase() },
          include: {
            role: true,
            profile: true,
            providerProfile: true,
          },
        });
      }
      if (!existing) throw notFound;
    }

    const actualId = existing.id;
    const dataToUpdate: any = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    if (updateUserDto.email) {
      dataToUpdate.email = updateUserDto.email.trim().toLowerCase();
    }

    if (updateUserDto.status) {
      dataToUpdate.isActive = updateUserDto.status === 'ACTIVE';
    }

    // Si se asigna rol de prestador y no tenía perfil de proveedor, crearlo
    if (updateUserDto.roleId) {
      const targetRole = await this.prisma.role.findUnique({
        where: { id: updateUserDto.roleId },
      });
      if (targetRole?.name === 'PROVIDER' && !existing.providerProfile) {
        await this.prisma.providerProfile.create({
          data: {
            userId: actualId,
            title: 'Profesional de Servicios',
            rating: 5.0,
            totalReviews: 0,
            experienceYears: 1,
            isVerified: false,
          },
        });
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: actualId },
      data: dataToUpdate,
      include: {
        role: true,
        profile: true,
        providerProfile: {
          include: {
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
        },
      },
    });

    return this.excludePassword(updatedUser);
  }

  async remove(id: number) {
    await this.findOne(String(id));
    await this.prisma.user.delete({ where: { id } });
    return { message: `Usuario con ID ${id} eliminado exitosamente` };
  }
}
