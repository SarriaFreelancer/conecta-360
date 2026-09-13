import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto) {
    const client = await this.prisma.user.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${dto.clientId} no encontrado.`);
    }

    const providerProfile = await this.prisma.providerProfile.findUnique({
      where: { userId: dto.providerId },
    });
    if (!providerProfile) {
      throw new NotFoundException(`Perfil de prestador con User ID ${dto.providerId} no encontrado.`);
    }

    const review = await this.prisma.review.create({
      data: {
        clientId: dto.clientId,
        providerId: dto.providerId,
        bookingId: dto.bookingId || null,
        rating: dto.rating,
        comment: dto.comment || null,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: true,
          },
        },
      },
    });

    // Recalcular promedio de calificaciones del prestador
    const allReviews = await this.prisma.review.findMany({
      where: { providerId: dto.providerId },
      select: { rating: true },
    });

    const totalReviews = allReviews.length;
    const sumRatings = allReviews.reduce((acc, r) => acc + r.rating, 0);
    const averageRating = totalReviews > 0 ? Number((sumRatings / totalReviews).toFixed(1)) : 5.0;

    await this.prisma.providerProfile.update({
      where: { userId: dto.providerId },
      data: {
        rating: averageRating,
        totalReviews,
      },
    });

    // Notificar al prestador de la nueva reseña
    await this.prisma.notification.create({
      data: {
        userId: dto.providerId,
        title: '¡Nueva Calificación Recibida!',
        message: `${client.firstName} ${client.lastName} te ha dejado una calificación de ${dto.rating} estrellas: "${dto.comment || 'Servicio completado exitosamente'}".`,
        type: 'SYSTEM',
        serviceId: dto.bookingId ? String(dto.bookingId) : undefined,
      },
    });

    return review;
  }

  async findByProvider(providerId: number) {
    return this.prisma.review.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                city: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
    });
  }
}
