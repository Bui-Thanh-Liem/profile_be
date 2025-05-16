import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, QueueEvents, Worker } from 'bullmq';
import { CONSTANT_JOB, CONSTANT_QUEUE } from 'src/constants';
import { IUser } from 'src/interfaces/models.interface';
import { UserService } from 'src/routers/user/user.service';

// Tạo worker xử lý job
@Injectable()
export class QueueTestProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueTestProcessor.name);

  private workers: Worker[] = [];
  private queueEvents: QueueEvents;

  constructor(private readonly userService: UserService) {}

  onModuleInit() {
    const workerCount = 1;
    for (let i = 0; i < workerCount; i++) {
      const worker = new Worker(
        CONSTANT_QUEUE.QUEUE_TEST,
        async (job: Job) => {
          const testUsers = job?.data?.users as Partial<IUser>[];

          //
          if (job.name === CONSTANT_JOB.JOB_SEND_BULK_TEST_USER) {
            this.logger.debug(`📨 Đang xử lý test ${testUsers?.length || 0} user...`);
            await this.userService.test(testUsers);
            this.logger.debug(`✅ Xử lý test ${testUsers?.length || 0} user thành công`);
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
