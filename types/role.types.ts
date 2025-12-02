// -------------- ENUM --------------
export enum RolesEnum {
    ROLE_ADMINISTRATOR = 'ROLE_ADMINISTRATOR',
}

// -------------- ENTITY --------------
export interface RoleEntity {
    id: string;
    name: RolesEnum;
}

// -------------- RESPONSE DTO --------------
export interface RoleResponse {
    id: string | null;
    name: string | null;
}
