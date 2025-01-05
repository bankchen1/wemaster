import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  ValidationPipe
} from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { CurrentUser } from '../auth/current-user.decorator'
import { TutorFavoriteService } from './favorite.service'

@Controller('tutors/favorites')
@UseGuards(JwtAuthGuard)
export class TutorFavoriteController {
  constructor(private readonly favoriteService: TutorFavoriteService) {}

  @Post(':tutorId')
  async addFavorite(
    @CurrentUser('id') userId: string,
    @Param('tutorId', ParseUUIDPipe) tutorId: string
  ) {
    return this.favoriteService.addFavorite(userId, tutorId)
  }

  @Delete(':tutorId')
  async removeFavorite(
    @CurrentUser('id') userId: string,
    @Param('tutorId', ParseUUIDPipe) tutorId: string
  ) {
    return this.favoriteService.removeFavorite(userId, tutorId)
  }

  @Get()
  async getFavorites(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10
  ) {
    return this.favoriteService.getFavorites(userId, page, limit)
  }

  @Get(':tutorId/is-favorite')
  async isFavorite(
    @CurrentUser('id') userId: string,
    @Param('tutorId', ParseUUIDPipe) tutorId: string
  ) {
    const isFavorite = await this.favoriteService.isFavorite(userId, tutorId)
    return { isFavorite }
  }
}
