import { Module } from '@nestjs/common';
import { QueueTestModule } from 'src/libs/bull/queue-test/queue-test.module';
import { TestController } from './test.controller';
import { TestService } from './test.service';

@Module({
  imports: [QueueTestModule],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
