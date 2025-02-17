import * as fs from 'fs';
import * as path from 'path';
import * as fastCsv from 'fast-csv';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CsvService {
  async readAndValidateCsv(
    file: Express.Multer.File,
    requiredColumns: string[],
    uniqueKeys?: string[]
  ): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      let missingColumns: string[] = [];
      const uniqueKeyMapper: Record<string, Record<string, number>> = {};
      if (uniqueKeys?.length > 0) {
        uniqueKeys.forEach((key) => {
          uniqueKeyMapper[key] = {};
        });
      }

      const stream = fastCsv
        .parse({ headers: true })
        .on('error', (error) => {
          reject(new BadRequestException(`CSV parsing error: ${error.message}`));
        })
        .on('headers', (headers) => {
          missingColumns = requiredColumns.filter((col) => !headers.includes(col));
          if (missingColumns.length > 0) {
            reject(new BadRequestException(`Missing required columns: ${missingColumns.join(', ')}`));
          }
        })
        .on('data', (row) => {
          if (uniqueKeys?.length > 0) {
            uniqueKeys.forEach((key) => {
              if (uniqueKeyMapper[key][row[key]] === undefined) {
                uniqueKeyMapper[key][row[key]] = 1;
              } else {
                reject(
                  new BadRequestException(
                    `Duplicate value found for unique column: ${key} in row: ${JSON.stringify(row)}`
                  )
                );
              }
            });
          }
          results.push(row);
        })
        .on('end', () => {
          resolve(results);
        });

      stream.write(file.buffer);
      stream.end();
    });
  }

  async writeCsvFile(data: any[], fileName: string): Promise<{ size: number }> {
    return new Promise((resolve, reject) => {
      const filePath = path.join(__dirname, '../..', 'app_files', fileName.concat('.csv'));

      fastCsv
        .writeToPath(filePath, data, { headers: true })
        .on('finish', () => {
          console.log(`CSV file written successfully: ${filePath}`);
          fs.stat(filePath, (err, stats) => {
            if (err) {
              console.error('Error getting file size:', err);
            }
            resolve({ size: stats?.size ?? 0 });
          });
        })
        .on('error', (err) => {
          console.error('Error writing CSV:', err);
          reject(err);
        });
    });
  }

  async saveFile(fileName: string, file: Express.Multer.File): Promise<void> {
    const filePath = path.join(__dirname, '../..', 'app_files', fileName.concat(path.extname(file.originalname)));
    try {
      fs.writeFileSync(filePath, file.buffer);
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(`Error saving file: ${file.originalname}`);
    }
  }
}
