// src/goals/goals.service.ts

import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersService } from 'src/users/users.service';
import { ActivityLevel, GoalType } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) { }

  async recalculateGoals(userId: string) {
    // 1. Adım: İsteği atan kullanıcıyı bul
    const user = await this.usersService.findOneById(userId);

    if (!user) {
      throw new BadRequestException('Kullanıcı bulunamadı');
    }

    // 2. Adım: Gerekli veriler eksik mi diye kontrol et
    const { age, heightCm, weightKg, activityLevel, goalType } = user;
    if (!age || !heightCm || !weightKg || !activityLevel || !goalType) {
      throw new BadRequestException(
        'Lütfen profilinizdeki boy, kilo, yaş, aktivite seviyesi ve hedef alanlarını doldurun.',
      );
    }

    // 3. Adım: BMR Hesapla (Mifflin-St Jeor)
    // BMR = 10 * kilo(kg) + 6.25 * boy(cm) - 5 * yaş(yıl) + 5 (Erkek için)
    // Kadın için -161. Cinsiyet verisi yoksa erkek varsayıyoruz veya ortalama.
    // Şimdilik +5 (Erkek) kullanıyoruz.
    const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

    // 4. Adım: Aktivite Seviyesine Göre TDEE
    const activityMultipliers: Record<ActivityLevel, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
    };
    const maintenanceCalories = bmr * activityMultipliers[activityLevel];

    // 5. Adım: Hedefe Göre Kaloriyi Ayarla
    let targetCalories: number;
    switch (goalType) {
      case 'lose_weight':
        targetCalories = maintenanceCalories - 500;
        break;
      case 'gain_muscle':
        targetCalories = maintenanceCalories + 300;
        break;
      case 'maintain':
      default:
        targetCalories = maintenanceCalories;
        break;
    }
    targetCalories = Math.round(targetCalories);

    // 6. Adım: Varsayılan Makroları Belirle
    const goalData = {
      dailyKcal: targetCalories,
      carbPct: 50,
      proteinPct: 25,
      fatPct: 25,
    };

    // 7. Adım: Veritabanına kaydet
    const newGoal = await this.prisma.goal.upsert({
      where: { userId: user.id },
      update: goalData,
      create: {
        userId: user.id,
        ...goalData,
      },
    });

    return newGoal;
  }
}