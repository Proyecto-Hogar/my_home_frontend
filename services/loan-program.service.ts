import {BaseService} from "./base.service";
import type {LoanProgramEntity, LoanProgramResponse,} from "@/types/loan-program.types";
import {mapLoanProgramsFromResponse} from "@/mappers/loan-program.mapper";

export class LoanProgramService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/loan-programs";
    }

    async getAll(): Promise<LoanProgramEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<LoanProgramResponse[]>(url, {
            method: "GET",
        });

        return mapLoanProgramsFromResponse(response);
    }
}

let loanProgramServiceInstance: LoanProgramService | null = null;

export const getLoanProgramService = (): LoanProgramService => {
    if (!loanProgramServiceInstance) {
        loanProgramServiceInstance = new LoanProgramService();
    }
    return loanProgramServiceInstance;
};
