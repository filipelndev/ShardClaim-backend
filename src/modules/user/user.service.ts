import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(userData: { role: string; email: string; password: string; accounts?: string[]; username: string }) {
    // Verifica se o username já existe no banco
    const existingUser = await this.prisma.user.findUnique({
      where: { username: userData.username },
    });
  
    if (existingUser) {
      throw new BadRequestException(`O username "${userData.username}" já está em uso.`);
    }
  
    return this.prisma.user.create({
      data: {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        role: userData.role ? Role.ADMIN : Role.USER
      },
    });
  }
  
  async findAll() {
    return this.prisma.user.findMany({
      include: {
        accounts: true,
      },
    });
  }

  async updateProfilePicture(userId: number, photo: string) { // 🔥 Usamos `photo`
    return this.prisma.user.update({
      where: { id: userId },
      data: { photo } // 🔥 Atualizamos com `photo`
    });
  }

  
  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { accounts: true }
    });
  }

  async updateUsername(userId: number, newUsername: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { username: newUsername }
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email }
    });
  }

  async updatePassword(userId: number, newPassword: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { password: newPassword }
    });
  }
}
