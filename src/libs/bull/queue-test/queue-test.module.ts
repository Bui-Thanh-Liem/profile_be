import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { CONSTANT_QUEUE } from 'src/constants';
import { HelperModule } from 'src/helpers/helper.module';
import { QueueTestProcessor } from './queue-test.processor';
import { QueueTestService } from './queue-test.service';
import { UserModule } from 'src/routes/user/user.module';

@Module({
  imports: [BullModule.registerQueue({ name: CONSTANT_QUEUE.QUEUE_TEST }), HelperModule, UserModule],
  providers: [QueueTestService, QueueTestProcessor],
  exports: [QueueTestService],
})
export class QueueTestModule {}
