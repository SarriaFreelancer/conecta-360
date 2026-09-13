import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingStatusDto, PayPlatformDebtDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // Cálculo de comisión mínima de la plataforma (5%, mín $3.000 COP)
  private calculatePlatformFee(amount: number): number {
    const rawFee = Math.round(amount * 0.05);
    return Math.max(rawFee, 3000);
  }

  async create(dto: CreateBookingDto) {
    const client = await this.prisma.user.findUnique({
      where: { id: dto.clientId },
      include: { profile: true },
    });
    if (!client) {
      throw new NotFoundException(`Cliente con ID ${dto.clientId} no encontrado.`);
    }

    const provider = await this.prisma.user.findUnique({
      where: { id: dto.providerId },
      include: { profile: true, providerProfile: true },
    });
    if (!provider) {
      throw new NotFoundException(`Prestador con ID ${dto.providerId} no encontrado.`);
    }

    const platformFee = this.calculatePlatformFee(dto.amount);
    const paymentMethod = dto.paymentMethod || 'Transferencia Bancaria';
    const isDirectPayment = paymentMethod === 'Transferencia Bancaria' || paymentMethod === 'Efectivo';
    const platformDebtStatus = isDirectPayment ? 'EN_DEUDA' : 'AL_DIA';

    const locationZone =
      dto.locationZone ||
      `${client.profile?.city || 'Cali'} (${client.profile?.department || 'Valle del Cauca'})`;

    const booking = await this.prisma.booking.create({
      data: {
        clientId: dto.clientId,
        providerId: dto.providerId,
        serviceTitle: dto.serviceTitle,
        categoryName: dto.categoryName,
        amount: dto.amount,
        status: 'SOLICITADO',
        paymentMethod,
        paymentStatus: 'PENDIENTE',
        platformFee,
        platformDebtStatus,
        estimatedTimeRange: dto.estimatedTimeRange || '2 a 4 horas',
        locationZone,
        dateString: dto.dateString || new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
        notes: dto.notes,
        teamBookingId: dto.teamBookingId,
        teamProjectName: dto.teamProjectName,
        teamMembersCount: dto.teamMembersCount,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
      },
    });

    // Crear notificación persistente en base de datos para el prestador
    await this.prisma.notification.create({
      data: {
        userId: dto.providerId,
        title: 'Nueva Solicitud de Servicio Recibida',
        message: `${client.firstName} ${client.lastName} ha solicitado tu servicio "${dto.serviceTitle}". Rango: ${dto.estimatedTimeRange || '2 a 4 horas'}. Ingresa a tu dashboard para confirmar o reprogramar.`,
        type: dto.teamBookingId ? 'TEAM_REQUEST' : 'SERVICE_REQUEST',
        actionRequired: true,
        serviceId: String(booking.id),
      },
    });

    return booking;
  }

  async findAll(status?: string, debtStatus?: string) {
    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (debtStatus && debtStatus !== 'ALL') {
      where.platformDebtStatus = debtStatus;
    }

    return this.prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: true,
            providerProfile: true,
          },
        },
      },
    });
  }

  async getFinancialSummary() {
    const bookings = await this.prisma.booking.findMany();
    const totalTransactions = bookings.length;
    const totalVolume = bookings.reduce((acc, b) => acc + Number(b.amount || 0), 0);
    const totalCommissionEarned = bookings
      .filter((b) => b.platformDebtStatus === 'AL_DIA' || b.paymentStatus === 'PAGADO')
      .reduce((acc, b) => acc + Number(b.platformFee || 0), 0);
    const totalDebtPending = bookings
      .filter((b) => b.platformDebtStatus === 'EN_DEUDA')
      .reduce((acc, b) => acc + Number(b.platformFee || 0), 0);

    return {
      totalTransactions,
      totalVolume,
      totalCommissionEarned,
      totalDebtPending,
    };
  }

  async findByClient(clientId: number) {
    return this.prisma.booking.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: true,
            providerProfile: true,
          },
        },
      },
    });
  }

  async findByProvider(providerId: number) {
    return this.prisma.booking.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
        provider: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profile: true,
          },
        },
        reviews: true,
      },
    });
    if (!booking) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada.`);
    }
    return booking;
  }

  async updateStatus(id: number, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { client: true, provider: true },
    });
    if (!booking) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada.`);
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: dto.status,
        rejectionReason: dto.rejectionReason || null,
        rejectionExplanation: dto.rejectionExplanation || null,
      },
    });

    // Notificar al cliente sobre el cambio de estado
    let notifTitle = 'Actualización de Servicio';
    let notifMsg = `El estado de tu solicitud para "${booking.serviceTitle}" ahora es ${dto.status}.`;

    if (dto.status === 'CONFIRMADO') {
      notifTitle = '¡Servicio Confirmado!';
      notifMsg = `${booking.provider.firstName} ${booking.provider.lastName} ha confirmado tu solicitud de "${booking.serviceTitle}".`;
    } else if (dto.status === 'RECHAZADO') {
      notifTitle = 'Servicio No Disponible';
      notifMsg = `${booking.provider.firstName} no pudo tomar el servicio en este horario: "${dto.rejectionReason || 'No disponible'}". Te invitamos a cotizar con otro profesional.`;
    } else if (dto.status === 'COMPLETADO') {
      notifTitle = 'Servicio Finalizado';
      notifMsg = `El servicio "${booking.serviceTitle}" ha sido marcado como completado. ¡Califica al profesional para ayudar a la comunidad!`;
    }

    await this.prisma.notification.create({
      data: {
        userId: booking.clientId,
        title: notifTitle,
        message: notifMsg,
        type: dto.status === 'CONFIRMADO' ? 'SERVICE_CONFIRMED' : 'SERVICE_REJECTED',
        serviceId: String(booking.id),
      },
    });

    return updated;
  }

  async payPlatformDebt(id: number, dto: PayPlatformDebtDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });
    if (!booking) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada.`);
    }

    return this.prisma.booking.update({
      where: { id },
      data: {
        platformDebtStatus: 'AL_DIA',
        paymentStatus: 'PAGADO',
      },
    });
  }
}
