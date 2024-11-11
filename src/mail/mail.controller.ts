import { Controller, Post, Body, Get } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from 'src/subscribers/schemas/subscriber.schemas';
import { Scholarship, ScholarshipDocument } from 'src/scholarship/schemas/scholarship.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('mail')
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,
    @InjectModel(Scholarship.name)
    private readonly scholarshipModel: SoftDeleteModel<ScholarshipDocument>,
    @InjectModel(Subscriber.name)
    private readonly subscriberModel: SoftDeleteModel<SubscriberDocument>
  ) { }

  @Get()
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  @Public()
  @ResponseMessage("Send email to subscriber")
  async handleTestEmail() {
    try {
      const subscribers = await this.subscriberModel.find({});
      console.log('Subscribers:', subscribers);

      for (const subs of subscribers) {
        console.log(`Processing subscriber: ${subs.email}`);

        const subsMajor = subs.major;
        const subsLevel = subs.level;

        const query: any = {};
        if (subsMajor?.length) {
          query.major = { $in: subsMajor.map(major => new RegExp(`^${major}$`, 'i')) };
        }
        if (subsLevel?.length) {
          query.level = { $in: subsLevel.map(level => new RegExp(`^${level}$`, 'i')) };
        }

        const Matching = await this.scholarshipModel.find(query);
        console.log(`Matching scholarships for ${subs.email}:`, Matching);

        if (Matching?.length) {
          const scholarship = Matching.map(item => ({
            name: item.name,
            level: item.level,
            major: item.major,
            location: item.location
          }));

          console.log(`Sending email to ${subs.email} with scholarships:`, scholarship);

          await this.mailerService.sendMail({
            to: subs.email,
            from: '"Support Team" <support@example.com>',
            subject: 'Welcome to Nice App! Confirm your Email',
            template: 'scholarship',
            context: {
              receiver: subs.name,
              scholarship: scholarship
            }
          });
          console.log(`Email sent successfully to ${subs.email}`);
        } else {
          console.log(`No matching scholarships found for ${subs.email}`);
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}


