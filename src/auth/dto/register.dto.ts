import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';

export class RegisterDto extends CreateUserDto {
  @ApiProperty({ example: 'password123', description: 'Confirm password' })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
