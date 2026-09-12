import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!service) {
      throw new NotFoundException(`Servicio con ID ${id} no encontrado`);
    }
    return service;
  }

  async create(createServiceDto: CreateServiceDto) {
    const existing = await this.prisma.service.findUnique({
      where: { slug: createServiceDto.slug },
    });
    if (existing) {
      throw new ConflictException('Ya existe un servicio con este slug');
    }
    return this.prisma.service.create({
      data: createServiceDto,
      include: { category: true },
    });
  }

  async update(id: number, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id);
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
      include: { category: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.service.delete({ where: { id } });
    return { message: `Servicio con ID ${id} eliminado correctamente` };
  }
}
