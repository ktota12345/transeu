import { Injectable, OnModuleInit  } from '@nestjs/common';
import {TransEuApiAppService} from "./trans-eu-api-app.service";

import axiosTranseu, { setupAxiosTranseu } from './axios-transeu';
import { TransEuAuthService } from '../../transeu-auth/trans-eu-auth.service';

@Injectable()
export class TransEuApiClientService  implements OnModuleInit {
    constructor(private transEuAuthService: TransEuAuthService) {}

    onModuleInit() {
        setupAxiosTranseu(this.transEuAuthService);
    }

    async test(){
        const res = await axiosTranseu.get('/ext/fleet-api/v1/vehicles');
        return res.data;


    }
}
