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

    async uploadPrimaryImage(propertyId: string, file: File): Promise<PropertyEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/${propertyId}/primary-image`);

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(url, {
            method: "POST",
            body: formData,
        });

        const text = await res.text();
        const data: PropertyResponse = text ? JSON.parse(text) : null;

        if (!res.ok || !data) {
            const message =
                (data as any)?.message ?? `Error al subir la imagen (${res.status})`;
            throw new Error(message);
        }

        return mapPropertyFromResponse(data);
    }

}

let propertyServiceInstance: PropertyService | null = null;

export const getPropertyService = (): PropertyService => {
    if (!propertyServiceInstance) {
        propertyServiceInstance = new PropertyService();
    }
    return propertyServiceInstance;
};
