import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CollabGateway } from './collab/collab.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [AppController],
  providers: [AppService, CollabGateway],
})
export class AppModule {}

