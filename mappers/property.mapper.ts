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

    // --------------------------------------------------------
    // PARKING
    // --------------------------------------------------------
    parking: {
        parkingSpaces: dto.parking?.parkingSpaces ?? 0,
        parkingPriceAmount: dto.parking?.parkingPrice?.amount ?? 0,
        parkingPriceCurrency: dto.parking?.parkingPrice?.currency ?? "PEN",
        parkingTotalAmount: dto.parking?.parkingTotal?.amount ?? 0,
        parkingTotalCurrency: dto.parking?.parkingTotal?.currency ?? "PEN",
        hasParking: (dto.parking?.parkingSpaces ?? 0) > 0,
    },

    // --------------------------------------------------------
    // BASIC INFO
    // --------------------------------------------------------
    constructionYear: dto.constructionYear ?? null,

    finishingQuality: EnumMapper.mapStringToEnum(
        dto.finishingQuality,
        FinishingQualityEnum,
        FinishingQualityEnum.STANDARD
    ),

    hasBalcony: dto.hasBalcony,
    hasLaundryArea: dto.hasLaundryArea,

    facing: dto.facing
        ? EnumMapper.mapStringToEnum(dto.facing, OrientationEnum, OrientationEnum.NORTH)
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

    // --------------------------------------------------------
    // PRICING
    // --------------------------------------------------------
    pricing: {
        priceAmount: dto.pricing?.listPrice?.amount?.amount ?? 0,
        priceCurrency: dto.pricing?.listPrice?.amount?.currency ?? "PEN",

        priceInSoles: dto.pricing?.listPrice?.priceInSoles?.amount ?? null,
        priceInSolesCurrency: dto.pricing?.listPrice?.priceInSoles?.currency ?? null,

        priceInDollars: dto.pricing?.listPrice?.priceInDollars?.amount ?? null,
        priceInDollarsCurrency: dto.pricing?.listPrice?.priceInDollars?.currency ?? null,

        builtArea: dto.pricing?.builtArea ?? 0,
        totalArea: dto.pricing?.totalArea ?? 0,

        pricePerSquareMeterAmount: dto.pricing?.pricePerSquareMeter?.amount ?? 0,
        pricePerSquareMeterCurrency: dto.pricing?.pricePerSquareMeter?.currency ?? "PEN",

        maintenanceFeeAmount: dto.pricing?.maintenanceFee?.amount ?? 0,
        maintenanceFeeCurrency: dto.pricing?.maintenanceFee?.currency ?? "PEN",
    },

    // --------------------------------------------------------
    // FINANCIABILITY
    // --------------------------------------------------------
    financiability: {
        maxFinanceableAmount: dto.financiability?.maxFinanceableAmount?.amount ?? 0,
        maxFinanceableCurrency: dto.financiability?.maxFinanceableAmount?.currency ?? "PEN",

        isEligibleForMiVivienda: dto.financiability?.eligibleForMiVivienda ?? false,
        isEligibleForBFH: dto.financiability?.eligibleForBFH ?? false,

        miViviendaReason: dto.financiability?.miViviendaIneligibilityReason ?? null,
    },

    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------
    primaryImageFileId: dto.primaryImageFileId ?? null,

    // --------------------------------------------------------
    // SUSTAINABILITY
    // --------------------------------------------------------
    sustainability: {
        hasCertification: dto.sustainability?.hasCertification ?? false,
        certificationType: dto.sustainability?.certificationType ?? null,
        bonusEligible: dto.sustainability?.bonusEligible ?? false,
    },
});

// ---------------------------------------------
// MAP: CreatePropertyRequest (Entity) → backend DTO
// ---------------------------------------------
export const mapPropertyToCreateRequest = (
    req: CreatePropertyRequest
): Record<string, unknown> => ({
    // Básicos
    projectId: req.projectId,
    propertyCode: req.propertyCode,

    // Parking
    parkingSpaces: req.parkingSpaces ?? 0,
    parkingPriceAmount: req.parkingPriceAmount ?? 0,
    parkingCurrency: req.parkingCurrency ?? "PEN",

    // Info base
    constructionYear: req.constructionYear ?? null,
    finishingQuality: EnumMapper.mapEnumToString(req.finishingQuality),
    hasBalcony: req.hasBalcony ?? false,
    hasLaundryArea: req.hasLaundryArea ?? false,

    facing: req.facing ? EnumMapper.mapEnumToString(req.facing) : null,
    features: req.features ?? [],

    // Tipo y distribución
    propertyType: EnumMapper.mapEnumToString(req.propertyType),
    bedrooms: req.bedrooms ?? 0,
    bathrooms: req.bathrooms ?? 0,
    halfBathrooms: req.halfBathrooms ?? 0,
    floor: req.floor ?? 0,
    storageRoom: req.storageRoom ?? false,

    // Precios / áreas
    priceAmount: req.priceAmount ?? 0,
    priceCurrency: req.priceCurrency ?? "PEN",
    builtArea: req.builtArea ?? 0,
    totalArea: req.totalArea ?? 0,
    maintenanceFeeAmount: req.maintenanceFeeAmount ?? 0,

    // MiVivienda
    isEligibleForMiVivienda: req.isEligibleForMiVivienda ?? false,

    // Sostenibilidad
    hasSustainabilityCertification: req.hasSustainabilityCertification ?? false,
    certificationType:
        req.hasSustainabilityCertification && req.certificationType
            ? req.certificationType
            : null,
});