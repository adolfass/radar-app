import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.userService.getProfile(req.user.userId);
  }

  @Get('admin/list')
  @ApiOperation({ summary: 'List all users (admin only)' })
  async getAllUsers(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.userService.getAllUsers(req.user.userId, page || 1, limit || 20, search);
  }

  @Get('admin/stats')
  @ApiOperation({ summary: 'Get user statistics (admin only)' })
  async getUserStats(@Request() req) {
    return this.userService.getUserStats(req.user.userId);
  }

  @Post('admin/:id/toggle-ban')
  @ApiOperation({ summary: 'Ban/unban user (admin only)' })
  async toggleBanUser(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.userService.toggleBanUser(req.user.userId, id);
  }
}
