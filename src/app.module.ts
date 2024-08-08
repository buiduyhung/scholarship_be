import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { ProviderModule } from './provider/providers.module';
import { ScholarshipModule } from './scholarship/scholarship.module';


@Module({
  imports: [
    // MongooseModule.forRoot('mongodb+srv://root:anhteo2002@cluster0.r3vvrwe.mongodb.net/'),
    MongooseModule.forRootAsync({  // load bat dong bo 
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URL'),
        connectionFactory: (connection) => {
          connection.plugin(softDeletePlugin);
          return connection;
        }
      }),
      inject: [ConfigService],
    }),

    ConfigModule.forRoot({
      isGlobal: true
    }),

    UsersModule,
    AuthModule,
    ProviderModule,
    ScholarshipModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
