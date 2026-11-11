import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { KeycloakAdminService } from './keycloak-admin.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, KeycloakAdminService],
})
export class UsersModule {}
