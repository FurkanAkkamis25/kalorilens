// src/users/users.controller.ts

import {
    Controller,
    Get,
    Post,
    Body,
    Headers, // 1. Headers'ı import et
    Put, // 2. Put'u import et
  } from '@nestjs/common';
  import { UsersService } from './users.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { UpdateUserDto } from './dto/update-user.dto'; // 3. Update DTO'yu import et
  
  @Controller('users')
  export class UsersController {
    constructor(private readonly usersService: UsersService) {}
  
    // Bu endpoint'i test için tutabiliriz ama artık ana endpoint değil
    @Get()
    findAll() {
      return this.usersService.findAll();
    }
  
    @Post()
    create(@Body() createUserData: CreateUserDto) {
      return this.usersService.create(createUserData);
    }
  
    // 4. YENİ: "BENİM" profilimi getir
    @Get('me')
    getMe(@Headers('x-firebase-uid') firebaseUid: string) {
      // 'x-firebase-uid' header'ından gelen kimlik bilgisi
      return this.usersService.findOneByFirebaseUid(firebaseUid);
    }
  
    // 5. YENİ: "BENİM" profilimi güncelle
    @Put('me')
    updateMe(
      @Headers('x-firebase-uid') firebaseUid: string, // Kimin güncellediği
      @Body() updateUserData: UpdateUserDto, // Hangi verilerle güncellediği
    ) {
      return this.usersService.updateByFirebaseUid(firebaseUid, updateUserData);
    }
  }