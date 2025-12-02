import {BaseService} from "./base.service";

import type {
    FinancialInstitutionEntity,
    FinancialInstitutionResponse,
    InstitutionRateEntity,
    InstitutionRateResponse,
    RateRangeEntity,
    RateRangeResponse,
} from "@/types/financial-institution.types";

import {
    mapFinancialInstitutionsFromResponse,
    mapInstitutionRateFromResponse,
    mapInstitutionRatesFromResponse,
    mapRateRangeFromResponse,
} from "@/mappers/financial-institution.mapper";

export class FinancialInstitutionService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/institutions";
    }

    async getAll(): Promise<FinancialInstitutionEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<FinancialInstitutionResponse[]>(url, {
            method: "GET",
        });

        return mapFinancialInstitutionsFromResponse(response);
    }

    async getRateRange(loanProgramId: string): Promise<RateRangeEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/rates/range`, {
            loanProgramId,
        });

        const response = await this.request<RateRangeResponse>(url, {
            method: "GET",
        });

        return mapRateRangeFromResponse(response);
    }

    async getAllRates(loanProgramId: string): Promise<InstitutionRateEntity[]> {
        const url = this.buildUrl(`${this.resourceEndpoint}/rates`, {
            loanProgramId,
        });

        const response = await this.request<InstitutionRateResponse[]>(url, {
            method: "GET",
        });

        return mapInstitutionRatesFromResponse(response);
    }

    async searchInstitutionsOfferingRate(
        loanProgramId: string,
        rate: number
    ): Promise<InstitutionRateEntity[]> {
        const url = this.buildUrl(`${this.resourceEndpoint}/rates/search`, {
            loanProgramId,
            rate,
        });

        const response = await this.request<InstitutionRateResponse[]>(url, {
            method: "GET",
        });

        return mapInstitutionRatesFromResponse(response);
    }

    async getInstitutionRate(
        institutionId: string,
        loanProgramId: string
    ): Promise<InstitutionRateEntity> {
        const url = this.buildUrl(
            `${this.resourceEndpoint}/${institutionId}/rates`,
            { loanProgramId }
        );

        const response = await this.request<InstitutionRateResponse>(url, {
            method: "GET",
        });

        return mapInstitutionRateFromResponse(response);
    }
}

let financialInstitutionServiceInstance: FinancialInstitutionService | null = null;

export const getFinancialInstitutionService =
    (): FinancialInstitutionService => {
        if (!financialInstitutionServiceInstance) {
            financialInstitutionServiceInstance = new FinancialInstitutionService();
        }
        return financialInstitutionServiceInstance;
    };
