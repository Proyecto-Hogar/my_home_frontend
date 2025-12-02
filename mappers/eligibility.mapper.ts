

// -------- BONO --------
import {
    BonoEligibilityEntity,
    BonoEligibilityResponse, EligibilityEntity, EligibilityResponse,
    EligibilityWithPropertyEntity, EligibilityWithPropertyResponse,
    MiViviendaEligibilityEntity,
    MiViviendaEligibilityResponse, TechoPropioEligibilityEntity, TechoPropioEligibilityResponse
} from "@/types/eligibility.types";
import {EnumMapper} from "@/mappers/enum.mapper";
import {SubsidyTypesEnum} from "@/types/subsidy.types";

export const mapBonoEligibilityFromResponse = (
    dto: BonoEligibilityResponse,
): BonoEligibilityEntity => ({
    type: EnumMapper.mapStringToEnum(
        dto.type,
        SubsidyTypesEnum,
        SubsidyTypesEnum.BONO_BUEN_PAGADOR,
    ),
    amount: dto.amount,
    currency: dto.currency,
    eligible: dto.eligible,
    priceRange: dto.priceRange,
    reason: dto.reason,
    failureReason: dto.failureReason,
});

// -------- MIVIVIENDA --------
export const mapMiViviendaEligibilityFromResponse = (
    dto: MiViviendaEligibilityResponse,
): MiViviendaEligibilityEntity => ({
    eligible: dto.eligible,
    reasons: dto.reasons ?? [],
    failureReasons: dto.failureReasons ?? [],
    availableBonos: dto.availableBonos
        ? dto.availableBonos.map(mapBonoEligibilityFromResponse)
        : [],
});

// -------- TECHO PROPIO --------
export const mapTechoPropioEligibilityFromResponse = (
    dto: TechoPropioEligibilityResponse,
): TechoPropioEligibilityEntity => ({
    eligible: dto.eligible,
    reasons: dto.reasons ?? [],
    failureReasons: dto.failureReasons ?? [],
    modalidad: dto.modalidad ?? null,
    availableBonos: dto.availableBonos
        ? dto.availableBonos.map(mapBonoEligibilityFromResponse)
        : [],
});

// -------- ELIGIBILITY (sin propiedad) --------
export const mapEligibilityFromResponse = (
    dto: EligibilityResponse,
): EligibilityEntity => ({
    customerId: dto.customerId,
    mivivienda: mapMiViviendaEligibilityFromResponse(dto.mivivienda),
    techoPropio: mapTechoPropioEligibilityFromResponse(dto.techoPropio),
});

// -------- ELIGIBILITY (con propiedad) --------
export const mapEligibilityWithPropertyFromResponse = (
    dto: EligibilityWithPropertyResponse,
): EligibilityWithPropertyEntity => ({
    customerId: dto.customerId,
    propertyId: dto.propertyId,
    mivivienda: mapMiViviendaEligibilityFromResponse(dto.mivivienda),
    techoPropio: mapTechoPropioEligibilityFromResponse(dto.techoPropio),
});
