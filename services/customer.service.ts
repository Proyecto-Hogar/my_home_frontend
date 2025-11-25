import {BaseService} from "./base.service";
import type {CreateCustomerRequest, CustomerEntity, CustomerResponse,} from "@/types/customer.types";
import {mapCustomerFromResponse, mapCustomerToCreateRequest,} from "@/mappers/customer.mapper";

export class CustomerService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "customers";
    }

    async getAll(): Promise<CustomerEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<CustomerResponse[]>(url, {
            method: "GET",
        });

        return response.map(mapCustomerFromResponse);
    }

    async getById(id: string): Promise<CustomerEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/${id}`);
        const response = await this.request<CustomerResponse>(url, {
            method: "GET",
        });

        return mapCustomerFromResponse(response);
    }

    async create(data: CreateCustomerRequest): Promise<CustomerEntity> {
        const body = mapCustomerToCreateRequest(data);
        const url = this.buildUrl(this.resourceEndpoint);

        const response = await this.request<CustomerResponse>(url, {
            method: "POST",
            body: JSON.stringify(body),
        });

        return mapCustomerFromResponse(response);
    }

    async update(id: string, data: CreateCustomerRequest): Promise<CustomerEntity> {
        const body = mapCustomerToCreateRequest(data);
        const url = this.buildUrl(`${this.resourceEndpoint}/${id}`);

        const response = await this.request<CustomerResponse>(url, {
            method: "PUT",
            body: JSON.stringify(body),
        });

        return mapCustomerFromResponse(response);
    }

    async suspend(id: string): Promise<CustomerEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/${id}/suspend`);
        const response = await this.request<CustomerResponse>(url, {
            method: "PATCH",
        });

        return mapCustomerFromResponse(response);
    }

    async activate(id: string): Promise<CustomerEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/${id}/activate`);
        const response = await this.request<CustomerResponse>(url, {
            method: "PATCH",
        });

        return mapCustomerFromResponse(response);
    }
}

let customerServiceInstance: CustomerService | null = null;

export const getCustomerService = (): CustomerService => {
    if (!customerServiceInstance) {
        customerServiceInstance = new CustomerService();
    }
    return customerServiceInstance;
};
