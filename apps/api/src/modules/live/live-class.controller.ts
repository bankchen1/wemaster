import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LiveClassService } from './live-class.service';
import { CreateLiveClassDto } from './dto/create-live-class.dto';
import { User } from '../user/user.decorator';

@Controller('live-classes')
@UseGuards(AuthGuard('jwt'))
export class LiveClassController {
  constructor(private readonly liveClassService: LiveClassService) {}

  @Post()
  async createLiveClass(
    @Body() createLiveClassDto: CreateLiveClassDto,
    @User() user: any,
  ) {
    return this.liveClassService.createLiveClass({
      ...createLiveClassDto,
      hostId: user.id,
    });
  }

  @Get()
  async getLiveClasses(@Query() query: any) {
    return this.liveClassService.getLiveClasses(query);
  }

  @Get(':id')
  async getLiveClass(@Param('id') id: string) {
    return this.liveClassService.getLiveClass(id);
  }

  @Get(':id/token')
  async getClassToken(@Param('id') id: string, @User() user: any) {
    return this.liveClassService.generateToken(id, user.id);
  }

  @Get(':id/whiteboard')
  async getWhiteboardInfo(@Param('id') id: string) {
    return this.liveClassService.getWhiteboardInfo(id);
  }

  @Post(':id/start')
  async startClass(@Param('id') id: string, @User() user: any) {
    return this.liveClassService.startClass(id, user.id);
  }

  @Post(':id/end')
  async endClass(@Param('id') id: string, @User() user: any) {
    return this.liveClassService.endClass(id, user.id);
  }

  @Post(':id/join')
  async joinClass(@Param('id') id: string, @User() user: any) {
    return this.liveClassService.joinClass(id, user.id);
  }

  @Post(':id/leave')
  async leaveClass(@Param('id') id: string, @User() user: any) {
    return this.liveClassService.leaveClass(id, user.id);
  }
}
