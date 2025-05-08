import {Controller, Get, Param} from '@nestjs/common';

@Controller('agents')
export class AgentsController {
    @Get()
    index() {
        return [
            {"id": 1, "name": "Agent Transportowy Premium", "description": "Agent specjalizujący się w transporcie międzynarodowym z pełnym zakresem usług", "isActive": true, "createdAt": "2025-03-18T14:30:00.000Z", "updatedAt": "2025-03-18T14:30:00.000Z", "specializations": ["Transport międzynarodowy", "Transport chłodniczy", "Transport ADR"], "priorityClients": ["Nestle", "Unilever", "P&G"], "cargoTypes": ["Palety", "Chłodnia", "ADR"], "additionalServices": ["Ubezpieczenie cargo", "Śledzenie GPS", "Raportowanie"]}
        ];
    }

}
