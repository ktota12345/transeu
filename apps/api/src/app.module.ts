import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <= dodane
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentsController } from './agents/agents.controller';
import { AuthController } from './auth/auth.controller';
import { AgentsService } from './agents/agents.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // dzięki temu nie trzeba importować ConfigModule w innych modułach
    }),
    AuthModule,

  ],
  controllers: [AppController, AgentsController, AuthController],
  providers: [AppService, AgentsService, PrismaService],
})
export class AppModule {}
