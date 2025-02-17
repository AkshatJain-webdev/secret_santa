import { IsString, IsNumber, Min, ValidateNested, validate, IsOptional } from 'class-validator';
import { InternalServerErrorException } from '@nestjs/common';
import { Filter, MongoClient, ObjectId } from 'mongodb';
import { plainToInstance, Type } from 'class-transformer';

class FileMetadataModel {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  size: number;

  @IsString()
  extension: string;

  static build(data: any): FileMetadataModel {
    const file = plainToInstance(FileMetadataModel, { ...data, id: data.id ?? new ObjectId().toString() });
    return file;
  }
}

// Main model to store both the uploaded and generated files
export class FileMappingModel {
  @Type(() => ObjectId)
  private _id: ObjectId = new ObjectId();

  get id(): string {
    return this._id?.toString();
  }

  set id(value: string) {
    this._id = new ObjectId(value);
  }

  @ValidateNested()
  @Type(() => FileMetadataModel)
  employeeFile: FileMetadataModel;

  @ValidateNested()
  @Type(() => FileMetadataModel)
  @IsOptional()
  previousYearFile?: FileMetadataModel;

  @ValidateNested()
  @Type(() => FileMetadataModel)
  generatedFile: FileMetadataModel;

  @IsString()
  date: string = new Date().toISOString();

  static build(data: any): FileMappingModel {
    const rawData = {
      ...data,
      _id: data._id ?? (data.id && ObjectId.isValid(data.id) ? new ObjectId(String(data.id)) : new ObjectId()),
      employeeFile: FileMetadataModel.build(data.employeeFile),
      generatedFile: FileMetadataModel.build(data.generatedFile),
    };
    if (data.previousYearFile != null) {
      rawData.previousYearFile = FileMetadataModel.build(data.previousYearFile);
    }
    return plainToInstance(FileMappingModel, rawData);
  }

  toJSON(): any {
    return { ...this, id: this.id, _id: undefined };
  }

  async validate(): Promise<void> {
    const errors = await validate(this);
    if (errors.length > 0) {
      throw new InternalServerErrorException(
        `Schema validation failed for ${errors[0].property}: ${JSON.stringify(errors[0].constraints)}`
      );
    }
  }

  async save(mongoClient: MongoClient): Promise<void> {
    try {
      await this.validate();
      await mongoClient
        .db()
        .collection('file_mappings')
        .insertOne({ ...this, _id: this._id });
    } catch (err) {
      console.error('Error saving file mapping in DB:', err);
      throw new InternalServerErrorException(err);
    }
  }

  static async getById(id: string, mongoClient: MongoClient): Promise<FileMappingModel | undefined> {
    if (!ObjectId.isValid(id)) {
      throw new InternalServerErrorException('Invalid ID');
    }
    try {
      const document = await mongoClient
        .db()
        .collection('file_mappings')
        .findOne({ _id: new ObjectId(id) });
      return document ? FileMappingModel.build(document) : undefined;
    } catch (err) {
      console.error('Error fetching file mapping by ID:', err);
      throw new InternalServerErrorException(err);
    }
  }

  static async getAll(
    mongoClient: MongoClient,
    filter: Filter<FileMappingModel> = {},
    skip: number = 0,
    limit: number = 10,
    sort: { field: 'date' | 'name'; order: 'asc' | 'desc' } = { field: 'date', order: 'desc' }
  ): Promise<FileMappingModel[]> {
    try {
      const documents = await mongoClient
        .db()
        .collection('file_mappings')
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ [sort.field]: sort.order === 'asc' ? 1 : -1 })
        .toArray();
      return documents.map((document) => FileMappingModel.build(document));
    } catch (err) {
      console.error('Error fetching all file mappings:', err);
      throw new InternalServerErrorException(err);
    }
  }
}
