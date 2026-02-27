import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogService } from './log.service';
import { RequestLog } from '../common/entities/request-log.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([RequestLog])],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
