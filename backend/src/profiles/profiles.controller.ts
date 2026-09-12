import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get(':userId')
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.profilesService.findByUserId(userId);
  }

  @Post(':userId')
  create(@Param('userId', ParseIntPipe) userId: number, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(userId, createProfileDto);
  }

  @Patch(':userId')
  update(@Param('userId', ParseIntPipe) userId: number, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(userId, updateProfileDto);
  }
}
