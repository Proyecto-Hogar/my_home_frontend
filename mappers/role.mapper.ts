import {EnumMapper} from "@/mappers/enum.mapper";
import {RoleEntity, RoleResponse, RolesEnum} from "@/types/role.types";

// -------------- MAP SINGLE ROLE --------------
export const mapRoleFromResponse = (dto: RoleResponse): RoleEntity => ({
    id: dto.id ?? '',
    name: EnumMapper.mapStringToEnum(
        dto.name,
        RolesEnum,
        RolesEnum.ROLE_ADMINISTRATOR
    ),
});

// -------------- MAP ARRAY --------------
export const mapRolesFromResponse = (dtos: RoleResponse[]): RoleEntity[] =>
    dtos.map(mapRoleFromResponse);
