// src/goals/goals.module.ts

import { Module } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { PrismaModule } from 'src/prisma/prisma.module'; // 1. Import et
import { UsersModule } from 'src/users/users.module'; // 2. Import et

@Module({
  imports: [PrismaModule, UsersModule], // 3. Buraya ekle
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule { }