import { IsNotEmpty } from 'class-validator';

//data transfer object
export class CreatePermissionDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    apiPath: string;

    @IsNotEmpty()
    method: string;

    @IsNotEmpty()
    module: string;


}
