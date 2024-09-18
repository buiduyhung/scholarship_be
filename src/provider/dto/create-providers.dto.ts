import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateProviderDto {

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    city: string;

    @IsNotEmpty()
    info: string;

    @IsNotEmpty()
    part: string;

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

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    gallery: string[];
}
