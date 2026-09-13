import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UploadService } from './upload.service';

function customFilename(req: any, file: Express.Multer.File, callback: (error: Error | null, filename: string) => void) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname).toLowerCase();
  const cleanBase = path
    .basename(file.originalname, ext)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  callback(null, `${cleanBase}-${uniqueSuffix}${ext}`);
}

const fileFilter = (req: any, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
  // Permitir imágenes y documentos estándar (PDF, JPG, PNG, WEBP, DOCX)
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new BadRequestException('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WEBP) o documentos (PDF, DOC).'), false);
  }
};

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: customFilename,
      }),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15 MB máximo
      },
      fileFilter,
    }),
  )
  uploadSingle(@UploadedFile() file: Express.Multer.File) {
    return this.uploadService.processUploadedFile(file);
  }

  @Post('multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: customFilename,
      }),
      limits: {
        fileSize: 15 * 1024 * 1024,
      },
      fileFilter,
    }),
  )
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se han subido archivos');
    }
    return {
      success: true,
      count: files.length,
      files: files.map((f) => this.uploadService.processUploadedFile(f)),
    };
  }
}
