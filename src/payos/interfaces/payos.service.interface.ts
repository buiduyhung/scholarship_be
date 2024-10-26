import {
  CheckoutRequestType,
  WebhookDataType,
  WebhookType,
} from '@payos/node/lib/type';

export interface IPayOSService {
  createPaymentLink(
    paymentDetails: CheckoutRequestType,
  ): Promise<Record<string, any>>;
  getPaymentLinkInformation(orderCode: string): Promise<Record<string, any>>;
  cancelPaymentLink(orderCode: string): Promise<Record<string, any>>;
  verifyPaymentWebhookData(payload: WebhookType): WebhookDataType;
}
