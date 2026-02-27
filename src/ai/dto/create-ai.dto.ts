import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAiDto {
  @ApiProperty({ example: 'Hello AI', description: 'The message to send to AI' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
