import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config'; // <= dodane
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {AgentsController} from './agents/agents.controller';
import {AuthController} from './auth/auth.controller';
import {AgentsService} from './agents/agents.service';
import {PrismaService} from './prisma/prisma.service';
import {AuthModule} from './auth/auth.module';
import {ImportController} from './import/import.controller';
import {DataFinderController} from "./dataFinder/dataFinder.controller";
import {OpenAIService}  from "./services/openai/openai.service";
import {SerpapiService}    from "./services/serp/serpapi.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // dzięki temu nie trzeba importować ConfigModule w innych modułach
        }),
        AuthModule,

    ],
    controllers: [
        AppController,
        AgentsController,
        AuthController,
        ImportController,
        DataFinderController
    ],
    providers: [
        AppService,
        AgentsService,
        PrismaService,
        OpenAIService,
        SerpapiService
    ],
})
export class AppModule {
}
