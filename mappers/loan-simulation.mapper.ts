import {EnumMapper} from "@/mappers/enum.mapper";
import {
    CapitalizationPeriodEnum,
    CurrencyEnum,
    GracePeriodEntity,
    GracePeriodResponse,
    GraceTypeEnum,
    InstallmentEntity,
    InstallmentResponse,
    InterestRateEntity,
    InterestRateResponse,
    LoanParametersEntity,
    LoanParametersResponse,
    LoanSimulationEntity,
    LoanSimulationResponse,
    MoneyEntity,
    MoneyResponse,
    PaymentPlanEntity,
    PaymentPlanResponse,
    RateTypeEnum,
    SimulationStatusEnum,
    SubsidyEntityLoan,
    SubsidyLoanResponse
} from "@/types/loan-simulation.types";

// -------- MONEY --------
export const mapMoney = (dto: MoneyResponse): MoneyEntity => ({
    amount: dto.amount,
    currency: EnumMapper.mapStringToEnum(dto.currency, CurrencyEnum, CurrencyEnum.PEN),
});

// -------- INTEREST RATE --------
export const mapInterestRate = (dto: InterestRateResponse): InterestRateEntity => ({
    rate: dto.rate,
    type: EnumMapper.mapStringToEnum(dto.type, RateTypeEnum, RateTypeEnum.EFFECTIVE),
    capitalizationPeriod: dto.capitalizationPeriod
        ? EnumMapper.mapStringToEnum(dto.capitalizationPeriod, CapitalizationPeriodEnum, CapitalizationPeriodEnum.MONTHLY)
        : null,
});

// -------- GRACE PERIOD --------
export const mapGracePeriod = (dto: GracePeriodResponse): GracePeriodEntity => ({
    durationInMonths: dto.durationInMonths,
    type: EnumMapper.mapStringToEnum(dto.type, GraceTypeEnum, GraceTypeEnum.TOTAL),
});

// -------- PARAMETERS --------
export const mapParameters = (dto: LoanParametersResponse): LoanParametersEntity => ({
    propertyPrice: mapMoney(dto.propertyPrice),
    initialDownPayment: mapMoney(dto.initialDownPayment),
    loanAmount: mapMoney(dto.loanAmount),
    termInMonths: dto.termInMonths,
    currency: EnumMapper.mapStringToEnum(dto.currency, CurrencyEnum, CurrencyEnum.PEN),
    interestRate: mapInterestRate(dto.interestRate),
    gracePeriod: mapGracePeriod(dto.gracePeriod),
});

// -------- INSTALLMENT --------
export const mapInstallment = (dto: InstallmentResponse): InstallmentEntity => ({
    id: dto.id,
    installmentNumber: dto.installmentNumber,
    dueDate: dto.dueDate,
    initialBalance: mapMoney(dto.initialBalance),
    interest: mapMoney(dto.interest),
    amortization: mapMoney(dto.amortization),
    otherCosts: mapMoney(dto.otherCosts),
    totalPayment: mapMoney(dto.totalPayment),
    finalBalance: mapMoney(dto.finalBalance),
});

// -------- SUBSIDY --------
export const mapSubsidy = (dto: SubsidyLoanResponse): SubsidyEntityLoan => ({
    id: dto.id,
    subsidyConfigId: dto.subsidyConfigId,
    name: dto.name,
    amount: mapMoney(dto.amount),
    simulationId: dto.simulationId,
});

// -------- PAYMENT PLAN --------
export const mapPaymentPlan = (dto: PaymentPlanResponse): PaymentPlanEntity => ({
    id: dto.id,
    simulationId: dto.simulationId,
    tcea: dto.tcea,
    van: mapMoney(dto.van),
    tir: dto.tir,
    monthlyPayment: mapMoney(dto.monthlyPayment),
    installments: dto.installments.map(mapInstallment),
});

// -------- SIMULATION --------
export const mapLoanSimulation = (dto: LoanSimulationResponse): LoanSimulationEntity => ({
    id: dto.id,
    customerId: dto.customerId,
    propertyId: dto.propertyId,
    institutionId: dto.institutionId,
    loanProgramId: dto.loanProgramId,
    simulationDate: dto.simulationDate,
    expiresAt: dto.expiresAt,
    status: EnumMapper.mapStringToEnum(dto.status, SimulationStatusEnum, SimulationStatusEnum.DRAFT),
    parameters: mapParameters(dto.parameters),
    paymentPlan: dto.paymentPlan ? mapPaymentPlan(dto.paymentPlan) : null,
    subsidies: dto.subsidies.map(mapSubsidy),
});
