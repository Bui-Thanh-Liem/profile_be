import { Module } from '@nestjs/common';
import { GgDriveService } from './ggDrive.service';

@Module({
  imports: [],
  controllers: [],
  providers: [GgDriveService],
  exports: [GgDriveService],
})
export class GgDriveModule {}
