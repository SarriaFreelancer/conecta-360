import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { CuadrillasService } from './cuadrillas.service';
import { CreateCuadrillaDto, CreateCuadrillaProposalDto, UpdateProposalStatusDto } from './dto/cuadrilla.dto';

@Controller('cuadrillas')
export class CuadrillasController {
  constructor(private readonly cuadrillasService: CuadrillasService) {}

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('pricingModel') pricingModel?: string,
    @Query('city') city?: string,
    @Query('search') search?: string,
  ) {
    return this.cuadrillasService.findAll({ category, pricingModel, city, search });
  }

  @Get('proposals/all')
  findAllProposals() {
    return this.cuadrillasService.findAllProposals();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cuadrillasService.findOne(id);
  }

  @Post()
  create(@Body() createDto: CreateCuadrillaDto) {
    return this.cuadrillasService.create(createDto);
  }

  @Post(':id/proposals')
  createProposal(
    @Param('id', ParseIntPipe) id: number,
    @Body() proposalDto: CreateCuadrillaProposalDto,
  ) {
    return this.cuadrillasService.createProposal(id, proposalDto);
  }

  @Patch('proposals/:id/status')
  updateProposalStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() statusDto: UpdateProposalStatusDto,
  ) {
    return this.cuadrillasService.updateProposalStatus(id, statusDto);
  }
}
