// ---------------- ENUM ----------------
export enum FinancialInstitutionsEnum {
    BBVA = 'BBVA',
    BCP = 'BCP',
    INTERBANK = 'INTERBANK',
    SCOTIABANK = 'SCOTIABANK',
    BANBIF = 'BANBIF',
    PICHINCHA = 'PICHINCHA',
    BANCO_COMERCIO = 'BANCO_COMERCIO',
    MIBANCO = 'MIBANCO',

    CAJA_AREQUIPA = 'CAJA_AREQUIPA',
    CAJA_CUSCO = 'CAJA_CUSCO',
    CAJA_TRUJILLO = 'CAJA_TRUJILLO',
    CAJA_PIURA = 'CAJA_PIURA',
    CAJA_HUANCAYO = 'CAJA_HUANCAYO',
    CAJA_ICA = 'CAJA_ICA',
    CAJA_SULLANA = 'CAJA_SULLANA',
    CAJA_TACNA = 'CAJA_TACNA',

    FINANCIERA_CREDISCOTIA = 'FINANCIERA_CREDISCOTIA',
    FINANCIERA_COMPARTAMOS = 'FINANCIERA_COMPARTAMOS',
}

// ---------------- ENTITY ----------------
export interface FinancialInstitutionEntity {
    id: string;
    name: FinancialInstitutionsEnum;
    isActive: boolean;
}

// ---------------- RESPONSE DTO ----------------
export interface FinancialInstitutionResponse {
    id: string;
    name: string;
    isActive: boolean;
}

// ---------------- RATE RANGE DTO ----------------
export interface RateRangeResponse {
    minRate: number;
    maxRate: number;
    message: string;
}

export interface RateRangeEntity {
    minRate: number;
    maxRate: number;
    message: string;
}

// ---------------- INSTITUTION RATE DTO ----------------
export interface InstitutionRateResponse {
    institutionId: string;
    institutionName: string;
    minRate: number;
    maxRate: number;
    insuranceRate: number;
    offersRequestedRate: boolean;
}

export interface InstitutionRateEntity {
    institutionId: string;
    institutionName: string;
    minRate: number;
    maxRate: number;
    insuranceRate: number;
    offersRequestedRate: boolean;
}
