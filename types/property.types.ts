// ---------------- ENUMS ----------------
export enum PropertyStatusEnum {
    AVAILABLE = 'AVAILABLE',
    RESERVED = 'RESERVED',
    SOLD = 'SOLD',
    SUSPENDED = 'SUSPENDED',
}

export enum FinishingQualityEnum {
    BASIC = 'BASIC',
    STANDARD = 'STANDARD',
    PREMIUM = 'PREMIUM',
    LUXURY = 'LUXURY',
}

export enum OrientationEnum {
    NORTH = 'NORTH',
    SOUTH = 'SOUTH',
    EAST = 'EAST',
    WEST = 'WEST',
    NORTHEAST = 'NORTHEAST',
    NORTHWEST = 'NORTHWEST',
    SOUTHEAST = 'SOUTHEAST',
    SOUTHWEST = 'SOUTHWEST',
}

export enum PropertyTypeEnum {
    APARTMENT = 'APARTMENT',
    HOUSE = 'HOUSE',
    DUPLEX = 'DUPLEX',
    TOWNHOUSE = 'TOWNHOUSE',
    PENTHOUSE = 'PENTHOUSE',
    FLAT = 'FLAT',
}


// ---------------- ENTITY (Front-end) ----------------
export interface PropertyEntity {
    id: string;
    projectId: string | null;
    propertyCode: string;

    status: PropertyStatusEnum;

    parking: {
        parkingSpaces: number;
        parkingPriceAmount: number;
        parkingPriceCurrency: string;
        parkingTotalAmount: number;
        parkingTotalCurrency: string;
        hasParking: boolean;
    };

    constructionYear: number | null;

    finishingQuality: FinishingQualityEnum;

    hasBalcony: boolean;
    hasLaundryArea: boolean;

    facing: OrientationEnum | null;

    features: string[];

    propertyType: PropertyTypeEnum;

    bedrooms: number;
    bathrooms: number;
    halfBathrooms: number | null;
    floor: number | null;

    storageRoom: boolean;

    pricing: {
        priceAmount: number;
        priceCurrency: string;
        priceInSoles: number | null;
        priceInSolesCurrency: string | null;
        priceInDollars: number | null;
        priceInDollarsCurrency: string | null;

        builtArea: number;
        totalArea: number;

        pricePerSquareMeterAmount: number;
        pricePerSquareMeterCurrency: string;

        maintenanceFeeAmount: number;
        maintenanceFeeCurrency: string;
    };

    financiability: {
        maxFinanceableAmount: number;
        maxFinanceableCurrency: string;
        isEligibleForMiVivienda: boolean;
        isEligibleForBFH: boolean;
        miViviendaReason: string | null;
    };

    primaryImageFileId: string | null;

    sustainability: {
        hasCertification: boolean;
        certificationType: string | null;
        bonusEligible: boolean;
    };
}


// ---------------- RESPONSE DTO (Backend → FE) ----------------
export interface PropertyResponse {
    id: string;

    projectId: string | null;
    propertyCode: string;

    status: string;

    parking: {
        parkingSpaces: number;
        parkingPrice: { amount: number; currency: string };
        parkingTotal: { amount: number; currency: string };
    };

    constructionYear: number;

    finishingQuality: string;

    hasBalcony: boolean;
    hasLaundryArea: boolean;

    facing: string | null;

    features: string[];

    propertyType: string;

    bedrooms: number;
    bathrooms: number;
    halfBathrooms: number | null;
    floor: number | null;

    storageRoom: boolean;

    pricing: {
        listPrice: {
            amount: { amount: number; currency: string };
            priceInSoles: { amount: number; currency: string } | null;
            priceInDollars: { amount: number; currency: string } | null;
        };

        builtArea: number;
        totalArea: number;

        listPriceCurrency: string;

        pricePerSquareMeter: { amount: number; currency: string };
        maintenanceFee: { amount: number; currency: string };
    };

    financiability: {
        maxFinanceableAmount: { amount: number; currency: string };
        eligibleForMiVivienda: boolean;
        eligibleForBFH: boolean;
        miViviendaIneligibilityReason: string | null;
    };

    primaryImageFileId: string | null;

    sustainability: {
        hasCertification: boolean;
        certificationType: string | null;
        bonusEligible: boolean;
    };

    available: boolean;
    eligibleForBonoVerde: boolean;
}


// ---------------- CREATE REQUEST ----------------
export interface CreatePropertyRequest {
    projectId: string | null;
    propertyCode: string;

    parkingSpaces: number;
    parkingPriceAmount: number;
    parkingCurrency: string;

    constructionYear: number;
    finishingQuality: FinishingQualityEnum;
    hasBalcony: boolean;
    hasLaundryArea: boolean;

    facing: OrientationEnum | null;

    features: string[];

    propertyType: PropertyTypeEnum;

    bedrooms: number;
    bathrooms: number;
    halfBathrooms: number | null;
    floor: number | null;

    storageRoom: boolean;

    priceAmount: number;
    priceCurrency: string;
    builtArea: number;
    totalArea: number;
    maintenanceFeeAmount: number;

    isEligibleForMiVivienda: boolean;

    hasSustainabilityCertification: boolean;
    certificationType: string | null;
}
