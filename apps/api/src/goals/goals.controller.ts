import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) { }

  @Post('recalc')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Hedefleri yeniden hesapla' })
  recalculate(@Request() req) {
    return this.goalsService.recalculateGoals(req.user.userId);
  }
}