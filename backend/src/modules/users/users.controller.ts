import { Body, Controller, Get, Post } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { KeycloakRole, NEW_USER_ROLES } from '../auth/roles.constants';
import { CurrentUser } from '../auth/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

/** Administração de usuários: só ROLE_FINANCE_ADMIN. */
@Controller('admin/users')
@Roles(KeycloakRole.FINANCE_ADMIN)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  async list() {
    return {
      configured: this.users.configured,
      roles: NEW_USER_ROLES,
      users: await this.users.findAll(),
    };
  }

  @Post()
  create(@CurrentUser('sub') adminId: string, @Body() dto: CreateUserDto) {
    return this.users.create(adminId, dto);
  }
}
