import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { UpdateFileDto } from './dto/update-file.dto';
import { FilesService } from './files.service';
import { MulterConfigService } from './multer.config';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly multerConfigService: MulterConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // @Public()
  // @Post('upload')
  // @ResponseMessage('Uploaded Single file')
  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 60)
  // @UseInterceptors(FileInterceptor('fileUpload'))
  // // @UseFilters(new HttpExceptionFilter())
  // uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   return {
  //     fileName: file.filename,
  //   };
  // }

  // @Public()
  // @Post('upload-multiple')
  // @UseGuards(ThrottlerGuard)
  // @Throttle(5, 60)
  // @ResponseMessage('Uploaded Multiple files')
  // @UseInterceptors(
  //   FilesInterceptor(
  //     'fileUpload',
  //     10,
  //     new MulterConfigService().createMulterOptions({
  //       fileSize: 1024 * 1024 * 20,
  //     }),
  //   ),
  // )
  // // @UseFilters(new HttpExceptionFilter())
  // uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
  //   if (files.length > 10) {
  //     throw new HttpException(
  //       'Too many files uploaded. Maximum limit is 10.',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   return {
  //     files: files.map((file) => file.filename),
  //   };
  // }

  @Public()
  @Post('image')
  @ResponseMessage('Uploaded only file')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 1024 * 1024 * 5, // 5MB,
        files: 1, //  1 file only
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    console.log({ file });
    return this.cloudinaryService.uploadFile(file);
  }

  @Public()
  @Post('images')
  @ResponseMessage('Uploaded Multiple files')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      // Allow up to 10 files
      limits: {
        fileSize: 1024 * 1024 * 20, // 20MB total size limit,
      },
    }),
  )
  async uploadImages(@UploadedFiles() files: Array<Express.Multer.File>) {
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }
    const uploadResults = await Promise.all(
      files.map((file) => this.cloudinaryService.uploadFile(file)),
    );
    return uploadResults;
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
