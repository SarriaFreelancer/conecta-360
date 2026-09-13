import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  create(@Body() dto: CreateReviewDto) {
    return this.reviewsService.create(dto);
  }

  @Get('provider/:providerId')
  findByProvider(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.reviewsService.findByProvider(providerId);
  }
}
