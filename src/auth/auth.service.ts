import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: RegisterDto) {
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const existingUser = await this.usersService.findByUsername(registerDto.username);
    if (existingUser) {
        throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    // We can safely call usersService.create because RegisterDto has all fields of CreateUserDto (username, password)
    // plus confirmPassword. 
    // usersService.create expects CreateUserDto.
    // However, if we pass extra fields (confirmPassword), TypeORM create might complain or ignore.
    // Best to extract only what we need.
    
    const { confirmPassword, ...userDetails } = registerDto;
    
    const user = await this.usersService.create({
      ...userDetails,
      password: hashedPassword,
    });
    const { password, ...result } = user;
    return result;
  }
}
