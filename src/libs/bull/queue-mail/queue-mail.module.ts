import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CONSTANT_QUEUE } from 'src/constants';
import { QueueMailProcessor } from './queue-mail.processor';
import { QueueMailService } from './queue-mail.service';
import { HelperModule } from 'src/helpers/helper.module';

@Module({
  imports: [BullModule.registerQueue({ name: CONSTANT_QUEUE.QUEUE_MAIL }), HelperModule],
  providers: [QueueMailService, QueueMailProcessor],
  exports: [QueueMailService],
})
export class QueueMailModule {}

// waiting, active, completed, failed
