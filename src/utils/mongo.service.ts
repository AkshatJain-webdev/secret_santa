import { Injectable, InternalServerErrorException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class MongoService implements OnModuleInit, OnModuleDestroy {
  mongoClient: MongoClient;

  async onModuleInit() {
    try {
      const mongoUri = 'mongodb://localhost:27017/secret_santa';
      this.mongoClient = await MongoClient.connect(mongoUri);
      await this.mongoClient.connect();
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw new InternalServerErrorException(error);
    }
  }

  async onModuleDestroy() {
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
  }
}
