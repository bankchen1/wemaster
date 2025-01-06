import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('onboarding')
@UseGuards(JwtAuthGuard)
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('progress')
  async getProgress(@Request() req) {
    return this.onboardingService.getProgress(req.user.id);
  }

  @Post('step/:stepId')
  async updateStep(
    @Request() req,
    @Param('stepId') stepId: string,
    @Body() data: any,
  ) {
    return this.onboardingService.updateProgress(req.user.id, stepId, data);
  }

  @Post('complete')
  async complete(@Request() req) {
    return this.onboardingService.completeOnboarding(req.user.id);
  }

  @Post('reset')
  async reset(@Request() req) {
    return this.onboardingService.resetProgress(req.user.id);
  }
}
