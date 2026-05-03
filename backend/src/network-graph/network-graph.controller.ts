import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NetworkGraphService, GraphData } from './network-graph.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Network Graph')
@Controller('network')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NetworkGraphController {
  constructor(private networkGraphService: NetworkGraphService) {}

  @Get('graph')
  @ApiOperation({ summary: 'Get network graph data for visualization' })
  async getGraph(@Request() req): Promise<GraphData> {
    return this.networkGraphService.getNetworkGraph(req.user.userId);
  }
}
