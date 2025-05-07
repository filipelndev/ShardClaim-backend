import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @Post('create-user')
  async createUser(@Body() body) {
    if (!body.name || !body.email || !body.password) {
      throw new BadRequestException('Todos os campos são obrigatórios.');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    return this.userService.create({
      role: body.role,
      email: body.email,
      password: hashedPassword,
      username: body.username,
      accounts: []
    });
  }
}
