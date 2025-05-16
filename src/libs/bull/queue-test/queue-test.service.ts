import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Enums } from 'liemdev-profile-lib';
import { CONSTANT_JOB, CONSTANT_QUEUE } from 'src/constants';
import { IUser } from 'src/interfaces/models.interface';

// Đẩy job vào queue
@Injectable()
export class QueueTestService {
  constructor(@InjectQueue(CONSTANT_QUEUE.QUEUE_TEST) private testQueue: Queue) {}

  //
  async testUser(quantity: number) {
    const data = Array.from({ length: quantity }, (_, idx) => {
      const mock = {
        fullName: `${idx} LiemDev`,
        gender: Enums.EGender.MALE,
        email: `LiemDev${idx}@Gmail.com`,
        password: `LiemDev ${idx}`,
      } as Partial<IUser>;

      return mock;
    });

    const sizeChunk = 10;

    //
    for (let i = 0; i < data.length; i += sizeChunk) {
      const chunk = data.slice(i, i + sizeChunk);
      await this.testQueue.add(
        CONSTANT_JOB.JOB_SEND_BULK_TEST_USER,
        { users: chunk }, // = job.data - processor
        {
          attempts: 3,
          delay: 1000,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    }
    return true;
  }
}
