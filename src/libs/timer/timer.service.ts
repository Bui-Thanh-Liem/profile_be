import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';

@Injectable()
export class TimerService {
  private readonly logger = new Logger(TimerService.name);
  private cronJobs: Map<string, CronJob> = new Map();

  constructor() {}

  createCronJob(blog: any, blogService: any) {
    // Check exist
    if (this.cronJobs.has(blog.id)) {
      this.cronJobs.get(blog.id)?.stop();
      this.cronJobs.delete(blog.id);
    }

    //
    // if (isPast(blog.timer)) {
    //   return;
    // }
    const timer = this.handleGeneratorCronTime(blog.timer);

    //
    const cronJob = new CronJob(
      timer,
      () => {
        this.handleCronJob(blog, blogService);
      },
      null,
      true,
      'Asia/Ho_Chi_Minh',
    );

    this.cronJobs.set(blog.id, cronJob);
    cronJob.start();
  }

  updateCronTime(blog: any, blogService: any) {
    this.createCronJob(blog, blogService);
  }

  private async handleCronJob(blog: any, blogService: any) {
    const { id } = blog;

    //
    const currentYear = new Date().getFullYear();
    const scheduleYear = blog.timer.year;
    if (currentYear !== scheduleYear) {
      return;
    }

    //
    console.log('Tới giờ rồi vào làm thôi nek');
    await blogService.setPostBelongTimer(id);
    this.logger.log('Handle cron job:::', id);

    //
    const cronJob = this.cronJobs.get(id);
    if (cronJob) {
      cronJob.stop();
      this.cronJobs.delete(id);
      this.logger.log('Handled then Delete cron job:::', id);
    }
  }

  private handleGeneratorCronTime(cronTime: any) {
    const dataConvert = typeof cronTime === 'string' ? JSON.parse(cronTime) : cronTime;
    const [day, month, year] = dataConvert.date.split('-');
    const [hours, minute] = dataConvert.time.split(':');
    return `* ${minute} ${hours} ${day} ${month} *`;
  }
}
