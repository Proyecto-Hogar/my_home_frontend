import {BaseService} from "./base.service";
import type {CreatePropertyRequest, PropertyEntity, PropertyResponse,} from "@/types/property.types";
import {mapPropertyFromResponse, mapPropertyToCreateRequest,} from "@/mappers/property.mapper";

export class PropertyService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/properties";
    }

    async getAll(): Promise<PropertyEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<PropertyResponse[]>(url, {
            method: "GET",
        });

        return response.map(mapPropertyFromResponse);
    }

    async getById(id: string): Promise<PropertyEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/${id}`);
        const response = await this.request<PropertyResponse>(url, {
            method: "GET",
        });

        return mapPropertyFromResponse(response);
    }

    async create(data: CreatePropertyRequest): Promise<PropertyEntity> {
        const body = mapPropertyToCreateRequest(data);
        const url = this.buildUrl(this.resourceEndpoint);

        const response = await this.request<PropertyResponse>(url, {
            method: "POST",
            body: JSON.stringify(body),
        });

        return mapPropertyFromResponse(response);
    }
}

let propertyServiceInstance: PropertyService | null = null;

export const getPropertyService = (): PropertyService => {
    if (!propertyServiceInstance) {
        propertyServiceInstance = new PropertyService();
    }
    return propertyServiceInstance;
};
