import { Module } from '@nestjs/common';
import { ProviderService } from './providers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider, ProviderSchema } from './schemas/providers.schemas';
import { ProvidersController } from './providers.controller';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Provider.name, schema: ProviderSchema },
    { name: User.name, schema: UserSchema }

  ])],
  controllers: [ProvidersController],
  providers: [ProviderService],
  exports: [ProviderService]
})
export class ProviderModule { }
