"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";

import {
    CreateSimulationRequest,
    GraceTypeEnum,
    RateTypeEnum,
} from "@/types/loan-simulation.types";
import { getLoanSimulationService } from "@/services/loan-simulation.service";
import { getCustomerService } from "@/services/customer.service";
import { getPropertyService } from "@/services/property.service";
import { getLoanProgramService } from "@/services/loan-program.service";
import { getFinancialInstitutionService } from "@/services/financial-institution.service";
import { getEligibilityService } from "@/services/eligibility.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import SidebarLayout from "@/components/layout/SidebarLayout";

import type { CustomerEntity } from "@/types/customer.types";
import type { PropertyEntity } from "@/types/property.types";
import type { LoanProgramEntity } from "@/types/loan-program.types";
import type {
    FinancialInstitutionEntity,
    InstitutionRateEntity,
    RateRangeEntity,
} from "@/types/financial-institution.types";
import type { EligibilityWithPropertyEntity } from "@/types/eligibility.types";

type Step = 1 | 2 | 3 | 4 | 5;

interface FormState {
    customerId: string;
    propertyId: string;
    userContribution: string;
    selectedBonos: Record<string, boolean>;
    interestRate: string;
    rateType: RateTypeEnum;
    discountRate: string;
    institutionId: string;
    termInMonths: string;
    gracePeriodMonths: string;
    graceType: GraceTypeEnum;
}

const initialState: FormState = {
    customerId: "",
    propertyId: "",
    userContribution: "",
    selectedBonos: {},
    interestRate: "",
    rateType: RateTypeEnum.EFFECTIVE,
    discountRate: "",
    institutionId: "",
    termInMonths: "",
    gracePeriodMonths: "0",
    graceType: GraceTypeEnum.TOTAL,
};

