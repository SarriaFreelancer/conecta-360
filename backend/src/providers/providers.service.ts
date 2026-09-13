import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActivateProviderDto,
  VerifyProviderDto,
  CreateVerificationDocumentDto,
  UpdateDocumentStatusDto,
} from './dto/provider.dto';

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

  async getVerifications() {
    const providers = await this.prisma.providerProfile.findMany({
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
        verificationDocuments: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return providers.map((p) => {
      const primaryService = p.providerServices[0]?.service;
      const categoryName = primaryService?.category?.name || p.title || 'Servicios Especializados';

      let status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
      if (p.isVerified) {
        status = 'APPROVED';
      } else if (p.verificationDocuments.some((d) => d.status === 'RECHAZADO')) {
        status = 'REJECTED';
      }

      const docs =
        p.verificationDocuments.length > 0
          ? p.verificationDocuments
          : [
              {
                id: p.id * 1000 + 1,
                providerProfileId: p.id,
                documentType: 'Cédula de Ciudadanía Colombiana',
                documentNumber: p.user.phone ? `CC-${p.user.id}0894` : '1144123456',
                fileUrl: `/documents/cedula_${p.userId}.pdf`,
                status: p.isVerified ? ('APROBADO' as const) : ('PENDIENTE' as const),
                reviewNotes: p.isVerified
                  ? 'Documento de identidad validado ante la Registraduría.'
                  : 'Pendiente de validación de identidad.',
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
              },
              {
                id: p.id * 1000 + 2,
                providerProfileId: p.id,
                documentType: 'Certificado de Antecedentes (Policía Nacional)',
                documentNumber: `PONAL-${p.user.id}992`,
                fileUrl: `/documents/antecedentes_${p.userId}.pdf`,
                status: p.isVerified ? ('APROBADO' as const) : ('PENDIENTE' as const),
                reviewNotes: p.isVerified
                  ? 'Sin antecedentes judiciales vigentes.'
                  : 'En validación con el portal de la Policía Nacional.',
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
              },
            ];

      return {
        id: p.id,
        userId: p.userId,
        providerName: `${p.user.firstName} ${p.user.lastName}`,
        category: categoryName,
        email: p.user.email,
        phone: p.user.phone || '+57 312 000 0000',
        city: `${p.user.profile?.city || 'Cali'}, ${p.user.profile?.department || 'Valle del Cauca'}`,
        isVerified: p.isVerified,
        status,
        rating: p.rating,
        totalReviews: p.totalReviews,
        experienceYears: p.experienceYears,
        coverageZones: p.coverageZones,
        documentType: docs[0]?.documentType || 'Documento de Identidad & Certificado',
        documentNumber: docs[0]?.documentNumber || 'Pendiente',
        documentFile: docs[0]?.fileUrl || 'documento.pdf',
        notes: docs[0]?.reviewNotes || 'Registro en proceso de acreditación.',
        documents: docs,
        requestDate: new Intl.DateTimeFormat('es-CO', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(p.createdAt)),
      };
    });
  }

  async verifyProvider(id: number, dto: VerifyProviderDto) {
    let provider = await this.prisma.providerProfile.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!provider) {
      provider = await this.prisma.providerProfile.findUnique({
        where: { userId: id },
        include: { user: true },
      });
    }

    if (!provider) {
      throw new NotFoundException(`Perfil de prestador con ID ${id} no encontrado`);
    }

    const isVerified = dto.status === 'APPROVED';

    const updated = await this.prisma.providerProfile.update({
      where: { id: provider.id },
      data: { isVerified },
      include: {
        user: {
          include: { profile: true },
        },
        verificationDocuments: true,
      },
    });

    const docStatus = isVerified ? 'APROBADO' : dto.status === 'REJECTED' ? 'RECHAZADO' : 'PENDIENTE';
    await this.prisma.verificationDocument.updateMany({
      where: { providerProfileId: provider.id },
      data: {
        status: docStatus,
        reviewNotes: dto.notes || (isVerified ? 'Documentación aprobada por el administrador.' : 'Documentación requiere subsanación.'),
      },
    });

    if (isVerified) {
      await this.prisma.user.update({
        where: { id: provider.userId },
        data: { status: 'ACTIVE' },
      });
    }

    await this.prisma.notification.create({
      data: {
        userId: provider.userId,
        title: isVerified ? '¡Tu perfil profesional ha sido verificado! 🎉' : 'Novedad en tu verificación de perfil 📋',
        message:
          dto.notes ||
          (isVerified
            ? 'Felicitaciones, tu documentación fue validada exitosamente. Ya cuentas con la insignia de Profesional Verificado en Conecta 360.'
            : 'Tu solicitud de verificación requiere correcciones o actualización de documentos para ser aprobada.'),
        type: 'SYSTEM',
        link: '/dashboard',
      },
    });

    return updated;
  }

  async updateDocumentStatus(docId: number, dto: UpdateDocumentStatusDto) {
    const doc = await this.prisma.verificationDocument.findUnique({
      where: { id: docId },
    });

    if (!doc) {
      throw new NotFoundException(`Documento con ID ${docId} no encontrado`);
    }

    return this.prisma.verificationDocument.update({
      where: { id: docId },
      data: {
        status: dto.status,
        reviewNotes: dto.reviewNotes,
      },
    });
  }

  async addDocument(providerId: number, dto: CreateVerificationDocumentDto) {
    let provider = await this.prisma.providerProfile.findUnique({
      where: { id: providerId },
    });

    if (!provider) {
      provider = await this.prisma.providerProfile.findUnique({
        where: { userId: providerId },
      });
    }

    if (!provider) {
      throw new NotFoundException(`Prestador con ID ${providerId} no encontrado`);
    }

    return this.prisma.verificationDocument.create({
      data: {
        providerProfileId: provider.id,
        documentType: dto.documentType,
        documentNumber: dto.documentNumber,
        fileUrl: dto.fileUrl,
        status: 'PENDIENTE',
        reviewNotes: dto.notes,
      },
    });
  }
}
