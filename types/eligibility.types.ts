import {SubsidyTypesEnum} from "@/types/subsidy.types";

// -------- BONO ELIGIBILITY --------
export interface BonoEligibilityResponse {
    type: string; // SubsidyTypes
    amount: number | null;
    currency: string | null;
    eligible: boolean;
    priceRange: string | null;
    reason: string | null;
    failureReason: string | null;
}

export interface BonoEligibilityEntity {
    type: SubsidyTypesEnum;
    amount: number | null;
    currency: string | null;
    eligible: boolean;
    priceRange: string | null;
    reason: string | null;
    failureReason: string | null;
}

// -------- MIVIVIENDA --------
export interface MiViviendaEligibilityResponse {
    eligible: boolean;
    reasons: string[];
    failureReasons: string[];
    availableBonos: BonoEligibilityResponse[];
}

export interface MiViviendaEligibilityEntity {
    eligible: boolean;
    reasons: string[];
    failureReasons: string[];
    availableBonos: BonoEligibilityEntity[];
}

// -------- TECHO PROPIO --------
export interface TechoPropioEligibilityResponse {
    eligible: boolean;
    reasons: string[];
    failureReasons: string[];
    modalidad: string | null; // COMPRA / CONSTRUCCION
    availableBonos: BonoEligibilityResponse[];
}

export interface TechoPropioEligibilityEntity {
    eligible: boolean;
    reasons: string[];
    failureReasons: string[];
    modalidad: string | null;
    availableBonos: BonoEligibilityEntity[];
}

// -------- ELIGIBILITY RESPONSES --------
export interface EligibilityResponse {
    customerId: string;
    mivivienda: MiViviendaEligibilityResponse;
    techoPropio: TechoPropioEligibilityResponse;
}

export interface EligibilityEntity {
    customerId: string;
    mivivienda: MiViviendaEligibilityEntity;
    techoPropio: TechoPropioEligibilityEntity;
}

export interface EligibilityWithPropertyResponse {
    customerId: string;
    propertyId: string;
    mivivienda: MiViviendaEligibilityResponse;
    techoPropio: TechoPropioEligibilityResponse;
}

export interface EligibilityWithPropertyEntity {
    customerId: string;
    propertyId: string;
    mivivienda: MiViviendaEligibilityEntity;
    techoPropio: TechoPropioEligibilityEntity;
}