export default function NewLoanSimulationPage() {
    const router = useRouter();
    const simulationService = getLoanSimulationService();
    const customerService = getCustomerService();
    const propertyService = getPropertyService();
    const programService = getLoanProgramService();
    const institutionService = getFinancialInstitutionService();
    const eligibilityService = getEligibilityService();

    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState<FormState>(initialState);
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Generated simulation result
    const [generatedSimulation, setGeneratedSimulation] = useState<any>(null);

    // Track if form has been modified after generation
    const [formModified, setFormModified] = useState(false);

    // Data from API
    const [customers, setCustomers] = useState<CustomerEntity[]>([]);
    const [properties, setProperties] = useState<PropertyEntity[]>([]);
    const [programs, setPrograms] = useState<LoanProgramEntity[]>([]);
    const [institutions, setInstitutions] = useState<FinancialInstitutionEntity[]>([]);
    const [filteredInstitutions, setFilteredInstitutions] = useState<InstitutionRateEntity[]>([]);

    // Fixed program - Nuevo Crédito MiVivienda
    const [defaultProgramId, setDefaultProgramId] = useState<string>("");

    // Derived data
    const [currentCustomer, setCurrentCustomer] = useState<CustomerEntity | null>(null);
    const [currentProperty, setCurrentProperty] = useState<PropertyEntity | null>(null);
    const [eligibility, setEligibility] = useState<EligibilityWithPropertyEntity | null>(null);
    const [rateRange, setRateRange] = useState<RateRangeEntity | null>(null);
    const [selectedInstitutionRate, setSelectedInstitutionRate] = useState<InstitutionRateEntity | null>(null);

    // UI state
    const [customerSearch, setCustomerSearch] = useState("");
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [showPropertyModal, setShowPropertyModal] = useState(false);
    const [propertySearch, setPropertySearch] = useState("");
    const [propertyEcoFilter, setPropertyEcoFilter] = useState<boolean | null>(null);
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);
    const [showPropertyDetails, setShowPropertyDetails] = useState(false);

    // Loading data on mount
    useEffect(() => {
        loadCustomers().then();
        loadProperties().then();
        loadPrograms().then();
        loadInstitutions().then();
    }, []);

    // Load default program (Nuevo Crédito MiVivienda)
    useEffect(() => {
        if (programs.length > 0) {
            const miViviendaProgram = programs.find(p =>
                p.name.includes("NUEVO_CREDITO_MIVIVIENDA") ||
                p.name.includes("MIVIVIENDA")
            );
            if (miViviendaProgram) {
                setDefaultProgramId(miViviendaProgram.id);
                loadRateRange(miViviendaProgram.id);
            }
        }
    }, [programs]);

    async function loadCustomers() {
        try {
            const data = await customerService.getAll();
            setCustomers(data);
        } catch {
            toast.error("Error al cargar clientes");
        }
    }

    async function loadProperties() {
        try {
            const data = await propertyService.getAll();
            setProperties(data);
        } catch {
            toast.error("Error al cargar propiedades");
        }
    }

    async function loadPrograms() {
        try {
            const data = await programService.getAll();
            setPrograms(data);
        } catch {
            toast.error("Error al cargar programas");
        }
    }

    async function loadInstitutions() {
        try {
            const data = await institutionService.getAll();
            setInstitutions(data);
        } catch {
            toast.error("Error al cargar instituciones");
        }
    }

    async function loadRateRange(programId: string) {
        try {
            const range = await institutionService.getRateRange(programId);
            setRateRange(range);
        } catch {
            toast.error("Error al cargar rango de tasas");
        }
    }

    function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [key]: value }));

        // Mark form as modified if there's a generated simulation
        if (generatedSimulation) {
            setFormModified(true);
        }
    }

    // Filter customers by search
    const filteredCustomers = useMemo(() => {
        if (!customerSearch.trim()) return customers;
        const search = customerSearch.toLowerCase();
        return customers.filter(
            (c) =>
                c.fullName.fullName.toLowerCase().includes(search) ||
                c.contactInfo.email.toLowerCase().includes(search) ||
                c.contactInfo.phoneNumber.toLowerCase().includes(search) ||
                c.id.toLowerCase().includes(search)
        );
    }, [customers, customerSearch]);

    // Filter properties by search and eco-friendly
    const filteredProperties = useMemo(() => {
        let filtered = properties;

        // Apply search filter
        if (propertySearch.trim()) {
            const search = propertySearch.toLowerCase();
            filtered = filtered.filter(
                (p) =>
                    p.propertyCode.toLowerCase().includes(search) ||
                    p.propertyType.toLowerCase().includes(search) ||
                    p.pricing?.priceAmount?.toString().includes(search)
            );
        }

        // Apply eco-friendly filter
        if (propertyEcoFilter !== null) {
            filtered = filtered.filter(
                (p) => !!p.sustainability?.hasCertification === propertyEcoFilter
            );
        }

        return filtered;
    }, [properties, propertySearch, propertyEcoFilter]);

    // Handle customer selection
    async function handleCustomerChange(customerId: string) {
        updateField("customerId", customerId);
        const customer = customers.find((c) => c.id === customerId);
        setCurrentCustomer(customer || null);

        // Reset eligibility and property when customer changes
        setEligibility(null);
        updateField("selectedBonos", {});
        updateField("propertyId", "");
        setCurrentProperty(null);

        // Close modal and clear search
        setShowCustomerModal(false);
        setCustomerSearch("");
    }

    // Handle property selection
    async function handlePropertyChange(propertyId: string) {
        updateField("propertyId", propertyId);
        const property = properties.find((p) => p.id === propertyId);
        setCurrentProperty(property || null);
        setShowPropertyModal(false);
        setPropertySearch("");
        setPropertyEcoFilter(null);

        // Load eligibility if both customer and property are selected
        if (form.customerId && propertyId) {
            try {
                const eligibilityData = await eligibilityService.validateWithProperty(
                    form.customerId,
                    propertyId
                );
                setEligibility(eligibilityData);

                // Pre-select all eligible bonos (AUTOMATIC - not changeable by user)
                const bonos: Record<string, boolean> = {};
                eligibilityData.mivivienda.availableBonos
                    .filter((b) => b.eligible)
                    .forEach((b) => {
                        bonos[b.type] = true;
                    });
                updateField("selectedBonos", bonos);
            } catch {
                toast.error("Error al validar elegibilidad");
            }
        }
    }

    // Handle interest rate input
    async function handleInterestRateChange(rate: string) {
        updateField("interestRate", rate);

        const rateNum = parseFloat(rate);
        if (!rateNum || !defaultProgramId) {
            setFilteredInstitutions([]);
            return;
        }

        // Search institutions offering this rate
        try {
            const matchingInsts = await institutionService.searchInstitutionsOfferingRate(
                defaultProgramId,
                rateNum
            );
            setFilteredInstitutions(matchingInsts);
        } catch {
            setFilteredInstitutions([]);
        }
    }

    // Handle institution selection
    async function handleInstitutionChange(institutionId: string) {
        updateField("institutionId", institutionId);

        // Load institution rate details
        if (defaultProgramId) {
            try {
                const rate = await institutionService.getInstitutionRate(
                    institutionId,
                    defaultProgramId
                );
                setSelectedInstitutionRate(rate);
            } catch {
                toast.error("Error al cargar detalles de la institución");
            }
        }
    }

    // Calculate totals for Step 2
    const calculatedTotals = useMemo(() => {
        const userContrib = parseFloat(form.userContribution) || 0;
        let totalBonos = 0;

        if (eligibility?.mivivienda.availableBonos) {
            eligibility.mivivienda.availableBonos.forEach((bono) => {
                if (form.selectedBonos[bono.type] && bono.amount) {
                    totalBonos += bono.amount;
                }
            });
        }

        const totalInitialPayment = userContrib + totalBonos;

        let propertyPrice = 0;
        if (currentProperty?.pricing?.priceAmount) {
            propertyPrice = currentProperty.pricing.priceAmount;
        }

        const loanAmount = propertyPrice - totalInitialPayment;

        return {
            userContrib,
            totalBonos,
            totalInitialPayment,
            propertyPrice,
            loanAmount: Math.max(0, loanAmount),
        };
    }, [form.userContribution, form.selectedBonos, eligibility, currentProperty]);

    // Validate steps
    function canProceedFromStep1(): boolean {
        if (!form.customerId || !form.propertyId) return false;
        if (!eligibility) return false;
        return eligibility.mivivienda.eligible;
    }

    function canProceedFromStep2(): boolean {
        const { propertyPrice, totalInitialPayment } = calculatedTotals;
        const minDownPayment = propertyPrice * 0.1;
        return totalInitialPayment >= minDownPayment;
    }

    function canProceedFromStep3(): boolean {
        if (!form.interestRate || !form.institutionId) return false;
        const rate = parseFloat(form.interestRate);
        if (!rateRange) return false;
        return rate >= rateRange.minRate && rate <= rateRange.maxRate;
    }

    function canProceedFromStep4(): boolean {
        const term = parseInt(form.termInMonths);
        return term >= 60 && term <= 300; // 5 to 25 years
    }

    // Check if simulation can be generated
    function canGenerateSimulation(): boolean {
        return canProceedFromStep1() &&
            canProceedFromStep2() &&
            canProceedFromStep3() &&
            canProceedFromStep4();
    }

    function handleNext() {
        if (step === 1 && !canProceedFromStep1()) {
            toast.error("Selecciona un cliente y propiedad elegibles");
            return;
        }
        if (step === 2 && !canProceedFromStep2()) {
            toast.error("La cuota inicial debe ser al menos 10% del precio");
            return;
        }
        if (step === 3 && !canProceedFromStep3()) {
            toast.error("Ingresa una tasa válida y selecciona una institución");
            return;
        }
        if (step === 4 && !canProceedFromStep4()) {
            toast.error("El plazo debe estar entre 60 y 300 meses (5 a 25 años)");
            return;
        }

        // If in step 4 and simulation already generated AND not modified, go to step 5
        if (step === 4 && generatedSimulation && !formModified) {
            setStep(5);
            return;
        }

        setStep((prev) => Math.min(5, prev + 1) as Step);
    }

    function handleBack() {
        // If going back from step 5, user wants to edit - keep simulation to avoid regenerating
        // Simulation will only be deleted when user clicks "Generar" again
        setStep((prev) => Math.max(1, prev - 1) as Step);
    }

    async function handleGenerate() {
        if (!canGenerateSimulation()) {
            toast.error("Completa todos los campos requeridos antes de generar");
            return;
        }

        setGenerating(true);

        try {
            // If there's an existing simulation, delete it first
            if (generatedSimulation?.id) {
                await simulationService.delete(generatedSimulation.id)
            }

            const payload: CreateSimulationRequest = {
                customerId: form.customerId,
                propertyId: form.propertyId,
                institutionId: form.institutionId,
                loanProgramId: defaultProgramId,
                parameters: {
                    propertyPrice: {
                        amount: calculatedTotals.propertyPrice,
                        currency: "PEN",
                    },
                    initialDownPayment: {
                        amount: calculatedTotals.totalInitialPayment,
                        currency: "PEN",
                    },
                    loanAmount: {
                        amount: calculatedTotals.loanAmount,
                        currency: "PEN",
                    },
                    termInMonths: parseInt(form.termInMonths),
                    currency: "PEN",
                    interestRate: {
                        rate: parseFloat(form.interestRate) / 100,
                        type: form.rateType,
                        capitalizationPeriod: null,
                    },
                    gracePeriod: {
                        durationInMonths: parseInt(form.gracePeriodMonths) || 0,
                        type: form.graceType,
                    },
                    discountRate: form.discountRate
                        ? parseFloat(form.discountRate) / 100
                        : null,
                },
            };

            const simulation = await simulationService.create(payload);
            setGeneratedSimulation(simulation);
            setFormModified(false); // Reset modification flag

            toast.success("Crédito generado exitosamente", {
                description: `TCEA: ${simulation.paymentPlan?.tcea.toFixed(2)}%`,
            });

            // Go to step 5 to show results
            setStep(5);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al generar el crédito";
            toast.error("Error", { description: message });
        } finally {
            setGenerating(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (submitting || !generatedSimulation) return;

        setSubmitting(true);

        try {
            toast.success("Crédito guardado exitosamente");

            if (generatedSimulation?.id) {
                await simulationService.save(generatedSimulation.id)
            }

            setTimeout(() => {
                router.push("/simulations");
            }, 1500);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al guardar el crédito";
            toast.error("Error", { description: message });
        } finally {
            setSubmitting(false);
        }
    }

    async function handleCancel() {
        try {
            if (generatedSimulation?.id) {
                await simulationService.save(generatedSimulation.id)
            }
            router.push("/simulations");
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Error al eliminar el crédito";
            toast.error("Error", { description: message });
        }
    }

    const programName = programs.find((p) => p.id === defaultProgramId)?.name.replace(/_/g, " ") || "Nuevo Crédito MiVivienda";

    return (
        <SidebarLayout>
            <div className="flex flex-col flex-1 overflow-hidden max-h-full">
                {/* HEADER - FIXED */}
                <div className="flex-shrink-0 px-6 pt-6 pb-4 bg-white border-b">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                {programName}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Crea una simulación de préstamo hipotecario para un cliente
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancelar
                        </Button>
                    </div>

                    {/* STEPPER */}
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <StepItem
                            label="Cliente y Propiedad"
                            stepNumber={1}
                            currentStep={step}
                        />
                        <StepItem
                            label="Cuota Inicial y Bonos"
                            stepNumber={2}
                            currentStep={step}
                        />
                        <StepItem
                            label="Tasa e Institución"
                            stepNumber={3}
                            currentStep={step}
                        />
                        <StepItem
                            label="Plazo y Período de Gracia"
                            stepNumber={4}
                            currentStep={step}
                        />
                        <StepItem
                            label="Resultados"
                            stepNumber={5}
                            currentStep={step}
                        />
                    </div>
                </div>

                {/* FORM - SCROLLABLE CONTENT */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
                            {step === 1 && (
                                <Step1ClientProperty
                                    form={form}
                                    customers={customers}
                                    filteredCustomers={filteredCustomers}
                                    properties={properties}
                                    currentCustomer={currentCustomer}
                                    currentProperty={currentProperty}
                                    eligibility={eligibility}
                                    customerSearch={customerSearch}
                                    setCustomerSearch={setCustomerSearch}
                                    showCustomerModal={showCustomerModal}
                                    setShowCustomerModal={setShowCustomerModal}
                                    showPropertyModal={showPropertyModal}
                                    setShowPropertyModal={setShowPropertyModal}
                                    propertySearch={propertySearch}
                                    setPropertySearch={setPropertySearch}
                                    propertyEcoFilter={propertyEcoFilter}
                                    setPropertyEcoFilter={setPropertyEcoFilter}
                                    filteredProperties={filteredProperties}
                                    showCustomerDetails={showCustomerDetails}
                                    setShowCustomerDetails={setShowCustomerDetails}
                                    showPropertyDetails={showPropertyDetails}
                                    setShowPropertyDetails={setShowPropertyDetails}
                                    onCustomerChange={handleCustomerChange}
                                    onPropertyChange={handlePropertyChange}
                                />
                            )}

                            {step === 2 && (
                                <Step2InitialPayment
                                    form={form}
                                    updateField={updateField}
                                    eligibility={eligibility}
                                    calculatedTotals={calculatedTotals}
                                />
                            )}

                            {step === 3 && (
                                <Step3RateInstitution
                                    form={form}
                                    institutions={institutions}
                                    filteredInstitutions={filteredInstitutions}
                                    selectedInstitutionRate={selectedInstitutionRate}
                                    rateRange={rateRange}
                                    onRateChange={handleInterestRateChange}
                                    onInstitutionChange={handleInstitutionChange}
                                    updateField={updateField}
                                />
                            )}

                            {step === 4 && (
                                <Step4TermGrace
                                    form={form}
                                    updateField={updateField}
                                    selectedInstitutionRate={selectedInstitutionRate}
                                    calculatedTotals={calculatedTotals}
                                />
                            )}

                            {step === 5 && (
                                <Step5Results
                                    generatedSimulation={generatedSimulation}
                                    calculatedTotals={calculatedTotals}
                                    currentCustomer={currentCustomer}
                                    currentProperty={currentProperty}
                                    selectedInstitutionRate={selectedInstitutionRate}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* FOOTER BUTTONS - FIXED */}
                <form onSubmit={handleSubmit}>
                    <div className="flex-shrink-0 px-6 py-4 bg-white border-t">
                        <div className="max-w-5xl mx-auto flex items-center justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                disabled={step === 1 || submitting || generating}
                                onClick={handleBack}
                            >
                                Volver
                            </Button>

                            {step < 4 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={submitting || generating}
                                >
                                    Siguiente
                                </Button>
                            ) : step === 4 ? (
                                <div className="flex gap-2">
                                    {/* Show "Siguiente" only if simulation exists AND form not modified */}
                                    {generatedSimulation && !formModified ? (
                                        <Button
                                            type="button"
                                            onClick={handleNext}
                                            disabled={submitting || generating}
                                        >
                                            Siguiente
                                        </Button>
                                    ) : (
                                        <Button
                                            type="button"
                                            onClick={handleGenerate}
                                            disabled={!canGenerateSimulation() || generating}
                                        >
                                            {generating ? "Generando..." : generatedSimulation ? "Regenerar Crédito" : "Generar Crédito"}
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={submitting || !generatedSimulation}
                                >
                                    {submitting ? "Guardando..." : "Guardar Crédito"}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>

                {/* CUSTOMER SELECTION MODAL */}
                {showCustomerModal && (
                    <CustomerSelectionModal
                        customers={filteredCustomers}
                        search={customerSearch}
                        setSearch={setCustomerSearch}
                        onSelect={handleCustomerChange}
                        onClose={() => setShowCustomerModal(false)}
                    />
                )}

                {/* PROPERTY SELECTION MODAL */}
                {showPropertyModal && (
                    <PropertySelectionModal
                        properties={filteredProperties}
                        search={propertySearch}
                        setSearch={setPropertySearch}
                        ecoFilter={propertyEcoFilter}
                        setEcoFilter={setPropertyEcoFilter}
                        onSelect={handlePropertyChange}
                        onClose={() => setShowPropertyModal(false)}
                    />
                )}
            </div>
        </SidebarLayout>
    );
}

/* ========== STEP COMPONENTS ========== */

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
                    isActive && "border-green-500 bg-green-50 text-green-600",
                    isDone && "border-green-500 bg-green-500 text-white",
                    !isActive && !isDone && "border-slate-200 text-slate-400"
                )}
            >
                {isDone ? "✓" : stepNumber}
            </div>
            <p className="mt-2 max-w-[140px] text-xs text-slate-600">{label}</p>
        </div>
    );
}

interface Step1Props {
    form: FormState;
    customers: CustomerEntity[];
    filteredCustomers: CustomerEntity[];
    properties: PropertyEntity[];
    currentCustomer: CustomerEntity | null;
    currentProperty: PropertyEntity | null;
    eligibility: EligibilityWithPropertyEntity | null;
    customerSearch: string;
    setCustomerSearch: (value: string) => void;
    showCustomerModal: boolean;
    setShowCustomerModal: (value: boolean) => void;
    showPropertyModal: boolean;
    setShowPropertyModal: (value: boolean) => void;
    propertySearch: string;
    setPropertySearch: (value: string) => void;
    propertyEcoFilter: boolean | null;
    setPropertyEcoFilter: (value: boolean | null) => void;
    filteredProperties: PropertyEntity[];
    showCustomerDetails: boolean;
    setShowCustomerDetails: (value: boolean) => void;
    showPropertyDetails: boolean;
    setShowPropertyDetails: (value: boolean) => void;
    onCustomerChange: (id: string) => void;
    onPropertyChange: (id: string) => void;
}

function Step1ClientProperty({
                                 form,
                                 filteredCustomers,
                                 currentCustomer,
                                 currentProperty,
                                 eligibility,
                                 customerSearch,
                                 setCustomerSearch,
                                 showCustomerModal,
                                 setShowCustomerModal,
                                 showPropertyModal,
                                 setShowPropertyModal,
                                 propertyEcoFilter,
                                 setPropertyEcoFilter,
                                 showCustomerDetails,
                                 setShowCustomerDetails,
                                 showPropertyDetails,
                                 setShowPropertyDetails,
                                 onCustomerChange,
                             }: Step1Props) {
    return (
        <div className="space-y-6">
            <SectionTitle title="Selección de cliente" />

            {/* Customer Selection Button */}
            <Button
                type="button"
                variant="outline"
                onClick={() => setShowCustomerModal(true)}
                className="w-full justify-start"
            >
                <Search className="h-4 w-4 mr-2" />
                {currentCustomer
                    ? `${currentCustomer.fullName.fullName} - ${currentCustomer.contactInfo.email}`
                    : "Seleccionar cliente..."}
            </Button>

            {/* Selected Customer Info */}
            {currentCustomer && (
                <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">Cliente seleccionado</h3>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                            className="text-xs"
                        >
                            {showCustomerDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {showCustomerDetails ? "Ocultar" : "Ver más"}
                        </Button>
                    </div>

                    <div className="grid gap-2 text-xs md:grid-cols-3">
                        <div>
                            <span className="text-slate-500">Nombre:</span>{" "}
                            <span className="font-medium">{currentCustomer.fullName.fullName}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Email:</span>{" "}
                            {currentCustomer.contactInfo.email}
                        </div>
                        <div>
                            <span className="text-slate-500">Teléfono:</span>{" "}
                            {currentCustomer.contactInfo.phoneNumber}
                        </div>
                    </div>

                    {showCustomerDetails && (
                        <div className="mt-4 grid gap-2 text-xs md:grid-cols-3 pt-3 border-t border-slate-200">
                            <div>
                                <span className="text-slate-500">Edad:</span>{" "}
                                {currentCustomer.demographics.age} años
                            </div>
                            <div>
                                <span className="text-slate-500">Estado civil:</span>{" "}
                                {currentCustomer.demographics.maritalStatus}
                            </div>
                            <div>
                                <span className="text-slate-500">Nivel educativo:</span>{" "}
                                {currentCustomer.demographics.educationLevel}
                            </div>
                            <div>
                                <span className="text-slate-500">Ingreso mensual:</span>{" "}
                                S/ {currentCustomer.financialSummary.monthlyIncomeAmount.toFixed(2)}
                            </div>
                            <div>
                                <span className="text-slate-500">Gastos mensuales:</span>{" "}
                                S/ {currentCustomer.financialSummary.monthlyExpensesAmount.toFixed(2)}
                            </div>
                            <div>
                                <span className="text-slate-500">Score crediticio:</span>{" "}
                                {currentCustomer.creditProfile.creditScore || "N/A"}
                            </div>
                            <div>
                                <span className="text-slate-500">Ocupación:</span>{" "}
                                {currentCustomer.employmentInfo.occupation}
                            </div>
                            <div>
                                <span className="text-slate-500">Tipo empleo:</span>{" "}
                                {currentCustomer.employmentInfo.employmentType}
                            </div>
                            <div>
                                <span className="text-slate-500">Dependientes:</span>{" "}
                                {currentCustomer.familyDetails.dependents}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Eligibility Status */}
            {form.customerId && form.propertyId && eligibility && (
                <div className={cn(
                    "rounded-lg border-2 p-4",
                    eligibility.mivivienda.eligible
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                )}>
                    <p className={cn(
                        "text-sm font-semibold mb-2",
                        eligibility.mivivienda.eligible ? "text-green-700" : "text-red-700"
                    )}>
                        {eligibility.mivivienda.eligible
                            ? "✓ Cliente elegible para MiVivienda"
                            : "⚠️ Cliente no elegible para MiVivienda"}
                    </p>
                    <ul className={cn(
                        "text-xs list-disc list-inside space-y-1",
                        eligibility.mivivienda.eligible ? "text-green-600" : "text-red-600"
                    )}>
                        {(eligibility.mivivienda.eligible
                                ? eligibility.mivivienda.reasons
                                : eligibility.mivivienda.failureReasons
                        ).map((reason, i) => (
                            <li key={i}>{reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            <SectionTitle title="Selección de propiedad" />

            {/* Property Selection Button */}
            <Button
                type="button"
                variant="outline"
                onClick={() => setShowPropertyModal(true)}
                disabled={!form.customerId}
                className="w-full justify-start"
            >
                <Search className="h-4 w-4 mr-2" />
                {currentProperty
                    ? `${currentProperty.propertyCode} - ${currentProperty.propertyType}`
                    : "Seleccionar propiedad..."}
            </Button>

            {/* Selected Property Info */}
            {currentProperty && (
                <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">Propiedad seleccionada</h3>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPropertyDetails(!showPropertyDetails)}
                            className="text-xs"
                        >
                            {showPropertyDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            {showPropertyDetails ? "Ocultar" : "Ver más"}
                        </Button>
                    </div>

                    <div className="grid gap-2 text-xs md:grid-cols-3">
                        <div>
                            <span className="text-slate-500">Código:</span>{" "}
                            <span className="font-medium">{currentProperty.propertyCode}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Tipo:</span>{" "}
                            {currentProperty.propertyType}
                        </div>
                        <div>
                            <span className="text-slate-500">Precio:</span>{" "}
                            <span className="font-semibold">S/ {currentProperty.pricing?.priceAmount?.toFixed(2) || 0}</span>
                        </div>
                    </div>

                    {showPropertyDetails && (
                        <div className="mt-4 grid gap-2 text-xs md:grid-cols-3 pt-3 border-t border-slate-200">
                            <div>
                                <span className="text-slate-500">Dormitorios:</span>{" "}
                                {currentProperty.bedrooms}
                            </div>
                            <div>
                                <span className="text-slate-500">Baños:</span>{" "}
                                {currentProperty.bathrooms}
                            </div>
                            <div>
                                <span className="text-slate-500">Área construida:</span>{" "}
                                {currentProperty.pricing?.builtArea || 0} m²
                            </div>
                            <div>
                                <span className="text-slate-500">Área total:</span>{" "}
                                {currentProperty.pricing?.totalArea || 0} m²
                            </div>
                            <div>
                                <span className="text-slate-500">Piso:</span>{" "}
                                {currentProperty.floor || "N/A"}
                            </div>
                            <div>
                                <span className="text-slate-500">Estacionamientos:</span>{" "}
                                {currentProperty.parking?.parkingSpaces || 0}
                            </div>
                            <div>
                                <span className="text-slate-500">Acabados:</span>{" "}
                                {currentProperty.finishingQuality}
                            </div>
                            <div>
                                <span className="text-slate-500">Año construcción:</span>{" "}
                                {currentProperty.constructionYear || "N/A"}
                            </div>
                            <div>
                                <span className="text-slate-500">Eco-friendly:</span>{" "}
                                {currentProperty.sustainability?.hasCertification
                                    ? `✓ Sí (${currentProperty.sustainability.certificationType})`
                                    : "No"}
                            </div>
                            <div>
                                <span className="text-slate-500">Balcón:</span>{" "}
                                {currentProperty.hasBalcony ? "Sí" : "No"}
                            </div>
                            <div>
                                <span className="text-slate-500">Depósito:</span>{" "}
                                {currentProperty.storageRoom ? "Sí" : "No"}
                            </div>
                            <div>
                                <span className="text-slate-500">Mantenimiento:</span>{" "}
                                S/ {currentProperty.pricing?.maintenanceFeeAmount?.toFixed(2) || 0}/mes
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

interface Step2Props {
    form: FormState;
    updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
    eligibility: EligibilityWithPropertyEntity | null;
    calculatedTotals: {
        userContrib: number;
        totalBonos: number;
        totalInitialPayment: number;
        propertyPrice: number;
        loanAmount: number;
    };
}

function Step2InitialPayment({
                                 form,
                                 updateField,
                                 eligibility,
                                 calculatedTotals,
                             }: Step2Props) {
    const availableBonos = eligibility?.mivivienda.availableBonos || [];
    const eligibleBonos = availableBonos.filter((b) => b.eligible);

    const minDownPayment = calculatedTotals.propertyPrice * 0.1;
    const downPaymentPercent =
        (calculatedTotals.totalInitialPayment / calculatedTotals.propertyPrice) * 100 || 0;

    return (
        <div className="space-y-6">
            <SectionTitle title="Aporte del cliente" />

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Aporte personal (S/)*
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.userContribution}
                        onChange={(e) =>
                            updateField("userContribution", e.target.value)
                        }
                        placeholder="Ingresa tu aporte"
                    />
                    <p className="text-xs text-slate-500">
                        Cuota inicial mínima: S/ {minDownPayment.toFixed(2)} (10%)
                    </p>
                </div>
            </div>

            <SectionTitle title="Bonos aplicados automáticamente" />

            {eligibleBonos.length === 0 ? (
                <p className="text-xs text-slate-500">
                    No hay bonos elegibles para esta combinación de cliente y
                    propiedad.
                </p>
            ) : (
                <div className="space-y-2">
                    <p className="text-xs text-slate-600 mb-3">
                        Los siguientes bonos se aplicarán automáticamente a tu crédito:
                    </p>
                    {eligibleBonos.map((bono) => (
                        <div
                            key={bono.type}
                            className="flex items-center gap-3 rounded-lg border-2 border-green-200 bg-green-50 p-3"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0">
                                ✓
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-900">
                                    {formatBonoName(bono.type)}
                                </p>
                                <p className="text-xs text-green-700">
                                    {bono.reason || "Bono automático"}
                                </p>
                            </div>
                            <p className="text-sm font-bold text-green-700">
                                S/ {bono.amount?.toFixed(2) || 0}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <SectionTitle title="Resumen de cuota inicial" />

            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Aporte del cliente:</span>
                    <span className="font-semibold">
                        S/ {calculatedTotals.userContrib.toFixed(2)}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span>Total bonos seleccionados:</span>
                    <span className="font-semibold text-green-600">
                        S/ {calculatedTotals.totalBonos.toFixed(2)}
                    </span>
                </div>
                <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between">
                    <span className="font-bold">Total cuota inicial:</span>
                    <span className="font-bold text-blue-700">
                        S/ {calculatedTotals.totalInitialPayment.toFixed(2)}
                    </span>
                </div>
                <div className="text-xs text-slate-600">
                    Representa el {downPaymentPercent.toFixed(1)}% del precio de la
                    propiedad
                </div>
                <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between">
                    <span className="font-bold">Monto del préstamo:</span>
                    <span className="font-bold text-blue-700">
                        S/ {calculatedTotals.loanAmount.toFixed(2)}
                    </span>
                </div>
            </div>

            {calculatedTotals.totalInitialPayment < minDownPayment && (
                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4">
                    <p className="text-sm font-semibold text-orange-700">
                        ⚠️ La cuota inicial debe ser al menos 10% del precio
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                        Faltan: S/{" "}
                        {(minDownPayment - calculatedTotals.totalInitialPayment).toFixed(
                            2
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}

interface Step3Props {
    form: FormState;
    institutions: FinancialInstitutionEntity[];
    filteredInstitutions: InstitutionRateEntity[];
    selectedInstitutionRate: InstitutionRateEntity | null;
    rateRange: RateRangeEntity | null;
    onRateChange: (rate: string) => void;
    onInstitutionChange: (id: string) => void;
    updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
}

function Step3RateInstitution({
                                  form,
                                  institutions,
                                  filteredInstitutions,
                                  selectedInstitutionRate,
                                  rateRange,
                                  onRateChange,
                                  onInstitutionChange,
                                  updateField,
                              }: Step3Props) {
    const rateNum = parseFloat(form.interestRate) || 0;
    const isRateValid =
        rateRange &&
        rateNum >= rateRange.minRate &&
        rateNum <= rateRange.maxRate;

    return (
        <div className="space-y-6">
            {/* Rate Range Info */}
            {rateRange && (
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-blue-700 mb-1">
                        Rango de tasas disponibles
                    </p>
                    <p className="text-xs text-slate-600">
                        {rateRange.minRate}% - {rateRange.maxRate}% TEA
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                        {rateRange.message}
                    </p>
                </div>
            )}

            <SectionTitle title="Tasa de interés" />

            <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Tasa anual (%)*
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="50"
                        value={form.interestRate}
                        onChange={(e) => onRateChange(e.target.value)}
                        placeholder="Ej: 7.5"
                    />
                    {rateRange && (
                        <p
                            className={cn(
                                "text-xs",
                                isRateValid ? "text-green-600" : "text-orange-600"
                            )}
                        >
                            {isRateValid
                                ? "✓ Tasa válida"
                                : `Rango: ${rateRange.minRate}% - ${rateRange.maxRate}%`}
                        </p>
                    )}
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Tipo de tasa*
                    </label>
                    <Select
                        value={form.rateType}
                        onValueChange={(value) =>
                            updateField("rateType", value as RateTypeEnum)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={RateTypeEnum.EFFECTIVE}>
                                TEA (Tasa Efectiva Anual)
                            </SelectItem>
                            <SelectItem value={RateTypeEnum.NOMINAL}>
                                TNA (Tasa Nominal Anual)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Tasa de descuento (%) - Opcional
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="50"
                        value={form.discountRate}
                        onChange={(e) =>
                            updateField("discountRate", e.target.value)
                        }
                        placeholder="Para calcular VAN"
                    />
                </div>
            </div>

            {/* Filtered Institutions */}
            {filteredInstitutions.length > 0 && (
                <>
                    <SectionTitle title="Instituciones que ofrecen la tasa ingresada" />
                    <div className="grid gap-3 md:grid-cols-2">
                        {filteredInstitutions.map((inst) => (
                            <div
                                key={inst.institutionId}
                                className={cn(
                                    "rounded-lg border-2 bg-slate-50 p-4 text-xs cursor-pointer transition-all hover:bg-slate-100",
                                    form.institutionId === inst.institutionId && "border-green-500 bg-green-50"
                                )}
                                onClick={() => onInstitutionChange(inst.institutionId)}
                            >
                                <p className="font-semibold text-sm mb-2">{inst.institutionName}</p>
                                <div className="space-y-1">
                                    <p className="text-slate-600">
                                        <span className="font-medium">Rango:</span> {inst.minRate}% - {inst.maxRate}%
                                    </p>
                                    <p className="text-slate-600">
                                        <span className="font-medium">Seguro:</span> {inst.insuranceRate.toFixed(4)}% mensual
                                    </p>
                                    {inst.offersRequestedRate && (
                                        <p className="text-green-600 font-medium">
                                            ✓ Ofrece la tasa solicitada
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <SectionTitle title="Selección de institución financiera" />

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Institución*
                    </label>
                    <Select
                        value={form.institutionId}
                        onValueChange={onInstitutionChange}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecciona una institución..." />
                        </SelectTrigger>
                        <SelectContent>
                            {(filteredInstitutions.length > 0
                                    ? filteredInstitutions
                                    : institutions.map((i) => ({
                                        institutionId: i.id,
                                        institutionName: i.name,
                                    }))
                            ).map((inst) => (
                                <SelectItem
                                    key={inst.institutionId}
                                    value={inst.institutionId}
                                >
                                    {inst.institutionName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedInstitutionRate && (
                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                    <h3 className="text-sm font-semibold text-green-700 mb-3">
                        Información de la institución seleccionada
                    </h3>
                    <div className="grid gap-2 text-xs md:grid-cols-2">
                        <div>
                            <span className="text-slate-600">Institución:</span>{" "}
                            <span className="font-semibold">{selectedInstitutionRate.institutionName}</span>
                        </div>
                        <div>
                            <span className="text-slate-600">Rango de tasas:</span>{" "}
                            {selectedInstitutionRate.minRate}% -{" "}
                            {selectedInstitutionRate.maxRate}%
                        </div>
                        <div>
                            <span className="text-slate-600">
                                Seguro de desgravamen:
                            </span>{" "}
                            {selectedInstitutionRate.insuranceRate.toFixed(4)}% mensual
                        </div>
                        <div>
                            <span className="text-slate-600">
                                Ofrece tasa solicitada:
                            </span>{" "}
                            {selectedInstitutionRate.offersRequestedRate
                                ? "✓ Sí"
                                : "No"}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface Step4Props {
    form: FormState;
    updateField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
    selectedInstitutionRate: InstitutionRateEntity | null;
    calculatedTotals: {
        userContrib: number;
        totalBonos: number;
        totalInitialPayment: number;
        propertyPrice: number;
        loanAmount: number;
    };
}

function Step4TermGrace({
                            form,
                            updateField,
                            selectedInstitutionRate,
                            calculatedTotals,
                        }: Step4Props) {
    const termInYears = parseInt(form.termInMonths) / 12 || 0;

    return (
        <div className="space-y-6">
            <SectionTitle title="Plazo del préstamo" />

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Plazo (meses)*
                    </label>
                    <Input
                        type="number"
                        min="60"
                        max="300"
                        value={form.termInMonths}
                        onChange={(e) =>
                            updateField("termInMonths", e.target.value)
                        }
                        placeholder="Ej: 180"
                    />
                    <p className="text-xs text-slate-500">
                        Entre 60 y 300 meses (5 a 25 años)
                        {termInYears > 0 && ` • ${termInYears.toFixed(1)} años`}
                    </p>
                </div>
            </div>

            <SectionTitle title="Período de gracia (opcional)" />

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Duración (meses)
                    </label>
                    <Input
                        type="number"
                        min="0"
                        value={form.gracePeriodMonths}
                        onChange={(e) =>
                            updateField("gracePeriodMonths", e.target.value)
                        }
                        placeholder="0"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">
                        Tipo de gracia
                    </label>
                    <Select
                        value={form.graceType}
                        onValueChange={(value) =>
                            updateField("graceType", value as GraceTypeEnum)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={GraceTypeEnum.TOTAL}>
                                Total (capitaliza intereses)
                            </SelectItem>
                            <SelectItem value={GraceTypeEnum.PARTIAL}>
                                Parcial (paga solo intereses)
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <SectionTitle title="Resumen de la simulación" />

            <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4 space-y-3 text-sm">
                <div className="grid gap-3 md:grid-cols-2">
                    <div className="bg-white rounded-lg p-3 border">
                        <span className="text-slate-500 text-xs block mb-1">Precio de propiedad</span>
                        <p className="font-semibold text-lg">
                            S/ {calculatedTotals.propertyPrice.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                        <span className="text-slate-500 text-xs block mb-1">Cuota inicial</span>
                        <p className="font-semibold text-lg">
                            S/ {calculatedTotals.totalInitialPayment.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-blue-300">
                        <span className="text-slate-500 text-xs block mb-1">Monto del préstamo</span>
                        <p className="font-semibold text-lg text-blue-600">
                            S/ {calculatedTotals.loanAmount.toFixed(2)}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                        <span className="text-slate-500 text-xs block mb-1">Plazo</span>
                        <p className="font-semibold text-lg">
                            {form.termInMonths} meses
                        </p>
                        <p className="text-xs text-slate-500">
                            ({termInYears.toFixed(1)} años)
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                        <span className="text-slate-500 text-xs block mb-1">Tasa de interés</span>
                        <p className="font-semibold text-lg">{form.interestRate}% TEA</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border">
                        <span className="text-slate-500 text-xs block mb-1">Período de gracia</span>
                        <p className="font-semibold text-lg">
                            {form.gracePeriodMonths} meses
                        </p>
                    </div>
                </div>

                {selectedInstitutionRate && (
                    <div className="border-t border-slate-300 pt-3 mt-3">
                        <span className="text-slate-500 text-xs block mb-1">
                            Institución financiera
                        </span>
                        <p className="font-semibold">
                            {selectedInstitutionRate.institutionName}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                            Seguro de desgravamen:{" "}
                            {selectedInstitutionRate.insuranceRate.toFixed(4)}% mensual
                        </p>
                    </div>
                )}
            </div>

            <p className="text-xs text-slate-500 italic">
                Al crear la simulación se calculará el cronograma de pagos completo con
                los indicadores financieros (TCEA, VAN, TIR) y las cuotas mensuales.
            </p>
        </div>
    );
}

interface Step5Props {
    generatedSimulation: any;
    calculatedTotals: {
        userContrib: number;
        totalBonos: number;
        totalInitialPayment: number;
        propertyPrice: number;
        loanAmount: number;
    };
    currentCustomer: CustomerEntity | null;
    currentProperty: PropertyEntity | null;
    selectedInstitutionRate: InstitutionRateEntity | null;
}

function Step5Results({
                          generatedSimulation,
                          calculatedTotals,
                          currentCustomer,
                          currentProperty,
                          selectedInstitutionRate,
                      }: Step5Props) {
    if (!generatedSimulation) {
        return (
            <div className="space-y-6">
                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-8 text-center">
                    <p className="text-lg font-semibold text-orange-700">
                        No hay resultados para mostrar
                    </p>
                    <p className="text-sm text-orange-600 mt-2">
                        Por favor genera el crédito en el paso anterior
                    </p>
                </div>
            </div>
        );
    }

    const paymentPlan = generatedSimulation.paymentPlan;
    const currency = generatedSimulation.parameters.currency;
    const monthlyPayment = paymentPlan?.monthlyPayment?.amount || 0;
    const installments = paymentPlan?.installments || [];

    return (
        <div className="space-y-6">
            <SectionTitle title="Resumen del cliente y propiedad" />

            <div className="grid gap-4 md:grid-cols-2">
                {/* Cliente */}
                <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold mb-3 text-slate-700">Cliente</h3>
                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-500">Nombre:</span>{" "}
                            <span className="font-medium">{currentCustomer?.fullName.fullName}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Email:</span>{" "}
                            {currentCustomer?.contactInfo.email}
                        </div>
                        <div>
                            <span className="text-slate-500">Ingreso mensual:</span>{" "}
                            S/ {currentCustomer?.financialSummary.monthlyIncomeAmount.toFixed(2)}
                        </div>
                    </div>
                </div>

                {/* Propiedad */}
                <div className="rounded-lg border-2 border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-semibold mb-3 text-slate-700">Propiedad</h3>
                    <div className="space-y-2 text-xs">
                        <div>
                            <span className="text-slate-500">Código:</span>{" "}
                            <span className="font-medium">{currentProperty?.propertyCode}</span>
                        </div>
                        <div>
                            <span className="text-slate-500">Tipo:</span>{" "}
                            {currentProperty?.propertyType}
                        </div>
                        <div>
                            <span className="text-slate-500">Precio:</span>{" "}
                            <span className="font-semibold">S/ {currentProperty?.pricing?.priceAmount?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <SectionTitle title="Indicadores financieros" />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">Cuota Mensual</p>
                    <p className="text-2xl font-bold text-blue-700">
                        S/ {monthlyPayment.toFixed(2)}
                    </p>
                </div>

                <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">TCEA</p>
                    <p className="text-2xl font-bold text-green-700">
                        {paymentPlan?.tcea.toFixed(2)}%
                    </p>
                    {selectedInstitutionRate && (
                        <p className="text-xs text-slate-500 mt-1">
                            Incluye seguro: {selectedInstitutionRate.insuranceRate.toFixed(4)}%
                        </p>
                    )}
                </div>

                <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">TIR</p>
                    <p className="text-2xl font-bold text-purple-700">
                        {paymentPlan?.tir.toFixed(2)}%
                    </p>
                </div>

                <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 text-center">
                    <p className="text-xs text-slate-600 mb-1">VAN</p>
                    <p className="text-2xl font-bold text-orange-700">
                        S/ {paymentPlan?.van.amount.toFixed(2)}
                    </p>
                </div>
            </div>

            <SectionTitle title="Cronograma de pagos" />

            <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-xs">
                        <thead className="bg-slate-100 sticky top-0">
                        <tr>
                            <th className="px-3 py-2 text-left font-semibold">#</th>
                            <th className="px-3 py-2 text-left font-semibold">Fecha</th>
                            <th className="px-3 py-2 text-right font-semibold">Saldo Inicial</th>
                            <th className="px-3 py-2 text-right font-semibold">Interés</th>
                            <th className="px-3 py-2 text-right font-semibold">Amortización</th>
                            <th className="px-3 py-2 text-right font-semibold">Otros Costos</th>
                            <th className="px-3 py-2 text-right font-semibold">Cuota Total</th>
                            <th className="px-3 py-2 text-right font-semibold">Saldo Final</th>
                        </tr>
                        </thead>
                        <tbody>
                        {installments.map((installment: any, index: number) => (
                            <tr
                                key={installment.id}
                                className={cn(
                                    "border-t",
                                    index % 2 === 0 ? "bg-white" : "bg-slate-50"
                                )}
                            >
                                <td className="px-3 py-2">{installment.installmentNumber}</td>
                                <td className="px-3 py-2">{new Date(installment.dueDate).toLocaleDateString()}</td>
                                <td className="px-3 py-2 text-right">S/ {installment.initialBalance.amount.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right">S/ {installment.interest.amount.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right">S/ {installment.amortization.amount.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right">S/ {installment.otherCosts.amount.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right font-semibold">S/ {installment.totalPayment.amount.toFixed(2)}</td>
                                <td className="px-3 py-2 text-right">S/ {installment.finalBalance.amount.toFixed(2)}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-800">
                    ℹ️ Si necesitas realizar cambios, puedes volver a los pasos anteriores.
                    Al generar nuevamente el crédito, se actualizarán todos los cálculos.
                </p>
            </div>
        </div>
    );
}

/* ========== HELPER COMPONENTS ========== */

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

function formatBonoName(type: string): string {
    const names: Record<string, string> = {
        BONO_BUEN_PAGADOR: "Bono del Buen Pagador (BBP)",
        BONO_VERDE: "Bono Verde",
        BONO_INTEGRADOR: "Bono Integrador",
        BFH_COMPRA: "Bono Familiar Habitacional (BFH)",
        BFH_CONSTRUCCION: "BFH Construcción",
        BFH_MEJORA: "BFH Mejora",
    };
    return names[type] || type.replace(/_/g, " ");
}

/* ========== CUSTOMER MODAL ========== */

interface CustomerModalProps {
    customers: CustomerEntity[];
    search: string;
    setSearch: (value: string) => void;
    onSelect: (id: string) => void;
    onClose: () => void;
}

function CustomerSelectionModal({
                                    customers,
                                    search,
                                    setSearch,
                                    onSelect,
                                    onClose,
                                }: CustomerModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Seleccionar cliente</h2>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre, email o teléfono..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Customer List */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                    {customers.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 py-8">
                            No se encontraron clientes
                        </p>
                    ) : (
                        customers.map((customer) => (
                            <button
                                key={customer.id}
                                type="button"
                                onClick={() => onSelect(customer.id)}
                                className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 p-4 text-left transition-all hover:border-green-300 hover:bg-green-50"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {customer.fullName.fullName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {customer.contactInfo.email}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">
                                            {customer.contactInfo.phoneNumber}
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2 text-xs text-slate-600">
                                    <div>
                                        <span className="text-slate-400">Edad:</span> {customer.demographics.age} años
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Estado civil:</span> {customer.demographics.maritalStatus}
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Ingreso:</span> S/ {customer.financialSummary.monthlyIncomeAmount.toFixed(0)}
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Score:</span> {customer.creditProfile.creditScore || "N/A"}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

/* ========== PROPERTY MODAL ========== */

interface PropertyModalProps {
    properties: PropertyEntity[];
    search: string;
    setSearch: (value: string) => void;
    ecoFilter: boolean | null;
    setEcoFilter: (value: boolean | null) => void;
    onSelect: (id: string) => void;
    onClose: () => void;
}

function PropertySelectionModal({
                                    properties,
                                    search,
                                    setSearch,
                                    ecoFilter,
                                    setEcoFilter,
                                    onSelect,
                                    onClose,
                                }: PropertyModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Seleccionar propiedad</h2>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Buscar por código, tipo o precio..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Eco-Friendly Filter */}
                <div className="flex gap-2 mb-4">
                    <Button
                        type="button"
                        variant={ecoFilter === null ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEcoFilter(null)}
                        className="text-xs"
                    >
                        Todas
                    </Button>
                    <Button
                        type="button"
                        variant={ecoFilter === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEcoFilter(true)}
                        className="text-xs"
                    >
                        ✓ Solo Eco-Friendly
                    </Button>
                    <Button
                        type="button"
                        variant={ecoFilter === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEcoFilter(false)}
                        className="text-xs"
                    >
                        No Eco-Friendly
                    </Button>
                </div>

                {/* Property List */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                    {properties.length === 0 ? (
                        <p className="text-center text-sm text-slate-500 py-8">
                            No se encontraron propiedades
                        </p>
                    ) : (
                        properties.map((property) => {
                            const price = property.pricing?.priceAmount || 0;
                            const isEcoFriendly = property.sustainability?.hasCertification;
                            return (
                                <button
                                    key={property.id}
                                    type="button"
                                    onClick={() => onSelect(property.id)}
                                    className="w-full rounded-lg border-2 border-slate-200 bg-slate-50 p-4 text-left transition-all hover:border-green-300 hover:bg-green-50"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {property.propertyCode}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {property.propertyType}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-blue-600">
                                                S/ {price.toFixed(0)}
                                            </p>
                                            {isEcoFriendly && (
                                                <p className="text-xs text-green-600 font-medium">
                                                    ✓ Eco-friendly
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-xs text-slate-600">
                                        <div>
                                            <span className="text-slate-400">Dorm:</span> {property.bedrooms}
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Baños:</span> {property.bathrooms}
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Área:</span> {property.pricing?.builtArea || 0} m²
                                        </div>
                                        <div>
                                            <span className="text-slate-400">Piso:</span> {property.floor || "N/A"}
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}