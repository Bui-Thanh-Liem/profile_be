import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CONSTANT_QUEUE } from 'src/constants';
import { HelperModule } from 'src/helpers/helper.module';
import { QueueSmsProcessor } from './queue-sms.processor';
import { QueueSmsService } from './queue-sms.service';

@Module({
  imports: [BullModule.registerQueue({ name: CONSTANT_QUEUE.QUEUE_SMS }), HelperModule],
  providers: [QueueSmsService, QueueSmsProcessor],
  exports: [QueueSmsService],
})
export class QueueSmsModule {}
