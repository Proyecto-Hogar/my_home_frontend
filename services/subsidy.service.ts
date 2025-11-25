import {BaseService} from "./base.service";
import type {SubsidyEntity, SubsidyResponse} from "@/types/subsidy.types";
import {mapSubsidiesFromResponse} from "@/mappers/subsidy.mapper";

export class SubsidyService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/loan-programs/subsidies";
    }

    async getAll(): Promise<SubsidyEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<SubsidyResponse[]>(url, {
            method: "GET",
        });

        return mapSubsidiesFromResponse(response);
    }
}

let subsidyServiceInstance: SubsidyService | null = null;

export const getSubsidyService = (): SubsidyService => {
    if (!subsidyServiceInstance) {
        subsidyServiceInstance = new SubsidyService();
    }
    return subsidyServiceInstance;
};
