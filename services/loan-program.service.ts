import {BaseService} from "./base.service";
import type {LoanProgramEntity, LoanProgramResponse,} from "@/types/loan-program.types";
import {mapLoanProgramsFromResponse} from "@/mappers/loan-program.mapper";
import {EligibilityResponse} from "@/types/eligibility.types";

export class LoanProgramService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "loan-programs";
    }

    async getAll(): Promise<LoanProgramEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<LoanProgramResponse[]>(url, {
            method: "GET",
        });

        return mapLoanProgramsFromResponse(response);
    }

    async validateEligibility(customerId: string): Promise<EligibilityResponse> {
        const url = this.buildUrl(
            `${this.resourceEndpoint}/eligibility/validate`,
            { customerId }
        );

        return await this.request<EligibilityResponse>(url, {
            method: "POST",
        });
    }
}

let loanProgramServiceInstance: LoanProgramService | null = null;

export const getLoanProgramService = (): LoanProgramService => {
    if (!loanProgramServiceInstance) {
        loanProgramServiceInstance = new LoanProgramService();
    }
    return loanProgramServiceInstance;
};
