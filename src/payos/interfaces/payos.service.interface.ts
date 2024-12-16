import {
  CheckoutRequestType, // Loại yêu cầu thanh toán
  WebhookDataType, // Dữ liệu webhook
  WebhookType, // Loại webhook
} from '@payos/node/lib/type';

// Interface cho các chức năng thanh toán của PayOS
export interface IPayOSService {
  createPaymentLink( // Tạo liên kết thanh toán
    paymentDetails: CheckoutRequestType, // Thông tin thanh toán
  ): Promise<Record<string, any>>;

  getPaymentLinkInformation(orderCode: number): Promise<Record<string, any>>; // Lấy thông tin liên kết

  cancelPaymentLink(orderCode: number): Promise<Record<string, any>>; // Hủy liên kết thanh toán

  verifyPaymentWebhookData(payload: WebhookType): WebhookDataType; // Xác minh webhook
}
