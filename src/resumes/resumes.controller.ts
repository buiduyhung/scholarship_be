import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { PayOSService } from 'src/payos/payos.service';
import { IUser } from 'src/users/users.interface';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { ResumesService } from './resumes.service';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly paymentService: PayOSService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @ResponseMessage('Create a new resume')
  @UseInterceptors(
    FileInterceptor('urlCV', {
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
    }),
  )
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createUserCvDto: CreateUserCvDto,
    @User() user: IUser,
  ) {
    try {
      const uploadedFileResponse =
        await this.cloudinaryService.uploadFile(file);
      const uploadedFileUrl = uploadedFileResponse.url;

      const { _id, orderCode, createdAt } = await this.resumesService.create(
        {
          ...createUserCvDto,
          urlCV: uploadedFileUrl,
        },
        user,
      );

      const payment = await this.paymentService.createPaymentLink({
        amount: 2000,
        cancelUrl: 'https://sfms.pages.dev/payment/cancel',
        description: `SMFS`,
        orderCode,
        returnUrl: 'https://sfms.pages.dev/payment/success',
        items: [
          {
            name: _id.toString(),
            price: 1000,
            quantity: 1,
          },
        ],
      });

      return { _id, createdAt, payment };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @Get()
  @ResponseMessage('Fetch all resumes with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs); // Modify this line
  }

  @Post('webhook')
  @ApiOperation({
    summary: 'Webhook from PayOS',
    description: 'This endpoint is used to receive payment status from PayOS',
  })
  @ResponseMessage('Webhook from PayOS')
  @Public()
  @HttpCode(200)
  webhook(@Body() body: any) {
    const webhookData = this.paymentService.verifyPaymentWebhookData(body);
    if (!webhookData) {
      throw new BadRequestException('Invalid signature');
    }

    const { orderCode } = webhookData;
    return this.resumesService.updateStatusByOrderCode(orderCode, "Đã thanh toán");
  }

  // @Get('search-by-provider')
  // @ResponseMessage("Search resumes by provider name")
  // searchByProviderName(@Query('providerName') providerName: string) {
  //   return this.resumesService.searchByProviderName(providerName);
  // }

  @Post('by-user')
  @ResponseMessage('Get Resumes by User')
  getResumesByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }

  @Get(':id')
  @ResponseMessage('Fetch a resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update status resume')
  @UseInterceptors(
    FileInterceptor('urlCV', {
      limits: {
        fileSize: 1024 * 1024 * 5, // Limit file size to 5MB
      },
    }),
  )
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @UploadedFile() file: Express.Multer.File,
    @User() user: IUser,
  ) {
    try {
      let uploadedFileUrl: string | undefined;

      if (file) {
        const uploadedFileResponse = await this.cloudinaryService.uploadFile(file);
        uploadedFileUrl = uploadedFileResponse.url;
      }

      return this.resumesService.update(id, status, uploadedFileUrl, user);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @Delete(':id')
  @ResponseMessage('Delete a resume')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
