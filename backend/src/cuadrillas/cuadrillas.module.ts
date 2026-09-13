import { Module } from '@nestjs/common';
import { CuadrillasController } from './cuadrillas.controller';
import { CuadrillasService } from './cuadrillas.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CuadrillasController],
  providers: [CuadrillasService],
  exports: [CuadrillasService],
})
export class CuadrillasModule {}
