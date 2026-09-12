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
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        profile: {
          create: {},
        },
      },
      include: {
        role: true,
        profile: true,
      },
    });

    return this.excludePassword(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(String(id));

    const dataToUpdate: any = { ...updateUserDto };
    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        role: true,
        profile: true,
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
