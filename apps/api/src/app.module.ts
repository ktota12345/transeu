import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <= dodane
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentsController } from './agents/agents.controller';
import { AgentsService } from './agents/agents.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // dzięki temu nie trzeba importować ConfigModule w innych modułach
    }),
  ],
  controllers: [AppController, AgentsController],
  providers: [AppService, AgentsService],
})
export class AppModule {}
