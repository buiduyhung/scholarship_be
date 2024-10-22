import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  UseInterceptors, UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
  UseFilters,
  UploadedFiles,
  UseGuards,
  HttpException
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { HttpExceptionFilter } from 'src/core/http-exception.filter';
import { MulterConfigService } from './multer.config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService,
    private readonly multerConfigService: MulterConfigService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Public()
  @Post('upload')
  @ResponseMessage("Uploaded Single file")
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 60)
  @UseInterceptors(FileInterceptor('fileUpload'))
  // @UseFilters(new HttpExceptionFilter())
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      fileName: file.filename
    }
  }

  @Public()
  @Post('upload-multiple')
  @UseGuards(ThrottlerGuard)
  @Throttle(5, 60)
  @ResponseMessage("Uploaded Multiple files")
  @UseInterceptors(FilesInterceptor('fileUpload', 10, new MulterConfigService().createMulterOptions({ fileSize: 1024 * 1024 * 20 })))
  // @UseFilters(new HttpExceptionFilter())
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    if (files.length > 10) {
      throw new HttpException('Too many files uploaded. Maximum limit is 10.', HttpStatus.BAD_REQUEST);
    }
    return {
      files: files.map(file => file.filename)
    }
  }

  @Public()
  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    // Debug log to check file object
    if (!file || !file.buffer) {
      console.error('File upload failed: No file or buffer present');
      throw new HttpException('File buffer is empty or undefined.', HttpStatus.BAD_REQUEST);
    }
    console.log('File uploaded:', file);

    // Proceed with uploading the file to Cloudinary
    return this.cloudinaryService.uploadFile(file);
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
