// -------- ENUMS --------
export enum LoanProgramsEnum {
    NUEVO_CREDITO_MIVIVIENDA = 'NUEVO_CREDITO_MIVIVIENDA',
    TECHO_PROPIO = 'TECHO_PROPIO',
}

// -------- ENTITIES --------
export interface LoanProgramEntity {
    id: string;
    name: LoanProgramsEnum;
}

// -------- RESPONSES (backend -> FE) --------
export interface LoanProgramResponse {
    id: string;
    name: string;
}
