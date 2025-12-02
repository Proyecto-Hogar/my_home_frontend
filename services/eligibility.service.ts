import {BaseService} from "./base.service";

import type {
    EligibilityEntity,
    EligibilityResponse,
    EligibilityWithPropertyEntity,
    EligibilityWithPropertyResponse,
} from "@/types/eligibility.types";

import {mapEligibilityFromResponse, mapEligibilityWithPropertyFromResponse,} from "@/mappers/eligibility.mapper";

export class EligibilityService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/loan-programs/eligibility";
    }

    async validate(customerId: string): Promise<EligibilityEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/validate`, { customerId });
        const response = await this.request<EligibilityResponse>(url, {
            method: "POST",
        });

        return mapEligibilityFromResponse(response);
    }

    async validateWithProperty(
        customerId: string,
        propertyId: string
    ): Promise<EligibilityWithPropertyEntity> {
        const url = this.buildUrl(
            `${this.resourceEndpoint}/validate-with-property`,
            { customerId, propertyId }
        );

        const response = await this.request<EligibilityWithPropertyResponse>(url, {
            method: "POST",
        });

        return mapEligibilityWithPropertyFromResponse(response);
    }
}

let eligibilityServiceInstance: EligibilityService | null = null;

export const getEligibilityService = (): EligibilityService => {
    if (!eligibilityServiceInstance) {
        eligibilityServiceInstance = new EligibilityService();
    }
    return eligibilityServiceInstance;
};
