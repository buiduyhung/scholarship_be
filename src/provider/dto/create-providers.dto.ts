import { IsArray, IsNotEmpty, IsString } from 'class-validator';

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

    @IsNotEmpty()
    logo: string;

    @IsNotEmpty()
    background: string;

    @IsArray()
    @IsString({ each: true })
    gallery: string[];
}
