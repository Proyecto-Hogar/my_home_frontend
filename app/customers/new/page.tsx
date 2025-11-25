"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    CreateCustomerRequest,
    EducationLevelEnum,
    EmploymentTypeEnum,
    FundOriginTypeEnum,
    MaritalStatusEnum,
} from "@/types/customer.types";
import { getCustomerService } from "@/services/customer.service";
import { getLoanProgramService } from "@/services/loan-program.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import SidebarLayout from "@/components/layout/SidebarLayout";

const MARITAL_OPTIONS: { value: MaritalStatusEnum; label: string }[] = [
    { value: MaritalStatusEnum.SINGLE, label: "Soltero(a)" },
    { value: MaritalStatusEnum.MARRIED, label: "Casado(a)" },
    { value: MaritalStatusEnum.DIVORCED, label: "Divorciado(a)" },
    { value: MaritalStatusEnum.WIDOWED, label: "Viudo(a)" },
    { value: MaritalStatusEnum.COHABITING, label: "Conviviente" },
];

const EDUCATION_OPTIONS: { value: EducationLevelEnum; label: string }[] = [
    { value: EducationLevelEnum.PRIMARY, label: "Primaria" },
    { value: EducationLevelEnum.SECONDARY, label: "Secundaria" },
    { value: EducationLevelEnum.TECHNICAL, label: "Técnica" },
    { value: EducationLevelEnum.UNIVERSITY, label: "Universitaria" },
    { value: EducationLevelEnum.POSTGRADUATE, label: "Postgrado" },
];

const EMPLOYMENT_OPTIONS: { value: EmploymentTypeEnum; label: string }[] = [
    { value: EmploymentTypeEnum.DEPENDENT, label: "Dependiente" },
    { value: EmploymentTypeEnum.INDEPENDENT, label: "Independiente" },
    { value: EmploymentTypeEnum.RETIRED, label: "Jubilado" },
    { value: EmploymentTypeEnum.UNEMPLOYED, label: "Desempleado" },
];

const FUND_ORIGIN_OPTIONS: { value: FundOriginTypeEnum; label: string }[] = [
    {
        value: FundOriginTypeEnum.FINANCIAL_SYSTEM_SAVINGS,
        label: "Ahorros en Sistema Financiero",
    },
    {
        value: FundOriginTypeEnum.PERSONAL_SAVINGS,
        label: "Ahorros personales",
    },
    {
        value: FundOriginTypeEnum.FAMILY_SUPPORT,
        label: "Apoyo familiar",
    },
    {
        value: FundOriginTypeEnum.SALE_OF_ASSETS,
        label: "Venta de activos",
    },
    {
        value: FundOriginTypeEnum.INHERITANCE,
        label: "Herencia",
    },
    {
        value: FundOriginTypeEnum.OTHER,
        label: "Otro",
    },
];

type Step = 1 | 2 | 3;

interface FormState {
    // personales
    firstName: string;
    lastName: string;
    middleName: string;
    email: string;
    phoneNumber: string;
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
    residenceCardNumber: string;

    // laboral y financiera
    occupation: string;
    profession: string;
    employmentType: EmploymentTypeEnum;
    monthlyIncomeAmount: string;
    monthlyIncomeCurrency: string;
    monthlyExpensesAmount: string;
    monthlyExpensesCurrency: string;
    hasOtherLoans: boolean;
    creditScore: string;
    totalFamilyIncomeAmount: string;
    totalFamilyIncomeCurrency: string;
    dependents: string;
    hasWheelchairUser: boolean;
    hasOtherProperties: boolean;
    hasReceivedStateHousingSupport: boolean;
    stateHousingSupportDetails: string;
    fundOrigin: FundOriginTypeEnum;
    fundOriginOther: string;

    // cónyuge
    spouseFirstName: string;
    spouseLastName: string;
    spouseDocumentType: string;
    spouseDocumentNumber: string;
    spouseOccupation: string;
    spouseMonthlyIncomeAmount: string;
    spouseMonthlyIncomeCurrency: string;
}

