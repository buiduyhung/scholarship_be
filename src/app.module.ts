import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { ChatModule } from 'src/chat/chat.module';
import { AdvisoryModule } from './advisory/advisory.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { DatabasesModule } from './databases/databases.module';
import { FilesModule } from './files/files.module';
import { HealthModule } from './health/health.module';
import { InvitationModule } from './invitation/invitation.module';
import { MailModule } from './mail/mail.module';
import { PayOSModule } from './payos/payos.module';
import { PermissionsModule } from './permissions/permissions.module';
import { ProviderModule } from './provider/providers.module';
import { QuestionModule } from './question/question.module';
import { QuizModule } from './quiz/quiz.module';
import { ResumesModule } from './resumes/resumes.module';
import { RolesModule } from './roles/roles.module';
import { ScholarshipModule } from './scholarship/scholarship.module';
import { StudyModule } from './study/study.module';
import { SubscribersModule } from './subscribers/subscribers.module';
import { UsersModule } from './users/users.module';
import { CrawlerModule } from './crawler/crawler.module';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 5,
    }),
    // MongooseModule.forRoot('mongodb+srv://root:anhteo2002@cluster0.r3vvrwe.mongodb.net/'),
    MongooseModule.forRootAsync({
      // load bat dong bo
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    UsersModule,
    AuthModule,
    ProviderModule,
    ScholarshipModule,
    FilesModule,
    ResumesModule,
    PermissionsModule,
    RolesModule,
    DatabasesModule,
    SubscribersModule,
    MailModule,
    HealthModule,
    InvitationModule,
    AdvisoryModule,
    PayOSModule,
    CloudinaryModule,
    StudyModule,
    ChatModule,
    QuestionModule,
    QuizModule,
    BlogModule,
    CrawlerModule,
    NewsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
