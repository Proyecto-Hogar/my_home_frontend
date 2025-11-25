import {EnumMapper} from "@/mappers/enum.mapper";
import {SubsidyEntity, SubsidyResponse, SubsidyTypesEnum} from "@/types/subsidy.types";

export const mapSubsidyFromResponse = (dto: SubsidyResponse): SubsidyEntity => ({
    id: dto.id,
    name: EnumMapper.mapStringToEnum(
        dto.name,
        SubsidyTypesEnum,
        SubsidyTypesEnum.BONO_BUEN_PAGADOR,
    ),
    loanProgramId: dto.loanProgramId,
    isActive: dto.isActive,
});

export const mapSubsidiesFromResponse = (
    dtos: SubsidyResponse[],
): SubsidyEntity[] => dtos.map(mapSubsidyFromResponse);