const initialState: FormState = {
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phoneNumber: "",
    street: "",
    district: "",
    province: "",
    department: "",
    zipCode: "",
    birthDate: "",
    maritalStatus: MaritalStatusEnum.SINGLE,
    nationality: "Peruana",
    educationLevel: EducationLevelEnum.UNIVERSITY,
    isPermanentResident: true,
    residenceCardNumber: "",

    occupation: "",
    profession: "",
    employmentType: EmploymentTypeEnum.DEPENDENT,
    monthlyIncomeAmount: "",
    monthlyIncomeCurrency: "PEN",
    monthlyExpensesAmount: "",
    monthlyExpensesCurrency: "PEN",
    hasOtherLoans: false,
    creditScore: "",
    totalFamilyIncomeAmount: "",
    totalFamilyIncomeCurrency: "PEN",
    dependents: "0",
    hasWheelchairUser: false,
    hasOtherProperties: false,
    hasReceivedStateHousingSupport: false,
    stateHousingSupportDetails: "",
    fundOrigin: FundOriginTypeEnum.FINANCIAL_SYSTEM_SAVINGS,
    fundOriginOther: "",

    spouseFirstName: "",
    spouseLastName: "",
    spouseDocumentType: "",
    spouseDocumentNumber: "",
    spouseOccupation: "",
    spouseMonthlyIncomeAmount: "",
    spouseMonthlyIncomeCurrency: "PEN",
};

