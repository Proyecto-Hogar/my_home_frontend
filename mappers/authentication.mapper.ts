import {
    AuthenticatedUserResponse,
    ResetCompletedPasswordResponse,
    SetCompletedInitialPasswordResponse
} from "@/types/authentication.types";
import {AccountStatusEnum, UserEntity} from "@/types/user.types";
import {EnumMapper} from "@/mappers/enum.mapper";
import {RolesEnum} from "@/types/role.types";

// -------------- AUTHENTICATED USER MAPPER --------------
export const mapAuthenticatedUserFromResponse = (
    dto: AuthenticatedUserResponse
): UserEntity => ({
    id: dto.id ?? '',
    email: dto.email ?? '',
    username: dto.username ?? '',
    password: '',
    accountStatus: EnumMapper.mapStringToEnum("", AccountStatusEnum, AccountStatusEnum.ACTIVE),
    failedLoginAttempts: 0,
    lastLoginAt: null,
    passwordChangedAt: null,
    createdAt: null,
    updatedAt: null,
    hasProfile: false,
    roles: [],
    token: dto.token ?? '',
});

export const mapResetCompletedPasswordFromResponse = (
    dto: ResetCompletedPasswordResponse
) => ({
    userId: dto.userId ?? '',
    email: dto.email ?? '',
    roles: dto.roles
        ? dto.roles.map(r =>
            EnumMapper.mapStringToEnum(r, RolesEnum, RolesEnum.ROLE_ADMINISTRATOR)
        )
        : []
});

export const mapSetCompletedInitialPasswordFromResponse = (
    dto: SetCompletedInitialPasswordResponse
) => ({
    userId: dto.userId ?? '',
    email: dto.email ?? '',
    roles: dto.roles
        ? dto.roles.map(r =>
            EnumMapper.mapStringToEnum(r, RolesEnum, RolesEnum.ROLE_ADMINISTRATOR)
        )
        : []
});
