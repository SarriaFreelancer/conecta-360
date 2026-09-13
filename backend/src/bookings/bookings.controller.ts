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
import { BookingsService } from './bookings.service';
import { CreateBookingDto, UpdateBookingStatusDto, PayPlatformDebtDto } from './dto/booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('debtStatus') debtStatus?: string,
  ) {
    return this.bookingsService.findAll(status, debtStatus);
  }

  @Get('financial-summary')
  getFinancialSummary() {
    return this.bookingsService.getFinancialSummary();
  }

  @Post()
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Get('client/:clientId')
  findByClient(@Param('clientId', ParseIntPipe) clientId: number) {
    return this.bookingsService.findByClient(clientId);
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.bookingsService.findByProvider(providerId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, dto);
  }

  @Patch(':id/pay-debt')
  payDebt(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PayPlatformDebtDto,
  ) {
    return this.bookingsService.payPlatformDebt(id, dto);
  }
}
