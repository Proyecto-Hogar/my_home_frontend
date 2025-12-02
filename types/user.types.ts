import {RoleEntity} from "@/types/role.types";

// -------------- ENUMS --------------
export enum AccountStatusEnum {
    ACTIVE = 'ACTIVE',
    LOCKED = 'LOCKED',
    PENDING_ACTIVATION = 'PENDING_ACTIVATION'
}

// -------------- ENTITY --------------
export interface UserEntity {
    id: string;
    email: string;
    username: string;
    password: string;
    accountStatus: AccountStatusEnum;
    failedLoginAttempts: number;
    lastLoginAt: Date | null;
    passwordChangedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    hasProfile: boolean;
    roles: RoleEntity[];
    token?: string;
}

// -------------- RESPONSE DTO (backend → frontend) --------------
export interface UserResponse {
    id: string | null;
    email: string | null;
    username: string | null;
    status: string | null;
    failedLoginAttempts: number | null;
    lastLoginAt: string | null;
    passwordChangedAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
    roles: string[] | null;
}

// -------------- CREATE REQUEST DTO --------------
export interface CreateUserRequest {
    email: string;
    username: string;
    roles: string[];
    districtId: string;
}
