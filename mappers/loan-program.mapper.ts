import {LoanProgramEntity, LoanProgramResponse, LoanProgramsEnum} from "@/types/loan-program.types";
import {EnumMapper} from "@/mappers/enum.mapper";


export const mapLoanProgramFromResponse = (
    dto: LoanProgramResponse,
): LoanProgramEntity => ({
    id: dto.id,
    name: EnumMapper.mapStringToEnum(
        dto.name,
        LoanProgramsEnum,
        LoanProgramsEnum.NUEVO_CREDITO_MIVIVIENDA,
    ),
});

export const mapLoanProgramsFromResponse = (
    dtos: LoanProgramResponse[],
): LoanProgramEntity[] => dtos.map(mapLoanProgramFromResponse);
