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

      for (const subs of subscribers) {
        const subsMajor = subs.major;
        const subsLevel = subs.level;
        const subsIelts = subs.ielts;
        const subsGPA = subs.GPA;
        const subsPay = subs.pay;
        const subsValue = subs.value;
        const subsLocation = subs.location;

        const query: any = {};
        if (subsMajor?.length) {
          query.major = { $in: subsMajor.map(major => new RegExp(`^${major}$`, 'i')) };
        }
        if (subsLevel?.length) {
          query.level = { $in: subsLevel.map(level => new RegExp(`^${level}$`, 'i')) };
        }
        if (subsLocation) {
          query.location = new RegExp(`^${subsLocation}$`, 'i');
        }
        if (subsIelts !== undefined) {
          query.ielts = { $lte: subsIelts };
        }
        if (subsGPA !== undefined) {
          query.GPA = { $lte: subsGPA };
        }
        if (subsPay !== undefined) {
          query.pay = { $lte: subsPay };
        }
        if (subsValue !== undefined) {
          query.value = { $lte: subsValue };
        }

        const Matching = await this.scholarshipModel.find(query);

        if (Matching?.length) {
          const scholarship = Matching.map(item => ({
            id: item._id,
            name: item.name,
            level: item.level,
            major: item.major,
            ielts: item.ielts,
            GPA: item.GPA,
            pay: item.pay,
            value: item.value,
            location: item.location
          }));

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
        }
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}


