import { BadRequestException, Body, Controller, Get, Param, Patch, Post, UseInterceptors, Req, UnauthorizedException, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService, private prisma: PrismaService) {}

  @Post()
async create(@Body() body) {
  if (!body.email || !body.password || !body.username) {
    throw new BadRequestException('Todos os campos são obrigatórios.');
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);
  
  return this.userService.create({
    role: body.role,
    email: body.email,
    username: body.username,
    password: hashedPassword,
    accounts: body.accounts || []
  });
}


  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id/accounts')
async getUserAccounts(@Param('id') userId: string) {
  const numericUserId = parseInt(userId, 10);

  if (isNaN(numericUserId)) {
    throw new BadRequestException('ID do usuário inválido');
  }

  return this.prisma.account.findMany({
    where: { userId: numericUserId },
  });
}

@Patch(':id/update-photo')
@UseInterceptors(FileInterceptor('file'))
async updateUserProfilePicture(
  @Param('id') userId: string,
  @UploadedFile() file: Express.Multer.File
) {
  if (!file) {
    throw new BadRequestException('Nenhum arquivo enviado!');
  }

  const filePath = `uploads/${userId}-${file.originalname}`;
  await fs.promises.writeFile(filePath, file.buffer);

  const photoUrl = `http://localhost:3000/${filePath}`;
  return this.userService.updateProfilePicture(parseInt(userId, 10), photoUrl);
}


@Get(':id')
async getUserById(@Param('id') userId: number) {
  console.log('Buscando usuário com ID:', userId);

  return this.userService.getUserById(+userId);
}

@Patch(':id/change-username')
async changeUsername(@Param('id') userId: number, @Body() body: any) {
  if (!body.username || body.username.trim() === '') {
    throw new BadRequestException('Novo nome de usuário não foi enviado.');
  }

  return this.userService.updateUsername(+userId, body.username);
}

@Patch(':id/change-password')
async changePassword(@Param('id') userId: number, @Body() body: any) {
  if (!body.password || body.password.trim() === '') {
    throw new BadRequestException('A nova senha é obrigatória.');
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);
  return this.userService.updatePassword(+userId, hashedPassword);
}
}
