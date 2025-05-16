import { Injectable } from '@nestjs/common';
import { TestDto } from './dto/test.dto';
import { QueueTestService } from 'src/libs/bull/queue-test/queue-test.service';

@Injectable()
export class TestService {
  constructor(private queueTestService: QueueTestService) {}

  async testUser(payload: TestDto) {
    console.log('payload.quantity:::', payload.quantity);
    return await this.queueTestService.testUser(payload.quantity);
  }
}