export default function NewCustomerPage() {
    const router = useRouter();
    const customerService = getCustomerService();
    const loanProgramService = getLoanProgramService();

    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState<FormState>(initialState);
    const [submitting, setSubmitting] = useState(false);

    const hasSpouseSection = useMemo(
        () =>
            form.maritalStatus === MaritalStatusEnum.MARRIED ||
            form.maritalStatus === MaritalStatusEnum.COHABITING,
        [form.maritalStatus]
    );

    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    function handleNext() {
        if (step === 1) {
            // validación básica step 1
            if (
                !form.firstName.trim() ||
                !form.lastName.trim() ||
                !form.email.trim() ||
                !form.phoneNumber.trim() ||
                !form.street.trim() ||
                !form.district.trim() ||
                !form.birthDate
            ) {
                toast.error("Completa los campos obligatorios de datos personales.");
                return;
            }
            setStep(2);
        } else if (step === 2) {
            if (
                !form.occupation.trim() ||
                !form.profession.trim() ||
                !form.monthlyIncomeAmount ||
                !form.monthlyExpensesAmount ||
                !form.totalFamilyIncomeAmount
            ) {
                toast.error("Completa los campos obligatorios de información económica.");
                return;
            }
            setStep(3);
        }
    }

    function handleBack() {
        setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as Step)));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (submitting) return;

        // validación final mínima
        if (!form.firstName.trim() || !form.lastName.trim()) {
            toast.error("Faltan datos básicos del cliente.");
            setStep(1);
            return;
        }

        setSubmitting(true);

        try {
            const payload: CreateCustomerRequest = {
                firstName: form.firstName.trim(),
                lastName: form.lastName.trim(),
                middleName: form.middleName.trim() || null,

                phoneNumber: form.phoneNumber.trim(),
                email: form.email.trim(),

                street: form.street.trim(),
                district: form.district.trim(),
                province: form.province.trim(),
                department: form.department.trim(),
                zipCode: form.zipCode.trim(),

                birthDate: form.birthDate,
                maritalStatus: form.maritalStatus,
                nationality: form.nationality.trim(),
                educationLevel: form.educationLevel,

                isPermanentResident: form.isPermanentResident,
                residenceCardNumber:
                    form.residenceCardNumber.trim() || null,

                occupation: form.occupation.trim(),
                profession: form.profession.trim(),
                employmentType: form.employmentType,

                monthlyIncomeAmount: Number(form.monthlyIncomeAmount) || 0,
                monthlyIncomeCurrency: form.monthlyIncomeCurrency,
                monthlyExpensesAmount: Number(form.monthlyExpensesAmount) || 0,
                monthlyExpensesCurrency: form.monthlyExpensesCurrency,

                hasOtherLoans: form.hasOtherLoans,
                creditScore: form.creditScore
                    ? Number(form.creditScore)
                    : null,

                totalFamilyIncomeAmount:
                    Number(form.totalFamilyIncomeAmount) || 0,
                totalFamilyIncomeCurrency: form.totalFamilyIncomeCurrency,
                dependents: Number(form.dependents) || 0,
                hasWheelchairUser: form.hasWheelchairUser,

                spouseFirstName:
                    hasSpouseSection && form.spouseFirstName.trim()
                        ? form.spouseFirstName.trim()
                        : null,
                spouseLastName:
                    hasSpouseSection && form.spouseLastName.trim()
                        ? form.spouseLastName.trim()
                        : null,
                spouseDocumentType:
                    hasSpouseSection && form.spouseDocumentType.trim()
                        ? form.spouseDocumentType.trim()
                        : null,
                spouseDocumentNumber:
                    hasSpouseSection && form.spouseDocumentNumber.trim()
                        ? form.spouseDocumentNumber.trim()
                        : null,
                spouseOccupation:
                    hasSpouseSection && form.spouseOccupation.trim()
                        ? form.spouseOccupation.trim()
                        : null,
                spouseMonthlyIncomeAmount:
                    hasSpouseSection && form.spouseMonthlyIncomeAmount
                        ? Number(form.spouseMonthlyIncomeAmount)
                        : null,
                spouseMonthlyIncomeCurrency:
                    hasSpouseSection && form.spouseMonthlyIncomeAmount
                        ? form.spouseMonthlyIncomeCurrency
                        : null,

                hasOtherProperties: form.hasOtherProperties,
                hasReceivedStateHousingSupport:
                form.hasReceivedStateHousingSupport,
                stateHousingSupportDetails:
                    form.stateHousingSupportDetails.trim() || null,

                fundOrigin: form.fundOrigin,
                fundOriginOther: form.fundOriginOther.trim() || null,
            };

            const customer = await customerService.create(payload);

            toast.success("Cliente registrado", {
                description: `Se registró correctamente a ${customer.fullName.fullName}. Calculando elegibilidad...`,
            });

            // Elegibilidad
            const eligibility =
                await loanProgramService.validateEligibility(customer.id);

            const { mivivienda, techoPropio } = eligibility;

            const mvHeader = mivivienda.eligible
                ? "✅ Nuevo Crédito MiVivienda: ELEGIBLE"
                : "❌ Nuevo Crédito MiVivienda: NO ELEGIBLE";

            const tpHeader = techoPropio.eligible
                ? "✅ Techo Propio: ELEGIBLE"
                : "❌ Techo Propio: NO ELEGIBLE";

            const mvReasons = mivivienda.eligible
                ? mivivienda.reasons
                : mivivienda.failureReasons;

            const tpReasons = techoPropio.eligible
                ? techoPropio.reasons
                : techoPropio.failureReasons;

            const bonosElegibles = mivivienda.availableBonos
                .filter((b) => b.eligible && b.amount != null)
                .map(
                    (b) =>
                        `${b.type}: S/ ${b.amount?.toFixed(2)}${
                            b.reason ? ` - ${b.reason}` : ""
                        }`
                );

            toast.info("Resultado de elegibilidad", {
                description: [
                    mvHeader,
                    mvReasons.length
                        ? `• ${mvReasons.join(" | ")}`
                        : "• Sin detalles.",
                    bonosElegibles.length
                        ? `• Bonos: ${bonosElegibles.join(" | ")}`
                        : "• Sin bonos elegibles.",
                    "",
                    tpHeader,
                    tpReasons.length
                        ? `• ${tpReasons.join(" | ")}`
                        : "• Sin detalles.",
                ].join("\n"),
            });

            // Redirigir a la lista
            setTimeout(() => {
                router.push("/customers");
            }, 1600);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Error al registrar el cliente.";
            toast.error("No se pudo registrar el cliente", {
                description: message,
            });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <SidebarLayout>
            <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Nuevo cliente
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Registra los datos del cliente y obtén su precalificación
                            para los programas de vivienda.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/customers")}
                    >
                        Cancelar
                    </Button>
                </div>

                {/* STEPPER */}
                <div className="mb-6 flex items-center justify-center gap-8">
                    <StepItem
                        label="Información personal y familiar"
                        stepNumber={1}
                        currentStep={step}
                    />
                    <StepItem
                        label="Evaluación socioeconómica y laboral"
                        stepNumber={2}
                        currentStep={step}
                    />
                    <StepItem
                        label="Resumen y precalificación"
                        stepNumber={3}
                        currentStep={step}
                    />
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className="flex-1 space-y-6 rounded-xl border bg-white p-6 shadow-sm"
                >
                    {step === 1 && (
                        <StepPersonal form={form} updateField={updateField} />
                    )}
                    {step === 2 && (
                        <StepEconomic form={form} updateField={updateField} />
                    )}
                    {step === 3 && (
                        <StepSummary
                            form={form}
                            updateField={updateField}
                            hasSpouseSection={hasSpouseSection}
                        />
                    )}

                    {/* FOOTER BUTTONS */}
                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={step === 1 || submitting}
                            onClick={handleBack}
                        >
                            Volver
                        </Button>

                        {step < 3 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={submitting}
                            >
                                Siguiente
                            </Button>
                        ) : (
                            <Button type="submit" disabled={submitting}>
                                {submitting ? "Guardando..." : "Guardar cliente"}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </SidebarLayout>
    );
}

