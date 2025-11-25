import {EnumMapper} from "@/mappers/enum.mapper";
import {
    CreateCustomerRequest,
    CustomerEntity,
    CustomerResponse,
    CustomerStatusEnum,
    EducationLevelEnum, EmploymentTypeEnum, FundOriginTypeEnum,
    MaritalStatusEnum
} from "@/types/customer.types";


export const mapCustomerFromResponse = (dto: CustomerResponse): CustomerEntity => ({
    id: dto.id,

    status: EnumMapper.mapStringToEnum(dto.status, CustomerStatusEnum, CustomerStatusEnum.ACTIVE),

    fullName: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        fullName: dto.fullName,
    },

    contactInfo: {
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        address: {
            street: dto.street,
            district: dto.district,
            province: dto.province,
            department: dto.department,
            zipCode: dto.zipCode,
            fullAddress: dto.fullAddress,
        },
    },

    demographics: {
        birthDate: dto.birthDate,
        maritalStatus: EnumMapper.mapStringToEnum(
            dto.maritalStatus,
            MaritalStatusEnum,
            MaritalStatusEnum.SINGLE
        ),
        nationality: dto.nationality,
        educationLevel: EnumMapper.mapStringToEnum(
            dto.educationLevel,
            EducationLevelEnum,
            EducationLevelEnum.PRIMARY
        ),
        age: dto.age,
    },

    residency: {
        isPermanentResident: dto.isPermanentResident,
        residenceCardNumber: dto.residenceCardNumber,
    },

    employmentInfo: {
        occupation: dto.occupation,
        profession: dto.profession,
        employmentType: EnumMapper.mapStringToEnum(
            dto.employmentType,
            EmploymentTypeEnum,
            EmploymentTypeEnum.DEPENDENT
        ),
    },

    financialSummary: {
        monthlyIncomeAmount: Number(dto.monthlyIncomeAmount),
        monthlyIncomeCurrency: dto.monthlyIncomeCurrency,
        monthlyExpensesAmount: Number(dto.monthlyExpensesAmount),
        monthlyExpensesCurrency: dto.monthlyExpensesCurrency,
        netIncome: Number(dto.netIncome),
    },

    creditProfile: {
        hasOtherLoans: dto.hasOtherLoans,
        creditScore: dto.creditScore,
        hasGoodCredit: dto.hasGoodCredit,
    },

    familyDetails: {
        totalFamilyIncomeAmount: Number(dto.totalFamilyIncomeAmount),
        totalFamilyIncomeCurrency: dto.totalFamilyIncomeCurrency,
        dependents: dto.dependents,
        hasWheelchairUser: dto.hasWheelchairUser,
        familySize: dto.familySize,
        spouse: {
            firstName: dto.spouseFirstName,
            lastName: dto.spouseLastName,
            documentType: dto.spouseDocumentType,
            documentNumber: dto.spouseDocumentNumber,
            occupation: dto.spouseOccupation,
            monthlyIncomeAmount: dto.spouseMonthlyIncomeAmount
                ? Number(dto.spouseMonthlyIncomeAmount)
                : null,
            monthlyIncomeCurrency: dto.spouseMonthlyIncomeCurrency,
            hasSpouse: dto.hasSpouse,
        },
    },

    hasOtherProperties: dto.hasOtherProperties,
    hasReceivedStateHousingSupport: dto.hasReceivedStateHousingSupport,
    stateHousingSupportDetails: dto.stateHousingSupportDetails,

    fundOrigin: EnumMapper.mapStringToEnum(
        dto.fundOrigin,
        FundOriginTypeEnum,
        FundOriginTypeEnum.OTHER
    ),

    fundOriginOther: dto.fundOriginOther,

    isEligibleForLoan: dto.isEligibleForLoan,
});

// ------------------- MAPPER ENTITY → CREATE REQUEST -------------------
export const mapCustomerToCreateRequest = (
    e: CreateCustomerRequest
): Record<string, string | number | boolean | null | string []> => ({
    firstName: e.firstName,
    lastName: e.lastName,
    middleName: e.middleName,

    phoneNumber: e.phoneNumber,
    email: e.email,

    street: e.street,
    district: e.district,
    province: e.province,
    department: e.department,
    zipCode: e.zipCode,

    birthDate: e.birthDate,
    maritalStatus: EnumMapper.mapEnumToString(e.maritalStatus),
    nationality: e.nationality,
    educationLevel: EnumMapper.mapEnumToString(e.educationLevel),

    isPermanentResident: e.isPermanentResident,
    residenceCardNumber: e.residenceCardNumber,

    occupation: e.occupation,
    profession: e.profession,
    employmentType: EnumMapper.mapEnumToString(e.employmentType),

    monthlyIncomeAmount: e.monthlyIncomeAmount,
    monthlyIncomeCurrency: e.monthlyIncomeCurrency,
    monthlyExpensesAmount: e.monthlyExpensesAmount,
    monthlyExpensesCurrency: e.monthlyExpensesCurrency,

    hasOtherLoans: e.hasOtherLoans,
    creditScore: e.creditScore,

    totalFamilyIncomeAmount: e.totalFamilyIncomeAmount,
    totalFamilyIncomeCurrency: e.totalFamilyIncomeCurrency,
    dependents: e.dependents,
    hasWheelchairUser: e.hasWheelchairUser,

    spouseFirstName: e.spouseFirstName,
    spouseLastName: e.spouseLastName,
    spouseDocumentType: e.spouseDocumentType,
    spouseDocumentNumber: e.spouseDocumentNumber,
    spouseOccupation: e.spouseOccupation,
    spouseMonthlyIncomeAmount: e.spouseMonthlyIncomeAmount,
    spouseMonthlyIncomeCurrency: e.spouseMonthlyIncomeCurrency,

    hasOtherProperties: e.hasOtherProperties,
    hasReceivedStateHousingSupport: e.hasReceivedStateHousingSupport,
    stateHousingSupportDetails: e.stateHousingSupportDetails,

    fundOrigin: EnumMapper.mapEnumToString(e.fundOrigin),
    fundOriginOther: e.fundOriginOther,
});
