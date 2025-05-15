import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { CONSTANT_JOB, CONSTANT_QUEUE } from 'src/constants';
import { ISendMail } from 'src/interfaces/common.interface';

// Đẩy job vào queue
@Injectable()
export class QueueMailService {
  constructor(@InjectQueue(CONSTANT_QUEUE.QUEUE_MAIL) private emailQueue: Queue) {}

  // Sử dụng template khác nếu muốn gửi otp
  async sendMail(data: ISendMail) {
    await this.emailQueue.add(CONSTANT_JOB.JOB_SEND_MAIL, data, {
      attempts: 3, // Retry 3 lần nếu lỗi
      delay: 1000, // Delay 1s trước khi chạy
      removeOnComplete: true, // Xoá job khi hoàn thành
      removeOnFail: true,
    });
    return true;
  }

  // Nếu cần tối đa thêm hiệu suất thì chia nhỏ ra để đẩy nhiều job vào queue vì worker cấu hình chạy song song 5 jobs
  async sendBulkMail(data: ISendMail) {
    const sizeChunk = 10; // 1 job gửi 10 mail
    const emailList = data.toBulk || [];

    //
    for (let i = 0; i < emailList.length; i += sizeChunk) {
      //
      const chunk = emailList.slice(i, i + sizeChunk);
      const chunkData: ISendMail = {
        ...data,
        toBulk: chunk,
      };

      //
      await this.emailQueue.add(CONSTANT_JOB.JOB_SEND_BULK_MAIL, chunkData, {
        attempts: 3,
        delay: 1000,
        removeOnComplete: true,
        removeOnFail: true,
      });
    }
    return true;
  }
}
