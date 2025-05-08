import { Body, Controller, Get, Patch, Req, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { Constants } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { Public } from 'src/decorators/public.decorator';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';
import { HandleLocalFileService } from 'src/helpers/services/HandleLocalFile.service';
import { UtilConvert } from 'src/utils/Convert.util';
import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/update-about.dto';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { ActiveUser } from 'src/decorators/activeUser.decorator';

@Controller(Constants.CONSTANT_ROUTE.ABOUT)
export class AboutController {
  constructor(
    private readonly aboutService: AboutService,
    private handleLocalFileService: HandleLocalFileService,
  ) {}

  @Get()
  @Public()
  async find() {
    const result = await this.aboutService.find();
    console.log('result :::', result);

    //  Thêm tiền tố cho url ảnh
    result.image = this.handleLocalFileService.setFileUrlForClient(result.image);
    return new ResponseSuccess('Success', result);
  }

  @Patch()
  @UploadSingleFile()
  async update(
    @Body() payload: UpdateAboutDto,
    @ActiveUser() activeUser: TPayloadToken,
    @UploadedFile() newImage: Express.Multer.File,
  ) {
    // Nếu images từ client gửi lên có 1 item append thì sẽ có dạng string -> [string]
    let oldImage = UtilConvert.convertStringToArray(payload.image);
    oldImage = this.handleLocalFileService.setFileUrlForServer(oldImage);

    //
    const [text] = UtilConvert.convertStringToArrayBySplit(payload.text as any, ',') as any;

    //
    const result = await this.aboutService.update({
      id: '',
      newImage,
      activeUser,
      payload: { ...payload, image: oldImage[0], text },
    });
    return new ResponseSuccess('Success', result);
  }
}
