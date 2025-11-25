// -------- ENUMS --------
export enum SubsidyTypesEnum {
    BONO_BUEN_PAGADOR = 'BONO_BUEN_PAGADOR',
    BFH_COMPRA = 'BFH_COMPRA',
    BFH_CONSTRUCCION = 'BFH_CONSTRUCCION',
    BFH_MEJORA = 'BFH_MEJORA',
    BONO_INTEGRADOR = 'BONO_INTEGRADOR',
    BONO_VERDE = 'BONO_VERDE',
}

// -------- ENTITIES --------
export interface SubsidyEntity {
    id: string;
    name: SubsidyTypesEnum;
    loanProgramId: string;
    isActive: boolean;
}

// -------- RESPONSES (backend -> FE) --------
export interface SubsidyResponse {
    id: string;
    name: string;
    loanProgramId: string;
    isActive: boolean;
}
