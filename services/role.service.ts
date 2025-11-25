import {BaseService} from "./base.service";
import type {RoleEntity, RoleResponse} from "@/types/role.types";
import {mapRolesFromResponse} from "@/mappers/role.mapper";

export class RoleService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/roles";
    }

    async getAll(): Promise<RoleEntity[]> {
        const url = this.buildUrl(this.resourceEndpoint);
        const response = await this.request<RoleResponse[]>(url, {
            method: "GET",
        });

        return mapRolesFromResponse(response);
    }
}

let roleServiceInstance: RoleService | null = null;

export const getRoleService = (): RoleService => {
    if (!roleServiceInstance) {
        roleServiceInstance = new RoleService();
    }
    return roleServiceInstance;
};
