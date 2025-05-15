import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CONSTANT_JOB, CONSTANT_QUEUE } from 'src/constants';
import { ISendSms } from 'src/interfaces/models.interface';

// Đẩy job vào queue
@Injectable()
export class QueueSmsService {
  constructor(@InjectQueue(CONSTANT_QUEUE.QUEUE_SMS) private smsQueue: Queue) {}

  async sendOtp(data: ISendSms) {
    await this.smsQueue.add(CONSTANT_JOB.JOB_SEND_SMS, data, {
      attempts: 3,
      delay: 1000,
      removeOnComplete: true,
      removeOnFail: true,
    });
    return true;
  }

  // Nếu cần tối đa thêm hiệu suất thì chia nhỏ ra để đẩy nhiều job vào queue vì worker cấu hình chạy song song 5 jobs
  async sendBulkSms(data: ISendSms) {
    const sizeChunk = 10; // 1 job gửi 10 phone
    const phoneList = data.phones || [];

    //
    for (let i = 0; i < phoneList.length; i += sizeChunk) {
      //
      const chunk = phoneList.slice(i, i + sizeChunk);
      const chunkData: ISendSms = {
        ...data,
        phones: chunk,
      };

      //
      await this.smsQueue.add(CONSTANT_JOB.JOB_SEND_BULK_SMS, chunkData, {
        attempts: 3,
        delay: 1000,
        removeOnComplete: true,
        removeOnFail: true,
      });
    }
    return true;
  }
}
