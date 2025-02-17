import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CsvService } from './utils/csv.service';
import { MongoService } from './utils/mongo.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
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
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return an array', async () => {
      const result = await appController.getAssignmentList(0, 0);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
