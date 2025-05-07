import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  // ⏰ Chạy mỗi 5 giây
  @Cron('*/5 * * * * *') // Format: "giây phút giờ ngày tháng ngày-trong-tuần"
  handleCron() {
    this.logger.log('Cron Job chạy mỗi 5 giây 🚀');
  }

  // 📅 Chạy vào 12h trưa mỗi ngày
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  handleDailyTask() {
    this.logger.log('Chạy job hàng ngày lúc 12h trưa 🌞');
  }

  // 🔁 Chạy mỗi 10 giây (Interval)
  @Interval(10000)
  handleInterval() {
    this.logger.log('Chạy job mỗi 10 giây 🔄');
  }

  // ⏳ Chạy một lần sau 15 giây kể từ khi khởi động server
  @Timeout(15000)
  handleTimeout() {
    this.logger.log('Chạy job sau 15 giây kể từ khi server khởi động ⏳');
  }
}
