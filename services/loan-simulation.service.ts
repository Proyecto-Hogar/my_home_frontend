import {BaseService} from "./base.service";
import type {
    CreateSimulationRequest,
    LoanSimulationEntity,
    LoanSimulationResponse,
} from "@/types/loan-simulation.types";

import {mapLoanSimulation} from "@/mappers/loan-simulation.mapper";

export class LoanSimulationService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/simulations";
    }

    async create(payload: CreateSimulationRequest): Promise<LoanSimulationEntity> {
        const url = this.buildUrl(this.resourceEndpoint);

        const response = await this.request<LoanSimulationResponse>(url, {
            method: "POST",
            body: JSON.stringify(payload),
        });

        return mapLoanSimulation(response);
    }

    async getAll(): Promise<LoanSimulationEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<LoanSimulationResponse[]>(url, {
            method: "GET",
        });

        return response.map(mapLoanSimulation);
    }

    async getById(id: string): Promise<LoanSimulationEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/${id}`);
        const response = await this.request<LoanSimulationResponse>(url, {
            method: "GET",
        });

        return mapLoanSimulation(response);
    }
}

let loanSimulationServiceInstance: LoanSimulationService | null = null;

export const getLoanSimulationService = (): LoanSimulationService => {
    if (!loanSimulationServiceInstance) {
        loanSimulationServiceInstance = new LoanSimulationService();
    }
    return loanSimulationServiceInstance;
};
