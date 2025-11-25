import {EnumMapper} from "@/mappers/enum.mapper";
import {RoleEntity, RolesEnum} from "@/types/role.types";
import {AccountStatusEnum, CreateUserRequest, UserEntity, UserResponse} from "@/types/user.types";

// -------------- MAP SINGLE ROLE --------------
export const mapRoleFromString = (name: string): RoleEntity => ({
    id: '',
    name: EnumMapper.mapStringToEnum(name, RolesEnum, RolesEnum.ROLE_ADMINISTRATOR),
});

// -------------- MAP USER FROM RESPONSE --------------
export const mapUserFromResponse = (dto: UserResponse): UserEntity => ({
    id: dto.id ?? '',
    email: dto.email ?? '',
    username: dto.username ?? '',
    accountStatus: EnumMapper.mapStringToEnum(
        dto.status,
        AccountStatusEnum,
        AccountStatusEnum.PENDING_ACTIVATION
    ),
    failedLoginAttempts: dto.failedLoginAttempts ?? 0,
    lastLoginAt: dto.lastLoginAt ? new Date(dto.lastLoginAt) : null,
    passwordChangedAt: dto.passwordChangedAt ? new Date(dto.passwordChangedAt) : null,
    createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null,
    hasProfile: false, // no viene del backend
    roles: dto.roles ? dto.roles.map((r) => mapRoleFromString(r)) : [],
    password: '',
    token: '',
});

// -------------- MAP ARRAY --------------
export const mapUsersFromResponse = (dtos: UserResponse[]): UserEntity[] =>
    dtos.map((dto) => mapUserFromResponse(dto));

// -------------- MAP CREATE REQUEST --------------
export const mapUserToCreateRequest = (data: {
    email: string;
    username: string;
    roles: RolesEnum[];
    districtId: string;
}): CreateUserRequest => ({
    email: data.email,
    username: data.username,
    roles: data.roles.map((r) => EnumMapper.mapEnumToString(r)),
    districtId: data.districtId,
});
