import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private excludePassword(user: any) {
    const { password, ...safeUser } = user;
    return safeUser;
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.trim().toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('El correo electrónico ya se encuentra registrado');
    }

    // Determinar rol
    const targetRoleName: RoleName =
      dto.role?.toUpperCase() === 'PROVIDER'
        ? RoleName.PROVIDER
        : RoleName.USER;

    let role = await this.prisma.role.findUnique({
      where: { name: targetRoleName },
    });

    if (!role) {
      role = await this.prisma.role.create({
        data: {
          name: targetRoleName,
          description:
            targetRoleName === RoleName.PROVIDER
              ? 'Prestador de Servicios Profesional'
              : 'Cliente / Usuario Final',
        },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.trim().toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        phone: dto.phone.trim(),
        roleId: role.id,
        status: 'ACTIVE',
        isActive: true,
        emailVerified: true,
        profile: {
          create: {
            city: dto.city || 'Cali',
            department: dto.department || 'Valle del Cauca',
            country: 'Colombia',
            reputationPoints: 100,
            negativePoints: 0,
            showWhatsApp: true,
            whatsappNumber: dto.phone.trim(),
          },
        },
        ...(targetRoleName === RoleName.PROVIDER
          ? {
              providerProfile: {
                create: {
                  title: dto.profession || 'Profesional de Servicios',
                  rating: 5.0,
                  totalReviews: 0,
                  experienceYears: 3,
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

    const safeUser = this.excludePassword(user);
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: role.name,
    });

    return {
      message: 'Registro exitoso',
      user: safeUser,
      token,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        profile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Esta cuenta está deshabilitada o suspendida');
    }

    const safeUser = this.excludePassword(user);
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role.name,
    });

    return {
      message: 'Inicio de sesión exitoso',
      user: safeUser,
      token,
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: true,
        profile: true,
        providerProfile: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.excludePassword(user);
  }
}
