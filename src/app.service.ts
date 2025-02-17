import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { FileMappingModel } from './data-models/file-mapping.model';
import { SecretSantaGame } from './utils/secretSanta';
import { CsvService } from './utils/csv.service';
import { MongoService } from './utils/mongo.service';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AppService {
  private readonly mongoClient: MongoClient;

  constructor(
    private readonly csvService: CsvService,
    private readonly mongoService: MongoService
  ) {
    this.mongoClient = this.mongoService.mongoClient;
  }

  async uploadEmployeeData(files: Express.Multer.File[]): Promise<any> {
    try {
      // Validate CSV
      const employees = await this.csvService.readAndValidateCsv(files[0], ['Employee_Name', 'Employee_EmailID']);
      let previousAssignments = [];
      if (files.length > 1) {
        previousAssignments = await this.csvService.readAndValidateCsv(files[1], [
          'Employee_Name',
          'Employee_EmailID',
          'Secret_Child_Name',
          'Secret_Child_EmailID',
        ]);
      }
      // Save files and structures
      const employeeFile = {
        id: new ObjectId().toString(),
        name: files[0].originalname,
        size: files[0].size,
        extension: files[0].mimetype.split('/')[1],
      };
      await this.csvService.saveFile(employeeFile.id, files[0]);
      const fileMapping: any = { employeeFile };
      if (previousAssignments.length > 0) {
        const previousYearFile = {
          id: new ObjectId().toString(),
          name: files[1].originalname,
          size: files[1].size,
          extension: files[1].mimetype.split('/')[1],
        };
        await this.csvService.saveFile(previousYearFile.id, files[1]);
        fileMapping.previousYearFile = previousYearFile;
      }
      const secretSantaUtil = new SecretSantaGame(employees, previousAssignments);
      const newAssignments = secretSantaUtil.generateAssignments();
      fileMapping.generatedFile = {
        id: new ObjectId().toString(),
        name: 'generated_'.concat(fileMapping.employeeFile.name),
        size: 0,
        extension: 'csv',
      };
      fileMapping.generatedFile.size = (
        await this.csvService.writeCsvFile(newAssignments, fileMapping.generatedFile.id)
      ).size;
      const fileMappingModel = FileMappingModel.build(fileMapping);
      await fileMappingModel.save(this.mongoClient);
      return fileMappingModel.toJSON();
    } catch (err) {
      console.log(err);
      throw err instanceof BadRequestException ? err : new InternalServerErrorException('Something went wrong');
    }
  }

  async downloadGeneratedAssignment(id: string, res: Response) {
    try {
      const fileMapping = await FileMappingModel.getById(id, this.mongoClient);
      if (!fileMapping) throw new NotFoundException('File details not found');

      const filePath = path.join(__dirname, '..', 'app_files', fileMapping.generatedFile.id.concat('.csv'));

      if (!fs.existsSync(filePath))
        throw new NotFoundException(
          'Secret santa assignments not found. Please re-upload the employee and previous year assignment (optional) files'
        );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${fileMapping.generatedFile.name};`);

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (err) {
      console.log(err);
      throw err instanceof BadRequestException || err instanceof NotFoundException
        ? err
        : new InternalServerErrorException('Something went wrong');
    }
  }

  async getAssignmentList(skip?: number, limit?: number): Promise<FileMappingModel[]> {
    try {
      return await FileMappingModel.getAll(this.mongoClient, undefined, skip, limit);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
