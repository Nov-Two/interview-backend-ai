import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestLog } from '../common/entities/request-log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(RequestLog)
    private requestLogRepository: Repository<RequestLog>,
  ) {}

  async createLog(logData: Partial<RequestLog>) {
    try {
      const log = this.requestLogRepository.create(logData);
      await this.requestLogRepository.save(log);
    } catch (error) {
      console.error('Failed to save request log:', error);
    }
  }
}
