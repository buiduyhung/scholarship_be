import { Module } from '@nestjs/common';
import { ProviderService } from './providers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Provider, ProviderSchema } from './schemas/providers.schemas';
import { ProvidersController } from './providers.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Provider.name, schema: ProviderSchema }])],
  controllers: [ProvidersController],
  providers: [ProviderService]
})
export class ProviderModule { }
