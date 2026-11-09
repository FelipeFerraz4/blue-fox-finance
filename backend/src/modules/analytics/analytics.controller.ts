import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';
import { BillScheduleHelper } from '../../common/helpers/bill-schedule.helper';

@Roles(...FINANCE_ACCESS_ROLES)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  getOverview(
    @CurrentUser('sub') userId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const year = query.year ?? Number(BillScheduleHelper.currentMonth().slice(0, 4));
    return this.analyticsService.getOverview(userId, year, query.basis ?? 'fatura');
  }
}
