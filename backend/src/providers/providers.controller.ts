import { Controller, Get, Post, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ActivateProviderDto } from './dto/provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

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
}
