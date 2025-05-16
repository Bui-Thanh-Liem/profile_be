import { Body, Controller, Post } from '@nestjs/common';
import { TestDto } from './dto/test.dto';
import { TestService } from './test.service';
import { ResponseSuccess } from 'src/classes/response.class';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @Post('user')
  testUser(@Body() payload: TestDto) {
    return new ResponseSuccess('Success', this.testService.testUser(payload));
  }
}
