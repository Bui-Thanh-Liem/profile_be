import { Module } from '@nestjs/common';
import { TimerService } from './timer.service';

@Module({
  imports: [],
  providers: [TimerService],
  exports: [TimerService],
})
export class TimerModule {}

// Vẫn làm định kì nhưng khi cài thời gian thực hiện định kì xong , tới đúng giờ đó nó làm xong thì xoá  khỏi cron.
// VD: ngày 12 tháng 1 mỗi mỗi năm làm, làm xong lần đầu tiên xoá ngay.
