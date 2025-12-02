// ---------------- ENUM ----------------
export enum FinancialInstitutionsEnum {
    // Banks (Bancos)
    BBVA = 'BBVA',
    BCP = 'BCP',
    INTERBANK = 'INTERBANK',
    SCOTIABANK = 'SCOTIABANK',
    BANBIF = 'BANBIF',
    PICHINCHA = 'PICHINCHA',
    BANCO_COMERCIO = 'BANCO_COMERCIO',
    VIVELA = 'VIVELA',
    SANTANDER = 'SANTANDER',
    BANCO_NACION = 'BANCO_NACION',
    FALABELLA = 'FALABELLA',

    // Municipal Savings Banks (Cajas Municipales)
    CAJA_AREQUIPA = 'CAJA_AREQUIPA',
    CAJA_CUSCO = 'CAJA_CUSCO',
    CAJA_TRUJILLO = 'CAJA_TRUJILLO',
    CAJA_PIURA = 'CAJA_PIURA',
    CAJA_HUANCAYO = 'CAJA_HUANCAYO',
    CAJA_ICA = 'CAJA_ICA',
    CAJA_MAYNAS = 'CAJA_MAYNAS',

    // Finance Companies (Financieras)
    FINANCIERA_CREDISCOTIA = 'FINANCIERA_CREDISCOTIA',
    FINANCIERA_EFECTIVA = 'FINANCIERA_EFECTIVA',
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
