// src/users/dto/update-user.dto.ts

export class UpdateUserDto {
    displayName?: string;
    age?: number;
    heightCm?: number;
    weightKg?: number;
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active';
    goalType?: 'lose_weight' | 'maintain' | 'gain_muscle';
  }