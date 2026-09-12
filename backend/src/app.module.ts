import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { RolesModule } from './roles/roles.module';
import { CategoriesModule } from './categories/categories.module';
import { ProvidersModule } from './providers/providers.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    ProfilesModule,
    RolesModule,
    CategoriesModule,
    ProvidersModule,
    ServicesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
