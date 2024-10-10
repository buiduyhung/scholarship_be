import { Injectable } from '@nestjs/common';
import PayOS from '@payos/node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PayOSService {
  private payOSClient: any;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('PAYOS_CLIENT_ID');
    const apiKey = this.configService.get<string>('PAYOS_API_KEY');
    const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');


    this.payOSClient = new PayOS(clientId, apiKey, checksumKey);
  }

  async createPaymentLink(paymentDetails: any) {
    try {
      const paymentLink = await this.payOSClient.createPaymentLink(paymentDetails);
      return { success: true, checkoutUrl: paymentLink.checkoutUrl };
    } catch (error) {
      console.error('Payment failed', error);
      return { success: false };
    }
  }
}
