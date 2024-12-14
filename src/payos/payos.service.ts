import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import PayOS from '@payos/node';
import {
  CheckoutRequestType,
  CheckoutResponseDataType,
  PaymentLinkDataType,
  WebhookDataType,
  WebhookType,
} from '@payos/node/lib/type';
import { IPayOSService } from 'src/payos/interfaces/payos.service.interface';

@Injectable() // Đánh dấu PayOSService là một provider có thể được inject
export class PayOSService implements IPayOSService {
  private payOSClient: PayOS; // Client để giao tiếp với PayOS
  private logger = new Logger('PayOSService'); // Logger để ghi log

  constructor(private configService: ConfigService) {
    // Lấy cấu hình từ ConfigService
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');

    // Khởi tạo PayOS client
    this.payOSClient = new PayOS(clientId, apiKey, checksumKey);
    this.logger.log('Initializing PayOS client with client ID: ' + clientId);
  }

  // Xác minh dữ liệu webhook thanh toán
  verifyPaymentWebhookData(payload: WebhookType): WebhookDataType {
    this.logger.log('Verifying payment webhook data', payload);
    const isVerified = this.payOSClient.verifyPaymentWebhookData(payload);
    this.logger.debug('Payment webhook data verified', isVerified);
    return isVerified;
  }

  // Lấy thông tin liên kết thanh toán
  getPaymentLinkInformation(orderCode: number): Promise<PaymentLinkDataType> {
    this.logger.log('Getting payment link information for', orderCode);
    return this.payOSClient.getPaymentLinkInformation(orderCode);
  }

  // Hủy liên kết thanh toán
  cancelPaymentLink(orderCode: number): Promise<Record<string, any>> {
    return this.payOSClient.cancelPaymentLink(orderCode);
  }

  // Tạo liên kết thanh toán
  async createPaymentLink(
    paymentDetails: CheckoutRequestType,
  ): Promise<CheckoutResponseDataType> {
    this.logger.log('Creating payment link for', paymentDetails.orderCode);
    const paymentLink = await this.payOSClient.createPaymentLink({
      ...paymentDetails,
    });
    this.logger.debug('Payment link created', {
      ...paymentLink,
    });

    return paymentLink;
  }
}
