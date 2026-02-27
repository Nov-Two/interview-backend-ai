import { Controller, Post, Body, UseGuards, Request, Get, Sse, UseInterceptors, UploadedFile, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { AiService } from './ai.service';
import { CreateAiDto } from './dto/create-ai.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('AI')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Chat with AI (Supports Image)' })
  @ApiResponse({ status: 201, description: 'Returns AI response.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('chat')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async chat(@Body() createAiDto: CreateAiDto, @Request() req, @UploadedFile() file: Express.Multer.File) {
    return this.aiService.chat(createAiDto.message, req.user.userId, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Chat with AI (Stream) (Supports Image)' })
  @ApiResponse({ status: 200, description: 'Returns AI response stream.' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post('stream')
  @Sse('stream')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  stream(@Body() createAiDto: CreateAiDto, @Request() req, @UploadedFile() file: Express.Multer.File): Observable<any> {
    return this.aiService.chatStream(createAiDto.message, req.user.userId, file);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get chat history' })
  @Get('history')
  async getHistory(@Request() req) {
    return this.aiService.getHistory(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Delete chat history' })
  @ApiResponse({ status: 200, description: 'Chat history deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Chat history not found.' })
  @Delete('history/:id')
  async deleteHistory(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.aiService.deleteHistory(id, req.user.userId);
  }
}
