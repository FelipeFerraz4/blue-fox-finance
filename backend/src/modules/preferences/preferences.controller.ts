import { Body, Controller, Delete, Get, Put } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdateExpensePreferenceDto } from './dto/expense-preference.dto';
import { Roles } from '../auth/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { FINANCE_ACCESS_ROLES } from '../auth/roles.constants';

@Roles(...FINANCE_ACCESS_ROLES)
@Controller('preferences')
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get('expenses')
  getExpensePreferences(@CurrentUser('sub') userId: string) {
    return this.preferencesService.getExpensePreferences(userId);
  }

  @Put('expenses')
  updateExpensePreferences(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateExpensePreferenceDto,
  ) {
    return this.preferencesService.updateExpensePreferences(userId, dto);
  }

  @Delete('expenses')
  clearExpensePreferences(@CurrentUser('sub') userId: string) {
    return this.preferencesService.clearExpensePreferences(userId);
  }
}
