import { Module } from '@nestjs/common';
import { QueueMailModule } from 'src/libs/bull/queue-mail/queue-mail.module';
import { SendMailController } from './send-mail.controller';
import { SendMailService } from './send-mail.service';

@Module({
  imports: [QueueMailModule],
  controllers: [SendMailController],
  providers: [SendMailService],
})
export class SendMailModule {}
