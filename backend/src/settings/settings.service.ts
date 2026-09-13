import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let setting = await this.prisma.systemSetting.findFirst();

    if (!setting) {
      setting = await this.prisma.systemSetting.create({
        data: {
          platformName: 'CONECTA 360',
          primarySlogan: 'Conecta lo que necesitas con quien puede hacerlo.',
          secondarySlogan: 'Necesitas. Encuentras. Contratas.',
          country: 'Colombia',
          currency: 'COP ($)',
          defaultCity: 'Cali',
          defaultDepartment: 'Valle del Cauca',
          supportEmail: 'contacto@conecta360.co',
          supportPhone: '+57 315 789 4521',
          supportWhatsApp: '+57 315 789 4521',
          platformCommission: 5.0,
          minPlatformFee: 2500,
          minHourlyRate: 25000,
          freePlanMaxServices: 1,
          maxActivitiesPerService: 10,
          requireIdentityVerification: true,
          requirePoliceRecord: true,
          cashTransferDebtEnabled: true,
        },
      });
    }

    return setting;
  }

  async updateSettings(dto: UpdateSettingsDto) {
    const existing = await this.getSettings();

    const dataToUpdate: any = { ...dto };
    if (dto.minPlatformFee !== undefined) {
      dataToUpdate.minPlatformFee = dto.minPlatformFee;
    }
    if (dto.minHourlyRate !== undefined) {
      dataToUpdate.minHourlyRate = dto.minHourlyRate;
    }

    return this.prisma.systemSetting.update({
      where: { id: existing.id },
      data: dataToUpdate,
    });
  }
}
