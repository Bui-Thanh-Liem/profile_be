import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, QueueEvents, Worker } from 'bullmq';
import { CONSTANT_JOB, CONSTANT_QUEUE } from 'src/constants';
import { MailService } from 'src/helpers/services/Mail.service';
import { ISendMail } from 'src/interfaces/common.interface';

// Tạo worker xử lý job
@Injectable()
export class QueueMailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueMailProcessor.name);

  private workers: Worker[] = [];
  private queueEvents: QueueEvents;

  constructor(private readonly mailService: MailService) {}

  onModuleInit() {
    const workerCount = 2;
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(
        CONSTANT_QUEUE.QUEUE_MAIL, // Worker xử lý tất cả jobs trong Queue
        async (job: Job) => {
          const data = job.data as ISendMail;

          //
          if (job.name === CONSTANT_JOB.JOB_SEND_MAIL) {
            this.logger.debug(`📨 Đang gửi email tới ${job.data.to}...`);
            await this.mailService.sendMail(data);
            this.logger.debug(`✅ Email gửi thành công đến ${job.data.to}`);
          }

          //
          if (job.name === CONSTANT_JOB.JOB_SEND_BULK_MAIL) {
            this.logger.debug(`📨 Đang gửi emails...`);
            await this.mailService.sendBulkMails(data);
            this.logger.debug(`✅ Emails gửi thành công`);
          }
        },
        {
          connection: { host: process.env.REDIS_HOST, port: +process.env.REDIS_PORT },
          concurrency: 5, // jobs chạy song song
        },
      );
      this.workers.push(worker);
    }

    this.queueEvents = new QueueEvents(CONSTANT_QUEUE.QUEUE_MAIL, {
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
