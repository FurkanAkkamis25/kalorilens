import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        firebaseUid: data.firebaseUid ?? null,
        email: data.email,
        password: hashedPassword,
        displayName: data.displayName,
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        activityLevel: data.activityLevel,
        goalType: data.goalType,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findOneById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // Firebase ID'ye göre TEK kullanıcı bul
  async findOneByFirebaseUid(firebaseUid: string) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: firebaseUid },
    });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    return user;
  }

  // Firebase ID'ye göre kullanıcı güncelle
  async updateByFirebaseUid(firebaseUid: string, data: UpdateUserDto) {
    // Önce kullanıcıyı bul
    const user = await this.findOneByFirebaseUid(firebaseUid);

    // Güncelle
    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: data.displayName,
        age: data.age,
        heightCm: data.heightCm,
        weightKg: data.weightKg,
        activityLevel: data.activityLevel,
        goalType: data.goalType,
      },
    });
  }
}