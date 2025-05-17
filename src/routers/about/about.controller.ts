import { Body, Controller, Get, Patch, UploadedFile } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { UtilConvert } from 'src/utils/Convert.util';
import { AboutService } from './about.service';
import { UpdateAboutDto } from './dto/update-about.dto';
import { Roles } from 'src/decorators/role.decorator';

@Controller(Constants.CONSTANT_ROUTE.ABOUT)
export class AboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  @Public()
  async find() {
    const result = await this.aboutService.find();
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'about', action: 'update' })
  @Patch()
  @UploadSingleFile()
  async update(
    @Body() payload: UpdateAboutDto,
    @ActiveUser() activeUser: TPayloadToken,
    @UploadedFile() newImage: Express.Multer.File,
  ) {
    // Nếu images từ client gửi lên có 1 item append thì sẽ có dạng string -> [string]
    const oldImage = UtilConvert.convertStringToArray(payload.image);

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
