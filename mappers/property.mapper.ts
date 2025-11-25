import {EnumMapper} from "@/mappers/enum.mapper";
import {
    CreatePropertyRequest,
    FinishingQualityEnum,
    OrientationEnum,
    PropertyEntity,
    PropertyResponse,
    PropertyStatusEnum, PropertyTypeEnum
} from "@/types/property.types";

export const mapPropertyFromResponse = (dto: PropertyResponse): PropertyEntity => ({
    id: dto.id,

    projectId: dto.projectId ?? null,
    propertyCode: dto.propertyCode,

    status: EnumMapper.mapStringToEnum(
        dto.status,
        PropertyStatusEnum,
        PropertyStatusEnum.AVAILABLE
    ),

    parking: {
        parkingSpaces: dto.parkingSpaces,
        parkingPriceAmount: dto.parkingPrice.amount,
        parkingPriceCurrency: dto.parkingPrice.currency,
        parkingTotalAmount: dto.parkingTotal.amount,
        parkingTotalCurrency: dto.parkingTotal.currency,
        hasParking: dto.parkingSpaces > 0,
    },

    constructionYear: dto.constructionYear,

    finishingQuality: EnumMapper.mapStringToEnum(
        dto.finishingQuality,
        FinishingQualityEnum,
        FinishingQualityEnum.STANDARD
    ),

    hasBalcony: dto.hasBalcony,
    hasLaundryArea: dto.hasLaundryArea,

    facing: dto.facing
        ? EnumMapper.mapStringToEnum(
            dto.facing,
            OrientationEnum,
            OrientationEnum.NORTH
        )
        : null,

    features: dto.features ?? [],

    propertyType: EnumMapper.mapStringToEnum(
        dto.propertyType,
        PropertyTypeEnum,
        PropertyTypeEnum.APARTMENT
    ),

    bedrooms: dto.bedrooms,
    bathrooms: dto.bathrooms,
    halfBathrooms: dto.halfBathrooms,
    floor: dto.floor,

    storageRoom: dto.storageRoom,

    pricing: {
        priceAmount: dto.pricing.amount,
        priceCurrency: dto.pricing.currency,

        priceInSoles: dto.pricing.priceInSoles,
        priceInSolesCurrency: dto.pricing.priceInSolesCurrency,

        priceInDollars: dto.pricing.priceInDollars,
        priceInDollarsCurrency: dto.pricing.priceInDollarsCurrency,

        builtArea: dto.pricing.builtArea,
        totalArea: dto.pricing.totalArea,

        pricePerSquareMeterAmount: dto.pricing.pricePerSquareMeterAmount,
        pricePerSquareMeterCurrency: dto.pricing.pricePerSquareMeterCurrency,

        maintenanceFeeAmount: dto.pricing.maintenanceFeeAmount,
        maintenanceFeeCurrency: dto.pricing.maintenanceFeeCurrency,
    },

    financiability: {
        maxFinanceableAmount: dto.financiability.maxFinanceableAmount,
        maxFinanceableCurrency: dto.financiability.maxFinanceableCurrency,

        isEligibleForMiVivienda: dto.financiability.eligibleForMiVivienda,
        isEligibleForBFH: dto.financiability.eligibleForBFH,
        miViviendaReason: dto.financiability.miViviendaReason,
    },

    primaryImageFileId: dto.primaryImageFileId ?? null,

    sustainability: {
        hasCertification: dto.sustainability.hasCertification,
        certificationType: dto.sustainability.certificationType,
        bonusEligible: dto.sustainability.bonusEligible,
    },
});

// ---------------------------------------------
// MAP: CreatePropertyRequest (Entity) → backend DTO
// ---------------------------------------------
export const mapPropertyToCreateRequest = (
    req: CreatePropertyRequest
): Record<string, string | number | boolean | null | string []> => ({
    projectId: req.projectId,
    propertyCode: req.propertyCode,

    // Parking
    parkingSpaces: req.parkingSpaces,
    parkingPriceAmount: req.parkingPriceAmount,
    parkingCurrency: req.parkingCurrency,

    // Basic info
    constructionYear: req.constructionYear,
    finishingQuality: EnumMapper.mapEnumToString(req.finishingQuality),
    hasBalcony: req.hasBalcony,
    hasLaundryArea: req.hasLaundryArea,
    facing: req.facing ? EnumMapper.mapEnumToString(req.facing) : null,
    features: req.features,

    // Property type and layout
    propertyType: EnumMapper.mapEnumToString(req.propertyType),
    bedrooms: req.bedrooms,
    bathrooms: req.bathrooms,
    halfBathrooms: req.halfBathrooms,
    floor: req.floor,
    storageRoom: req.storageRoom,

    // Pricing
    priceAmount: req.priceAmount,
    priceCurrency: req.priceCurrency,
    builtArea: req.builtArea,
    totalArea: req.totalArea,
    maintenanceFeeAmount: req.maintenanceFeeAmount,

    // Financiability (backend recalculates)
    isEligibleForMiVivienda: req.isEligibleForMiVivienda,

    // Sustainability
    hasSustainabilityCertification: req.hasSustainabilityCertification,
    certificationType: req.certificationType,
});
