import * as path from 'path';
import * as fs from 'fs';
import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvService } from './utils/csv.service';
import { MongoService } from './utils/mongo.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    CsvService,
    {
      provide: MongoService,
      useFactory: async (): Promise<MongoService> => {
        const mongoService = new MongoService();
        await mongoService.onModuleInit(); // Ensure it is fully initialized
        return mongoService;
      },
    },
  ],
})
export class AppModule implements OnModuleInit {
  private readonly filesDir = path.join(__dirname, '..', 'app_files');

  async onModuleInit() {
    this.ensureFilesDirectory();
  }

  private ensureFilesDirectory() {
    if (!fs.existsSync(this.filesDir)) {
      fs.mkdirSync(this.filesDir, { recursive: true });
      console.log(`Created directory: ${this.filesDir}`);
    }
  }
}
