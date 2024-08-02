import { IsNotEmpty } from 'class-validator';

export class CreateProviderDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    quantity: number;

    @IsNotEmpty()
    topVN: number;

    @IsNotEmpty()
    topWorld: number;
}
