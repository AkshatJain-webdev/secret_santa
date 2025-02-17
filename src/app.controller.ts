import { Controller, Get, Param, ParseIntPipe, Post, Query, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileMappingModel } from './data-models/file-mapping.model';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadEmployeeData(@UploadedFiles() files: Express.Multer.File[]): Promise<any> {
    return this.appService.uploadEmployeeData(files);
  }

  @Get('download/:id')
  async downloadGeneratedAssignment(@Param('id') fileMappingId: string, @Res() res: Response): Promise<void> {
    return this.appService.downloadGeneratedAssignment(fileMappingId, res);
  }

  @Get('list')
  async getAssignmentList(
    @Query('skip', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) skip: number,
    @Query('limit', new ParseIntPipe({ errorHttpStatusCode: 400, optional: true })) limit: number
  ): Promise<FileMappingModel[]> {
    return this.appService.getAssignmentList(
      isNaN(skip) ? undefined : Number(skip),
      isNaN(limit) ? undefined : Number(limit)
    );
  }
}
