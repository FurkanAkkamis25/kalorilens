// src/users/dto/create-user.dto.ts

import { ActivityLevel, GoalType } from '@prisma/client';

export class CreateUserDto {
  firebaseUid?: string;
  email: string;
  password: string;
  displayName?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  goalType?: GoalType;
}