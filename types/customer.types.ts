// -------------- ENUMS --------------
export enum CustomerStatusEnum {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    INACTIVE = 'INACTIVE'
}

export enum MaritalStatusEnum {
    SINGLE = 'SINGLE',
    MARRIED = 'MARRIED',
    DIVORCED = 'DIVORCED',
    WIDOWED = 'WIDOWED',
    COHABITING = 'COHABITING'
}

export enum EducationLevelEnum {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY',
    TECHNICAL = 'TECHNICAL',
    UNIVERSITY = 'UNIVERSITY',
    POSTGRADUATE = 'POSTGRADUATE'
}

export enum EmploymentTypeEnum {
    DEPENDENT = 'DEPENDENT',
    INDEPENDENT = 'INDEPENDENT',
    RETIRED = 'RETIRED',
    UNEMPLOYED = 'UNEMPLOYED'
}

export enum FundOriginTypeEnum {
    FINANCIAL_SYSTEM_SAVINGS = 'FINANCIAL_SYSTEM_SAVINGS',
    PERSONAL_SAVINGS = 'PERSONAL_SAVINGS',
    FAMILY_SUPPORT = 'FAMILY_SUPPORT',
    SALE_OF_ASSETS = 'SALE_OF_ASSETS',
    INHERITANCE = 'INHERITANCE',
    OTHER = 'OTHER'
}

// -------------- ENTITY --------------
export interface CustomerEntity {
    id: string;

    status: CustomerStatusEnum;

    fullName: {
        firstName: string;
        lastName: string;
        middleName: string | null;
        fullName: string;
    };

    contactInfo: {
        phoneNumber: string;
        email: string;
        address: {
            street: string;
            district: string;
            province: string;
            department: string;
            zipCode: string;
            fullAddress: string;
        };
    };

    demographics: {
        birthDate: string;
        maritalStatus: MaritalStatusEnum;
        nationality: string;
        educationLevel: EducationLevelEnum;
        age: number;
    };

    residency: {
        isPermanentResident: boolean;
        residenceCardNumber: string | null;
    };

    employmentInfo: {
        occupation: string;
        profession: string;
        employmentType: EmploymentTypeEnum;
    };

    financialSummary: {
        monthlyIncomeAmount: number;
        monthlyIncomeCurrency: string;
        monthlyExpensesAmount: number;
        monthlyExpensesCurrency: string;
        netIncome: number;
    };

    creditProfile: {
        hasOtherLoans: boolean;
        creditScore: number | null;
        hasGoodCredit: boolean;
    };

    familyDetails: {
        totalFamilyIncomeAmount: number;
        totalFamilyIncomeCurrency: string;
        dependents: number;
        hasWheelchairUser: boolean;
        familySize: number;
        spouse: {
            firstName: string | null;
            lastName: string | null;
            documentType: string | null;
            documentNumber: string | null;
            occupation: string | null;
            monthlyIncomeAmount: number | null;
            monthlyIncomeCurrency: string | null;
            hasSpouse: boolean;
        };
    };

    hasOtherProperties: boolean;
    hasReceivedStateHousingSupport: boolean;
    stateHousingSupportDetails: string | null;
    fundOrigin: FundOriginTypeEnum;
    fundOriginOther: string | null;

    isEligibleForLoan: boolean;
}

// -------------- RESPONSE DTO --------------
export interface CustomerResponse {
    id: string;
    status: string;

    firstName: string;
    lastName: string;
    middleName: string | null;
    fullName: string;

    phoneNumber: string;
    email: string;

    street: string;
    district: string;
    province: string;
    department: string;
    zipCode: string;
    fullAddress: string;

    birthDate: string;
    maritalStatus: string;
    nationality: string;
    educationLevel: string;
    age: number;

    isPermanentResident: boolean;
    residenceCardNumber: string | null;

    occupation: string;
    profession: string;
    employmentType: string;

    monthlyIncomeAmount: number;
    monthlyIncomeCurrency: string;
    monthlyExpensesAmount: number;
    monthlyExpensesCurrency: string;
    netIncome: number;

    hasOtherLoans: boolean;
    creditScore: number | null;
    hasGoodCredit: boolean;

    totalFamilyIncomeAmount: number;
    totalFamilyIncomeCurrency: string;
    dependents: number;
    hasWheelchairUser: boolean;
    familySize: number;

    spouseFirstName: string | null;
    spouseLastName: string | null;
    spouseDocumentType: string | null;
    spouseDocumentNumber: string | null;
    spouseOccupation: string | null;
    spouseMonthlyIncomeAmount: number | null;
    spouseMonthlyIncomeCurrency: string | null;
    hasSpouse: boolean;

    hasOtherProperties: boolean;
    hasReceivedStateHousingSupport: boolean;
    stateHousingSupportDetails: string | null;
    fundOrigin: string;
    fundOriginOther: string | null;

    isEligibleForLoan: boolean;
}

// -------------- CREATE REQUEST --------------
export interface CreateCustomerRequest {
    firstName: string;
    lastName: string;
    middleName: string | null;

    phoneNumber: string;
    email: string;

    street: string;
    district: string;
    province: string;
    department: string;
    zipCode: string;

    birthDate: string;
    maritalStatus: MaritalStatusEnum;
    nationality: string;
    educationLevel: EducationLevelEnum;

    isPermanentResident: boolean;
    residenceCardNumber: string | null;

    occupation: string;
    profession: string;
    employmentType: EmploymentTypeEnum;

    monthlyIncomeAmount: number;
    monthlyIncomeCurrency: string;
    monthlyExpensesAmount: number;
    monthlyExpensesCurrency: string;

    hasOtherLoans: boolean;
    creditScore: number | null;

    totalFamilyIncomeAmount: number;
    totalFamilyIncomeCurrency: string;
    dependents: number;
    hasWheelchairUser: boolean;

    spouseFirstName: string | null;
    spouseLastName: string | null;
    spouseDocumentType: string | null;
    spouseDocumentNumber: string | null;
    spouseOccupation: string | null;
    spouseMonthlyIncomeAmount: number | null;
    spouseMonthlyIncomeCurrency: string | null;

    hasOtherProperties: boolean;
    hasReceivedStateHousingSupport: boolean;
    stateHousingSupportDetails: string | null;
    fundOrigin: FundOriginTypeEnum;
    fundOriginOther: string | null;
}
