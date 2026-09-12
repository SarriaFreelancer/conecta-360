import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        services: {
          include: {
            providerServices: true,
          },
        },
        requirements: true,
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((cat) => {
      const providerProfileIds = new Set<number>();
      cat.services.forEach((srv) => {
        srv.providerServices?.forEach((ps) => {
          providerProfileIds.add(ps.providerProfileId);
        });
      });
      // Personas/prestadores únicos registrados o estimación proporcional por servicios
      const baseReferential = cat.services.length > 0 ? cat.services.length * 3 + 2 : 3;
      const totalPersons = Math.max(providerProfileIds.size, baseReferential);

      return {
        ...cat,
        totalPersons,
      };
    });
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        services: true,
        requirements: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });

    if (existing) {
      throw new ConflictException('Ya existe una categoría con este slug');
    }

    return this.prisma.category.create({
      data: createCategoryDto,
    });
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.category.delete({ where: { id } });
    return { message: `Categoría con ID ${id} eliminada` };
  }
}
