import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RoleName } from '@prisma/client';
import { UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureRolesSeeded() {
    const defaultRoles: { name: RoleName; description: string }[] = [
      {
        name: RoleName.SUPERADMIN,
        description: 'Super Administrador con control total del sistema, seguridad y configuraciones críticas.',
      },
      {
        name: RoleName.ADMIN,
        description: 'Administrador operativo con gestión de usuarios, servicios, aprobaciones y soporte general.',
      },
      {
        name: RoleName.USER,
        description: 'Usuario estándar / Cliente que busca, contrata y califica servicios o cuadrillas.',
      },
      {
        name: RoleName.MODERATOR,
        description: 'Moderador de contenido, calificaciones y publicaciones de la comunidad de servicios.',
      },
      {
        name: RoleName.SUPPORT,
        description: 'Personal de atención al cliente y resolución de disputas para clientes y prestadores.',
      },
      {
        name: RoleName.PROVIDER,
        description: 'Prestador de servicios profesional verificado con catálogo de oficios y actividades activo.',
      },
      {
        name: RoleName.COMPANY,
        description: 'Empresa o cuadrilla constituida con capacidad de atención de contratos corporativos.',
      },
    ];

    for (const r of defaultRoles) {
      await this.prisma.role.upsert({
        where: { name: r.name },
        update: {},
        create: r,
      });
    }
  }

  async findAll() {
    const count = await this.prisma.role.count();
    if (count < 7) {
      await this.ensureRolesSeeded();
    }

    return this.prisma.role.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return role;
  }

  async update(id: number, dto: UpdateRoleDto) {
    await this.findOne(id);

    return this.prisma.role.update({
      where: { id },
      data: {
        description: dto.description,
      },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });
  }
}
