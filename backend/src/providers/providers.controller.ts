import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProvidersService } from './providers.service';
import {
  ActivateProviderDto,
  VerifyProviderDto,
  CreateVerificationDocumentDto,
  UpdateDocumentStatusDto,
} from './dto/provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get('verifications')
  getVerifications() {
    return this.providersService.getVerifications();
  }

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.providersService.findAll(city, category, search);
  }

  @Get(':userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.providersService.findByUserId(userId);
  }

  @Post('activate/:userId')
  activate(@Param('userId', ParseIntPipe) userId: number, @Body() dto: ActivateProviderDto) {
    return this.providersService.activate(userId, dto);
  }

  @Patch(':id/verify')
  verifyProvider(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyProviderDto,
  ) {
    return this.providersService.verifyProvider(id, dto);
  }

  @Patch('documents/:docId/status')
  updateDocumentStatus(
    @Param('docId', ParseIntPipe) docId: number,
    @Body() dto: UpdateDocumentStatusDto,
  ) {
    return this.providersService.updateDocumentStatus(docId, dto);
  }

  @Post(':id/documents')
  addDocument(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateVerificationDocumentDto,
  ) {
    return this.providersService.addDocument(id, dto);
  }
}