/* ---------- COMPONENTES AUXILIARES ---------- */

function StepItem({
                      label,
                      stepNumber,
                      currentStep,
                  }: {
    label: string;
    stepNumber: Step;
    currentStep: Step;
}) {
    const isActive = currentStep === stepNumber;
    const isDone = currentStep > stepNumber;

    return (
        <div className="flex flex-col items-center text-center">
            <div
                className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold",
                    isActive &&
                    "border-green-500 bg-green-50 text-green-600",
                    isDone && "border-green-500 bg-green-500 text-white",
                    !isActive && !isDone && "border-slate-200 text-slate-400"
                )}
            >
                {isDone ? "✓" : stepNumber}
            </div>
            <p className="mt-2 max-w-[180px] text-xs text-slate-600">
                {label}
            </p>
        </div>
    );
}

function StepPersonal({
                          form,
                          updateField,
                      }: {
    form: FormState;
    updateField: <K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <SectionTitle title="Datos del titular" />

            <div className="grid gap-4 md:grid-cols-3">
                <InputLabeled
                    label="Nombre*"
                    value={form.firstName}
                    onChange={(e) =>
                        updateField("firstName", e.target.value)
                    }
                />
                <InputLabeled
                    label="Apellidos*"
                    value={form.lastName}
                    onChange={(e) =>
                        updateField("lastName", e.target.value)
                    }
                />
                <InputLabeled
                    label="Segundo nombre"
                    value={form.middleName}
                    onChange={(e) =>
                        updateField("middleName", e.target.value)
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Fecha de nacimiento*
                    </label>
                    <Input
                        type="date"
                        value={form.birthDate}
                        onChange={(e) =>
                            updateField("birthDate", e.target.value)
                        }
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Estado civil*
                    </label>
                    <Select
                        value={form.maritalStatus}
                        onValueChange={(value) =>
                            updateField(
                                "maritalStatus",
                                value as MaritalStatusEnum
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {MARITAL_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Nivel educativo*
                    </label>
                    <Select
                        value={form.educationLevel}
                        onValueChange={(value) =>
                            updateField(
                                "educationLevel",
                                value as EducationLevelEnum
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {EDUCATION_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <SectionTitle title="Datos de contacto" />

            <div className="grid gap-4 md:grid-cols-2">
                <InputLabeled
                    label="Correo electrónico*"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                />
                <InputLabeled
                    label="Teléfono de contacto*"
                    value={form.phoneNumber}
                    onChange={(e) =>
                        updateField("phoneNumber", e.target.value)
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <InputLabeled
                    label="Calle / Dirección*"
                    value={form.street}
                    onChange={(e) => updateField("street", e.target.value)}
                />
                <InputLabeled
                    label="Distrito*"
                    value={form.district}
                    onChange={(e) =>
                        updateField("district", e.target.value)
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <InputLabeled
                    label="Provincia*"
                    value={form.province}
                    onChange={(e) =>
                        updateField("province", e.target.value)
                    }
                />
                <InputLabeled
                    label="Departamento*"
                    value={form.department}
                    onChange={(e) =>
                        updateField("department", e.target.value)
                    }
                />
                <InputLabeled
                    label="Código postal"
                    value={form.zipCode}
                    onChange={(e) =>
                        updateField("zipCode", e.target.value)
                    }
                />
            </div>

            <SectionTitle title="Residencia" />

            <div className="grid gap-4 md:grid-cols-[1.2fr,2fr]">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        ¿Es residente permanente?*
                    </label>
                    <div className="flex gap-3 text-xs">
                        <label className="inline-flex items-center gap-1.5">
                            <input
                                type="radio"
                                className="h-3.5 w-3.5"
                                checked={form.isPermanentResident}
                                onChange={() =>
                                    updateField("isPermanentResident", true)
                                }
                            />
                            <span>Sí</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5">
                            <input
                                type="radio"
                                className="h-3.5 w-3.5"
                                checked={!form.isPermanentResident}
                                onChange={() =>
                                    updateField("isPermanentResident", false)
                                }
                            />
                            <span>No</span>
                        </label>
                    </div>
                </div>

                <InputLabeled
                    label="N° de carné de extranjería (si aplica)"
                    value={form.residenceCardNumber}
                    onChange={(e) =>
                        updateField("residenceCardNumber", e.target.value)
                    }
                />
            </div>
        </div>
    );
}

function StepEconomic({
                          form,
                          updateField,
                      }: {
    form: FormState;
    updateField: <K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) => void;
}) {
    return (
        <div className="space-y-6">
            <SectionTitle title="Condición laboral" />

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Actividad económica (titular)*
                    </label>
                    <Select
                        value={form.employmentType}
                        onValueChange={(value) =>
                            updateField(
                                "employmentType",
                                value as EmploymentTypeEnum
                            )
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {EMPLOYMENT_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <InputLabeled
                    label="Profesión / oficio (titular)*"
                    value={form.profession}
                    onChange={(e) =>
                        updateField("profession", e.target.value)
                    }
                />

                <InputLabeled
                    label="Ocupación actual*"
                    value={form.occupation}
                    onChange={(e) =>
                        updateField("occupation", e.target.value)
                    }
                />
            </div>

            <SectionTitle title="Ingresos y gastos" />

            <div className="grid gap-4 md:grid-cols-3">
                <InputLabeled
                    label="Ingreso mensual del titular (S/)*"
                    type="number"
                    value={form.monthlyIncomeAmount}
                    onChange={(e) =>
                        updateField("monthlyIncomeAmount", e.target.value)
                    }
                />
                <InputLabeled
                    label="Gastos mensuales (S/)*"
                    type="number"
                    value={form.monthlyExpensesAmount}
                    onChange={(e) =>
                        updateField("monthlyExpensesAmount", e.target.value)
                    }
                />
                <InputLabeled
                    label="Ingreso familiar total (S/)*"
                    type="number"
                    value={form.totalFamilyIncomeAmount}
                    onChange={(e) =>
                        updateField(
                            "totalFamilyIncomeAmount",
                            e.target.value
                        )
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <InputLabeled
                    label="Número de dependientes*"
                    type="number"
                    value={form.dependents}
                    onChange={(e) =>
                        updateField("dependents", e.target.value)
                    }
                />

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        ¿Algún miembro usa silla de ruedas?*
                    </label>
                    <div className="flex gap-3 text-xs">
                        <label className="inline-flex items-center gap-1.5">
                            <input
                                type="radio"
                                className="h-3.5 w-3.5"
                                checked={form.hasWheelchairUser}
                                onChange={() =>
                                    updateField("hasWheelchairUser", true)
                                }
                            />
                            <span>Sí</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5">
                            <input
                                type="radio"
                                className="h-3.5 w-3.5"
                                checked={!form.hasWheelchairUser}
                                onChange={() =>
                                    updateField("hasWheelchairUser", false)
                                }
                            />
                            <span>No</span>
                        </label>
                    </div>
                </div>

                <InputLabeled
                    label="Score crediticio (opcional)"
                    type="number"
                    value={form.creditScore}
                    onChange={(e) =>
                        updateField("creditScore", e.target.value)
                    }
                />
            </div>

            <SectionTitle title="Declaración de elegibilidad" />

            <div className="grid gap-4 md:grid-cols-3">
                <BooleanRadio
                    label="¿Tiene otras propiedades?*"
                    value={form.hasOtherProperties}
                    onChange={(value) =>
                        updateField("hasOtherProperties", value)
                    }
                />
                <BooleanRadio
                    label="¿Ha recibido apoyo estatal de vivienda?*"
                    value={form.hasReceivedStateHousingSupport}
                    onChange={(value) =>
                        updateField("hasReceivedStateHousingSupport", value)
                    }
                />
                <BooleanRadio
                    label="¿Tiene otros préstamos?*"
                    value={form.hasOtherLoans}
                    onChange={(value) =>
                        updateField("hasOtherLoans", value)
                    }
                />
            </div>

            <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Origen de fondos*
                    </label>
                    <Select
                        value={form.fundOrigin}
                        onValueChange={(value) =>
                            updateField("fundOrigin", value as FundOriginTypeEnum)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            {FUND_ORIGIN_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {form.fundOrigin === FundOriginTypeEnum.OTHER && (
                    <InputLabeled
                        label="Describe el origen de fondos"
                        value={form.fundOriginOther}
                        onChange={(e) =>
                            updateField("fundOriginOther", e.target.value)
                        }
                    />
                )}
            </div>

            {form.hasReceivedStateHousingSupport && (
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                        Detalles del apoyo estatal recibido
                    </label>
                    <Textarea
                        rows={3}
                        value={form.stateHousingSupportDetails}
                        onChange={(e) =>
                            updateField(
                                "stateHousingSupportDetails",
                                e.target.value
                            )
                        }
                    />
                </div>
            )}
        </div>
    );
}

function StepSummary({
                         form,
                         updateField,
                         hasSpouseSection,
                     }: {
    form: FormState;
    updateField: <K extends keyof FormState>(
        key: K,
        value: FormState[K]
    ) => void;
    hasSpouseSection: boolean;
}) {
    const fullName = `${form.firstName} ${form.middleName} ${form.lastName}`
        .replace(/\s+/g, " ")
        .trim();

    return (
        <div className="space-y-6">
            <SectionTitle title="Datos del cónyuge / conviviente" />

            {!hasSpouseSection ? (
                <p className="text-xs text-muted-foreground">
                    Según el estado civil seleccionado, el cliente no requiere
                    datos de cónyuge. Si cambias a &ldquo;Casado&rdquo; o
                    &ldquo;Conviviente&rdquo; podrás ingresar esta información.
                </p>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        <InputLabeled
                            label="Nombres del cónyuge"
                            value={form.spouseFirstName}
                            onChange={(e) =>
                                updateField("spouseFirstName", e.target.value)
                            }
                        />
                        <InputLabeled
                            label="Apellidos del cónyuge"
                            value={form.spouseLastName}
                            onChange={(e) =>
                                updateField("spouseLastName", e.target.value)
                            }
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <InputLabeled
                            label="Tipo de documento"
                            value={form.spouseDocumentType}
                            onChange={(e) =>
                                updateField("spouseDocumentType", e.target.value)
                            }
                            placeholder="DNI, CE, etc."
                        />
                        <InputLabeled
                            label="N° de documento"
                            value={form.spouseDocumentNumber}
                            onChange={(e) =>
                                updateField("spouseDocumentNumber", e.target.value)
                            }
                        />
                        <InputLabeled
                            label="Ocupación"
                            value={form.spouseOccupation}
                            onChange={(e) =>
                                updateField("spouseOccupation", e.target.value)
                            }
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <InputLabeled
                            label="Ingreso mensual del cónyuge (S/)"
                            type="number"
                            value={form.spouseMonthlyIncomeAmount}
                            onChange={(e) =>
                                updateField(
                                    "spouseMonthlyIncomeAmount",
                                    e.target.value
                                )
                            }
                        />
                        <InputLabeled
                            label="Moneda"
                            value={form.spouseMonthlyIncomeCurrency}
                            onChange={(e) =>
                                updateField(
                                    "spouseMonthlyIncomeCurrency",
                                    e.target.value
                                )
                            }
                        />
                    </div>
                </>
            )}

            <SectionTitle title="Resumen del cliente" />

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryField
                    label="Nombre completo"
                    value={fullName || "—"}
                />
                <SummaryField
                    label="Correo"
                    value={form.email || "—"}
                />
                <SummaryField
                    label="Ingreso familiar total (S/)"
                    value={form.totalFamilyIncomeAmount || "—"}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <SummaryField
                    label="Estado civil"
                    value={
                        MARITAL_OPTIONS.find(
                            (x) => x.value === form.maritalStatus
                        )?.label || "—"
                    }
                />
                <SummaryField
                    label="Nivel educativo"
                    value={
                        EDUCATION_OPTIONS.find(
                            (x) => x.value === form.educationLevel
                        )?.label || "—"
                    }
                />
                <SummaryField
                    label="Actividad económica"
                    value={
                        EMPLOYMENT_OPTIONS.find(
                            (x) => x.value === form.employmentType
                        )?.label || "—"
                    }
                />
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
                Al guardar el cliente se realizará automáticamente una
                precalificación para el programa Nuevo Crédito MiVivienda y
                Techo Propio. Verás el resultado en un resumen y en la lista de
                clientes.
            </p>
        </div>
    );
}

/* ---------- MINI COMPONENTES UI ---------- */

function SectionTitle({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-100" />
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {title}
            </h2>
            <div className="h-px flex-1 bg-slate-100" />
        </div>
    );
}

function InputLabeled(
    props: React.InputHTMLAttributes<HTMLInputElement> & {
        label: string;
    }
) {
    const { label, ...inputProps } = props;
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
                {label}
            </label>
            <Input {...inputProps} />
        </div>
    );
}

function BooleanRadio({
                          label,
                          value,
                          onChange,
                      }: {
    label: string;
    value: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
                {label}
            </label>
            <div className="flex gap-3 text-xs">
                <label className="inline-flex items-center gap-1.5">
                    <input
                        type="radio"
                        className="h-3.5 w-3.5"
                        checked={value}
                        onChange={() => onChange(true)}
                    />
                    <span>Sí</span>
                </label>
                <label className="inline-flex items-center gap-1.5">
                    <input
                        type="radio"
                        className="h-3.5 w-3.5"
                        checked={!value}
                        onChange={() => onChange(false)}
                    />
                    <span>No</span>
                </label>
            </div>
        </div>
    );
}

function SummaryField({
                          label,
                          value,
                      }: {
    label: string;
    value: string;
}) {
    return (
        <div className="space-y-1.5 rounded-lg border bg-slate-50 px-3 py-2">
            <p className="text-[11px] font-medium text-slate-500">
                {label}
            </p>
            <p className="text-xs text-slate-800">{value}</p>
        </div>
    );
}
