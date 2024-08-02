import { PartialType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-providers.dto';

export class UpdateProviderDto extends PartialType(CreateProviderDto) { }
