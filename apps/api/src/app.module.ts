import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <= dodane
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentsController } from './agents/agents.controller';
import { AgentsService } from './agents/agents.service';
import { TypeOrmModule } from '@nestjs/typeorm'
import { PrismaService } from './prisma/prisma.service';
console.log(process.env.DB_HOST );
console.log(process.env.DB_USERNAME  );
console.log(process.env.DB_PASSWORD  );
console.log(process.env.DB_NAME  );

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // dzięki temu nie trzeba importować ConfigModule w innych modułach
    }),

  ],
  controllers: [AppController, AgentsController],
  providers: [AppService, AgentsService, PrismaService],
})
export class AppModule {}
