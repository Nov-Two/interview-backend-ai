import { Injectable, InternalServerErrorException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { ChatHistory } from './entities/chat-history.entity';
import { Observable } from 'rxjs';
import * as fs from 'fs';

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.deepseek.com/chat/completions';

  constructor(
    private configService: ConfigService,
    @InjectRepository(ChatHistory)
    private chatHistoryRepository: Repository<ChatHistory>,
  ) {
    this.apiKey = this.configService.get<string>('DEEPSEEK_API_KEY') || '';
  }

  async chat(message: string, userId: number, file?: Express.Multer.File) {
    try {
      const messages: any[] = [
        { role: 'user', content: message }
      ];

      // If there is a file (image), we need to format the message for vision
      // Assuming OpenAI Vision compatible format which many new APIs support
      // But DeepSeek V3 might not support image input directly yet via standard API or uses different format.
      // If the user insists on "combining AI to analyze picture", we try to send it if possible.
      // If DeepSeek doesn't support it, we might get an error.
      // For demonstration, we will try to construct the payload.
      // Note: Standard OpenAI vision payload:
      // content: [ { type: "text", text: "..." }, { type: "image_url", image_url: { url: "data:image/jpeg;base64,..." } } ]
      
      if (file) {
        const base64Image = fs.readFileSync(file.path, { encoding: 'base64' });
        const mimeType = file.mimetype;
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        messages[0].content = [
          { type: 'text', text: message },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl
            }
          }
        ];
      }

      const response = await axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat', // or deepseek-vl if available, but keep standard for now
          messages: messages,
          stream: false
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      
      const answer = response.data.choices[0].message.content;

      // Save to database
      const chatHistory = this.chatHistoryRepository.create({
        user_id: userId,
        question: message,
        answer: answer,
        image_path: file ? `/uploads/${file.filename}` : undefined,
      });
      await this.chatHistoryRepository.save(chatHistory);

      return {
        reply: answer
      };
    } catch (error) {
      console.error('DeepSeek API Error:', error.response?.data || error.message);
      
      // Fallback: If API fails (likely due to image not supported by this model), we still save the record but with error message
      // Or we can throw error.
      // Let's throw error for now.
      throw new InternalServerErrorException('Failed to fetch response from AI: ' + (error.response?.data?.error?.message || error.message));
    }
  }

  chatStream(message: string, userId: number, file?: Express.Multer.File): Observable<any> {
    return new Observable((observer) => {
      let fullAnswer = '';

      const messages: any[] = [
        { role: 'user', content: message }
      ];

      if (file) {
        const base64Image = fs.readFileSync(file.path, { encoding: 'base64' });
        const mimeType = file.mimetype;
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        messages[0].content = [
          { type: 'text', text: message },
          {
            type: 'image_url',
            image_url: {
              url: dataUrl
            }
          }
        ];
      }

      axios.post(
        this.apiUrl,
        {
          model: 'deepseek-chat',
          messages: messages,
          stream: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          responseType: 'stream'
        }
      ).then((response) => {
        response.data.on('data', (chunk: Buffer) => {
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          for (const line of lines) {
            if (line.includes('[DONE]')) {
              observer.complete();
              
              // Save to database after stream completes
              if (fullAnswer) {
                 const chatHistory = this.chatHistoryRepository.create({
                  user_id: userId,
                  question: message,
                  answer: fullAnswer,
                  image_path: file ? `/uploads/${file.filename}` : undefined,
                });
                this.chatHistoryRepository.save(chatHistory).catch(err => {
                    console.error('Failed to save chat history:', err);
                });
              }
              return;
            }
            if (line.startsWith('data: ')) {
              try {
                const jsonStr = line.substring(6);
                const data = JSON.parse(jsonStr);
                const content = data.choices[0]?.delta?.content || '';
                if (content) {
                  fullAnswer += content;
                  observer.next({ data: { content } });
                }
              } catch (e) {
                console.error('Error parsing JSON from stream:', e);
              }
            }
          }
        });

        response.data.on('error', (err) => {
          observer.error(err);
        });
        
        // Handle end of stream just in case [DONE] is missed or other cases
        response.data.on('end', () => {
             // We handle completion in [DONE] usually, but if stream ends without [DONE], we should also save.
        });

      }).catch((error) => {
        console.error('DeepSeek API Stream Error:', error.response?.data || error.message);
        observer.error(new InternalServerErrorException('Failed to stream response from AI: ' + (error.response?.data?.error?.message || error.message)));
      });
    });
  }

  async getHistory(userId: number) {
    return this.chatHistoryRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async deleteHistory(id: number, userId: number) {
    const history = await this.chatHistoryRepository.findOne({ where: { id } });
    
    if (!history) {
      throw new NotFoundException('Chat history not found');
    }

    if (history.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own chat history');
    }

    return this.chatHistoryRepository.remove(history);
  }
}
