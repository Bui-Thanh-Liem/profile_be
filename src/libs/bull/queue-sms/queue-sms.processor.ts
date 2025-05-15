import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, QueueEvents, Worker } from 'bullmq';
import { CONSTANT_JOB, CONSTANT_QUEUE } from 'src/constants';
import { SmsService } from 'src/helpers/services/Sms.service';
import { ISendSms } from 'src/interfaces/common.interface';

// Tạo worker xử lý job
@Injectable()
export class QueueSmsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueSmsProcessor.name);

  private workers: Worker[] = [];
  private queueEvents: QueueEvents;

  constructor(private readonly smsService: SmsService) {}

  onModuleInit() {
    const workerCount = 1;
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(
        CONSTANT_QUEUE.QUEUE_SMS,
        async (job: Job) => {
          const data = job.data as ISendSms;

          //
          if (job.name === CONSTANT_JOB.JOB_SEND_SMS) {
            this.logger.debug(`📨 Đang gửi otp tới ${data?.phone}...`);
            await this.smsService.sendOtp(data.phone);
            this.logger.debug(`✅ Otp gửi thành công đến ${data.phone}`);
          }

          //
          if (job.name === CONSTANT_JOB.JOB_SEND_BULK_SMS) {
            this.logger.debug(`📨 Đang gửi sms notifications...`);
            await this.smsService.sendNotification(data.phones);
            this.logger.debug(`✅ Notifications gửi thành công`);
          }
        },
        {
          connection: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT },
          concurrency: 5, // jobs chạy song song
        },
      );
      this.workers.push(worker);
    }

    this.queueEvents = new QueueEvents(CONSTANT_QUEUE.QUEUE_SMS, {
      connection: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT },
    });

    this.queueEvents.on('completed', ({ jobId }) => {
      this.logger.debug(`✅ Job ${jobId} đã hoàn thành.`);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.debug(`❌ Job ${jobId} thất bại: ${failedReason}`);
    });

    this.queueEvents.on('waiting', ({ jobId }) => {
      this.logger.debug(`⏳ Job ${jobId} đang chờ xử lý`);
    });
  }

  async onModuleDestroy() {
    await Promise.all(this.workers.map((worker) => worker.close()));
    await this.queueEvents.close();
    this.logger.debug('Worker và QueueEvents đã được đóng.');
  }
}
