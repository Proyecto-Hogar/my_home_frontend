import {BaseService} from "./base.service";
import type {UserEntity, UserResponse} from "@/types/user.types";
import {mapUserFromResponse, mapUsersFromResponse, mapUserToCreateRequest,} from "@/mappers/user.mapper";
import type {RolesEnum} from "@/types/role.types";

export class UserService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/users";
    }

    async getAll(): Promise<UserEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<UserResponse[]>(url, {
            method: "GET",
        });

        return mapUsersFromResponse(response);
    }

    async getById(id: string): Promise<UserEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/${id}`);
        const response = await this.request<UserResponse>(url, {
            method: "GET",
        });

        return mapUserFromResponse(response);
    }

    async create(data: {
        email: string;
        username: string;
        roles: RolesEnum[];
        districtId: string;
    }): Promise<UserEntity> {
        const body = mapUserToCreateRequest(data);
        const url = this.buildUrl(this.resourceEndpoint);

        const response = await this.request<UserResponse>(url, {
            method: "POST",
            body: JSON.stringify(body),
        });

        return mapUserFromResponse(response);
    }
}

let userServiceInstance: UserService | null = null;

export const getUserService = (): UserService => {
    if (!userServiceInstance) {
        userServiceInstance = new UserService();
    }
    return userServiceInstance;
};
