import {
    FinancialInstitutionEntity,
    FinancialInstitutionResponse,
    FinancialInstitutionsEnum, InstitutionRateEntity, InstitutionRateResponse, RateRangeEntity, RateRangeResponse
} from "@/types/financial-institution.types";
import {EnumMapper} from "@/mappers/enum.mapper";

// ------------------ INSTITUTION MAPPER ------------------
export const mapFinancialInstitutionFromResponse = (
    dto: FinancialInstitutionResponse
): FinancialInstitutionEntity => ({
    id: dto.id,
    name: EnumMapper.mapStringToEnum(
        dto.name,
        FinancialInstitutionsEnum,
        FinancialInstitutionsEnum.BCP
    ),
    isActive: dto.isActive,
});

export const mapFinancialInstitutionsFromResponse = (
    dtos: FinancialInstitutionResponse[]
): FinancialInstitutionEntity[] => dtos.map(mapFinancialInstitutionFromResponse);

// ------------------ RATE RANGE MAPPER ------------------
export const mapRateRangeFromResponse = (
    dto: RateRangeResponse
): RateRangeEntity => ({
    minRate: dto.minRate,
    maxRate: dto.maxRate,
    message: dto.message,
});

// ------------------ INSTITUTION RATE MAPPER ------------------
export const mapInstitutionRateFromResponse = (
    dto: InstitutionRateResponse
): InstitutionRateEntity => ({
    institutionId: dto.institutionId,
    institutionName: dto.institutionName,
    minRate: dto.minRate,
    maxRate: dto.maxRate,
    insuranceRate: dto.insuranceRate,
    offersRequestedRate: dto.offersRequestedRate,
});

export const mapInstitutionRatesFromResponse = (
    dtos: InstitutionRateResponse[]
): InstitutionRateEntity[] => dtos.map(mapInstitutionRateFromResponse);
