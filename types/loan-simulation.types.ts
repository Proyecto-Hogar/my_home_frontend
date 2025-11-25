// -------- ENUMS --------
export enum SimulationStatusEnum {
    DRAFT = 'DRAFT',
    SAVED = 'SAVED',
    CONVERTED_TO_APPLICATION = 'CONVERTED_TO_APPLICATION',
    EXPIRED = 'EXPIRED',
}

export enum CurrencyEnum {
    PEN = 'PEN',
    USD = 'USD',
}

export enum RateTypeEnum {
    NOMINAL = 'NOMINAL',
    EFFECTIVE = 'EFFECTIVE',
}

export enum CapitalizationPeriodEnum {
    DAILY = 'DAILY',
    BIWEEKLY = 'BIWEEKLY',
    MONTHLY = 'MONTHLY',
    BIMONTHLY = 'BIMONTHLY',
    QUARTERLY = 'QUARTERLY',
    SEMIANNUAL = 'SEMIANNUAL',
    ANNUAL = 'ANNUAL',
}

export enum GraceTypeEnum {
    PARTIAL = 'PARTIAL',
    TOTAL = 'TOTAL',
}

// -------- BASIC VALUE OBJECTS --------
export interface MoneyEntity {
    amount: number;
    currency: CurrencyEnum;
}

export interface MoneyResponse {
    amount: number;
    currency: string;
}

// -------- Interest Rate --------
export interface InterestRateEntity {
    rate: number;
    type: RateTypeEnum;
    capitalizationPeriod: CapitalizationPeriodEnum | null;
}

export interface InterestRateResponse {
    rate: number;
    type: string;
    capitalizationPeriod: string | null;
}

// -------- Grace Period --------
export interface GracePeriodEntity {
    durationInMonths: number;
    type: GraceTypeEnum;
}

export interface GracePeriodResponse {
    durationInMonths: number;
    type: string;
}

// -------- Loan Parameters --------
export interface LoanParametersEntity {
    propertyPrice: MoneyEntity;
    initialDownPayment: MoneyEntity;
    loanAmount: MoneyEntity;
    termInMonths: number;
    currency: CurrencyEnum;
    interestRate: InterestRateEntity;
    gracePeriod: GracePeriodEntity;
    discountRate?: number | null;
}

export interface LoanParametersResponse {
    propertyPrice: MoneyResponse;
    initialDownPayment: MoneyResponse;
    loanAmount: MoneyResponse;
    termInMonths: number;
    currency: string;
    interestRate: InterestRateResponse;
    gracePeriod: GracePeriodResponse;
    discountRate?: number | null;
}

// -------- Installments --------
export interface InstallmentEntity {
    id: string;
    installmentNumber: number;
    dueDate: string;
    initialBalance: MoneyEntity;
    interest: MoneyEntity;
    amortization: MoneyEntity;
    otherCosts: MoneyEntity;
    totalPayment: MoneyEntity;
    finalBalance: MoneyEntity;
}

export interface InstallmentResponse {
    id: string;
    installmentNumber: number;
    dueDate: string;
    initialBalance: MoneyResponse;
    interest: MoneyResponse;
    amortization: MoneyResponse;
    otherCosts: MoneyResponse;
    totalPayment: MoneyResponse;
    finalBalance: MoneyResponse;
}

// -------- Subsidies --------
export interface SubsidyEntityLoan {
    id: string;
    subsidyConfigId: string;
    name: string;
    amount: MoneyEntity;
    simulationId: string;
}

export interface SubsidyLoanResponse {
    id: string;
    subsidyConfigId: string;
    name: string;
    amount: MoneyResponse;
    simulationId: string;
}

// -------- Payment Plan --------
export interface PaymentPlanEntity {
    id: string;
    simulationId: string;
    tcea: number;
    van: MoneyEntity;
    tir: number;
    monthlyPayment: MoneyEntity;
    installments: InstallmentEntity[];
}

export interface PaymentPlanResponse {
    id: string;
    simulationId: string;
    tcea: number;
    van: MoneyResponse;
    tir: number;
    monthlyPayment: MoneyResponse;
    installments: InstallmentResponse[];
}

// -------- Loan Simulation --------
export interface LoanSimulationEntity {
    id: string;
    customerId: string;
    propertyId: string | null;
    institutionId: string;
    loanProgramId: string;
    simulationDate: string;
    expiresAt: string;
    status: SimulationStatusEnum;
    parameters: LoanParametersEntity;
    paymentPlan: PaymentPlanEntity | null;
    subsidies: SubsidyEntityLoan[];
}

export interface LoanSimulationResponse {
    id: string;
    customerId: string;
    propertyId: string | null;
    institutionId: string;
    loanProgramId: string;
    simulationDate: string;
    expiresAt: string;
    status: string;
    parameters: LoanParametersResponse;
    paymentPlan: PaymentPlanResponse | null;
    subsidies: SubsidyLoanResponse[];
}

// -------- Create Simulation --------
export interface CreateSimulationRequest {
    customerId: string;
    propertyId: string | null;
    institutionId: string;
    loanProgramId: string;
    parameters: LoanParametersResponse;
}
