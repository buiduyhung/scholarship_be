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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
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
  ) {}

  @Post()
  @ResponseMessage('Create a new resume')
  async create(@Body() createUserCvDto: CreateUserCvDto, @User() user: IUser) {
    const { _id, orderCode, createdAt } = await this.resumesService.create(
      createUserCvDto,
      user,
    );

    const payment = await this.paymentService.createPaymentLink({
      amount: 1000,
      cancelUrl: 'http://localhost:3000/cancel',
      description: `SMFS`,
      orderCode,
      returnUrl: 'http://localhost:3000/success',
      items: [
        {
          name: _id.toString(),
          price: 1000,
          quantity: 1,
        },
      ],
    });

    return { _id, createdAt, payment };
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
    return this.resumesService.updateStatusByOrderCode(orderCode, 'PAID');
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
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @User() user: IUser,
  ) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a resume')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
