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
import { CarsService } from './cars/cars.service';
import { CarsController } from './cars/cars.controller';
import { CarsModule } from './cars/cars.module';
import {OpenAIService}  from "./services/openai/openai.service";
import {SerpapiService}    from "./services/serp/serpapi.service";
import {DriversModule} from './drivers/drivers.module';
import {CarScheduleOffersModule} from './carScheduleOffers/car-schedule-offers.module';
import {CarSchedulesModule} from "./carSchedules/car-schedules.module";
import { CarriersModule} from "./carriers/carriers.module";
import {SearchScheduleSetupModule } from "./search-schedule-setup/search-schedule-setup.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true, // dzięki temu nie trzeba importować ConfigModule w innych modułach
        }),
        AuthModule,
        CarsModule,
        DriversModule,
        CarScheduleOffersModule,
        CarSchedulesModule,
        CarriersModule,
        SearchScheduleSetupModule,

    ],
    controllers: [
        AppController,
        AgentsController,
        AuthController,
        ImportController,
        DataFinderController,
        CarsController
    ],
    providers: [
        AppService,
        AgentsService,
        PrismaService,
        OpenAIService,
        SerpapiService,
        CarsService
    ],
})
export class AppModule {
}
