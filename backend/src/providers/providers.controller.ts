import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { ActivateProviderDto } from './dto/provider.dto';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  findAll() {
    return this.providersService.findAll();
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
