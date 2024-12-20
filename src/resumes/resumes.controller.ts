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
import { CheckoutResponseDataType } from '@payos/node/lib/type';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  Public,
  ResponseMessage,
  SkipCheckPermission,
  User,
} from 'src/decorator/customize';
import { PayOSService } from 'src/payos/payos.service';
import { IUser } from 'src/users/users.interface';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { ResumesService } from './resumes.service';
import mongoose, { Types } from 'mongoose';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(
    private readonly resumesService: ResumesService,
    private readonly paymentService: PayOSService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @SkipCheckPermission()
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
        amount: 3000,
        cancelUrl: 'https://sfms.pages.dev/payment/cancel',
        description: `SMFS`,
        orderCode,
        returnUrl: 'https://sfms.pages.dev/payment/success',
        items: [
          {
            name: _id.toString(),
            price: 0,
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
  @SkipCheckPermission()
  @ResponseMessage('Fetch all resumes with pagination')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs); // Modify this line
  }

  @Post('webhook')
  @SkipCheckPermission()
  @ApiOperation({
    summary: 'Webhook from PayOS',
    description: 'This endpoint is used to receive payment status from PayOS',
  })
  @ResponseMessage('Webhook from PayOS')
  @Public()
  @HttpCode(200)
  async webhook(@Body() body: any) {
    const webhookData = this.paymentService.verifyPaymentWebhookData(body);
    if (!webhookData) {
      throw new BadRequestException('Invalid signature');
    }

    const { orderCode } = webhookData;
    const resume = await this.resumesService.findOneByOrderCode(orderCode);
    if (!resume) {
      throw new BadRequestException('Resume not found');
    }
    const status =
      resume.status === 'Đang chờ thanh toán'
        ? 'Đã thanh toán'
        : 'Đã thanh toán lần 2';
    return this.resumesService.updateStatusByOrderCode(orderCode, status);
  }

  // @Get('search-by-provider')
  // @ResponseMessage("Search resumes by provider name")
  // searchByProviderName(@Query('providerName') providerName: string) {
  //   return this.resumesService.searchByProviderName(providerName);
  // }

  @Post('by-user')
  @SkipCheckPermission()
  @ResponseMessage('Get Resumes by User')
  getResumesByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }

  @Get(':id/payment')
  @SkipCheckPermission()
  @ResponseMessage('Get Payment Link')
  async getPaymentLink(@Param('id') id: string) {
    const resume = await this.resumesService.findOne(id);
    if (!resume) {
      throw new BadRequestException('not found resume');
    }

    if (resume.status === 'Đã hoàn tất') {
      throw new BadRequestException('This resume has already paid');
    }

    const { _id, orderCode } = resume;
    let payment: CheckoutResponseDataType | undefined;
    let newOrderCode = this.resumesService.generateOrderCode();

    const { status } =
      await this.paymentService.getPaymentLinkInformation(orderCode);

    if (status === 'PENDING') {
      console.log('Cancel payment link: ', orderCode);
      await this.paymentService.cancelPaymentLink(orderCode);
    }

    payment = await this.paymentService.createPaymentLink({
      amount: 7000,
      cancelUrl: 'https://sfms.pages.dev/payment/cancel',
      description:
        status === 'Thanh toán lần 2' ? `SMFS - Thanh toán lần 2` : 'SMFS',
      orderCode: newOrderCode,
      returnUrl: 'https://sfms.pages.dev/payment/success',
      items: [
        {
          name: _id.toString(),
          price: 0,
          quantity: 1,
        },
      ],
    });
    await this.resumesService.updateOrderCode(id, newOrderCode);
    return payment;
  }

  @Get(':id')
  @SkipCheckPermission()
  @ResponseMessage('Fetch a resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @SkipCheckPermission()
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
    @Body('note') note: string,
    @User() user: IUser,
  ) {
    try {
      let uploadedFileUrl: string | undefined;
      const resume = await this.resumesService.findOne(id);

      if (!resume) {
        throw new BadRequestException('not found resume');
      }

      const { _id, orderCode } = resume;

      if (file) {
        const uploadedFileResponse =
          await this.cloudinaryService.uploadFile(file);
        uploadedFileUrl = uploadedFileResponse.url;
      }

      let payment: CheckoutResponseDataType | undefined;
      let newOrderCode = orderCode;

      console.log('Status: ', status);
      console.log('OrderCode: ', orderCode);
      console.log('will payment: ', status === 'Thanh toán lần 2');
      if (status === 'Thanh toán lần 2') {
        newOrderCode = this.resumesService.generateOrderCode();
        payment = await this.paymentService.createPaymentLink({
          amount: 7000,
          cancelUrl: 'https://sfms.pages.dev/payment/cancel',
          description: `SMFS - Thanh toán lần 2`,
          orderCode: newOrderCode,
          returnUrl: 'https://sfms.pages.dev/payment/success',
          items: [
            {
              name: _id.toString(),
              price: 0,
              quantity: 1,
            },
          ],
        });
      }

      return this.resumesService
        .update(id, status, uploadedFileUrl, note, user, newOrderCode)
        .then((res) => ({
          ...res,
          payment,
        }));
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }
  @Patch(':id/staff')
  @ResponseMessage('Update staff for a resume')
  async updateStaff(
    @Param('id') id: string,
    @Body('staff') staff: string,
    @User() user: IUser,
  ) {
    try {
      const staffId = new Types.ObjectId(staff); // Correctly convert staff to ObjectId
      return this.resumesService.updateStaff(id, staffId, user);
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  @ResponseMessage("Delete a resume")
  @SkipCheckPermission()
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
