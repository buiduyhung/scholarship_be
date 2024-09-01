import { Controller, Post, Body, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schemas';
import { Scholarship, ScholarshipDocument } from 'src/scholarship/schemas/scholarship.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService,
    private readonly mailerService: MailerService,

    @InjectModel(Scholarship.name)
    private readonly scholarshipModel: SoftDeleteModel<ScholarshipDocument>,

    @InjectModel(Subscriber.name)
    private readonly subscriberModel: SoftDeleteModel<SubscriberDocument>
  ) { }


  @Get()
  // @Cron(CronExpression.EVERY_30_SECONDS)
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  @Public()
  @ResponseMessage("Send email to subscriber")
  async handleTestEmail() {
    try {
      const subscribers = await this.subscriberModel.find({});
      for (const subs of subscribers) {
        const subsSubject = subs.subject;
        const subsLevel = subs.level;
        // Build the query based on available data
        const query: any = {};
        if (subsSubject?.length) query.subject = { $in: subsSubject };
        if (subsLevel?.length) query.level = { $in: subsLevel };
        const Matching = await this.scholarshipModel.find(query).populate('provider', 'name');
        if (Matching?.length) {
          const scholarship = Matching.map(item => {
            return {
              name: item.name,
              provider: item.provider.name,
              subject: item.subject,
              location: item.location,
              type: item.type,
              level: item.level,
            }
          });
          await this.mailerService.sendMail({
            to: subs.email,
            from: '"Support Team" <support@example.com>',
            subject: 'Welcome to Nice App! Confirm your Email',
            template: 'test',
            context: {
              receiver: subs.name,
              scholarship: scholarship
            }
          });
          // Use the scholarship variable if needed
        }
      }

    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
