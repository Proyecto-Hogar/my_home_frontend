"use client";

import React, {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {toast} from "sonner";
import {ArrowLeft, Banknote, Home, Mail, Phone, Users} from "lucide-react";

import {getCustomerService} from "@/services/customer.service";
import {getLoanProgramService} from "@/services/loan-program.service";

import type {CustomerEntity} from "@/types/customer.types";
import {CustomerStatusEnum} from "@/types/customer.types";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Card, CardContent, CardHeader, CardTitle,} from "@/components/ui/card";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {EligibilityResponse} from "@/types/eligibility.types";
import SidebarLayout from "@/components/layout/SidebarLayout";

interface Params {
    id?: string | string[];
}

export default function CustomerDetailPage() {
    const params = useParams() as Params;
    const router = useRouter();

    const customerId = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const customerService = getCustomerService();
    const loanProgramService = getLoanProgramService();

    const [customer, setCustomer] = useState<CustomerEntity | null>(
        null
    );
    const [eligibility, setEligibility] =
        useState<EligibilityResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [eligibilityLoading, setEligibilityLoading] =
        useState(false);

    useEffect(() => {
        if (!customerId) {
            toast.error("No se encontró el identificador del cliente.");
            router.push("/customers");
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const [cust, eligibilityResp] = await Promise.all([
                    customerService.getById(customerId),
                    loanProgramService
                        .validateEligibility(customerId)
                        .catch(() => null), // si falla elegibilidad igual mostramos el cliente
                ]);

                setCustomer(cust);
                if (eligibilityResp) setEligibility(eligibilityResp);
            } catch (err) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "No se pudo cargar el cliente.";
                toast.error("Error al cargar el cliente", {
                    description: msg,
                });
                router.push("/customers");
            } finally {
                setLoading(false);
            }
        };

        load().then();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [customerId]);

    if (!customerId) {
        return null;
    }

    const handleRecalculateEligibility = async () => {
        if (!customer) return;

        try {
            setEligibilityLoading(true);
            toast.loading("Recalculando elegibilidad...", {
                id: `eligibility-${customer.id}`,
            });

            const result = await loanProgramService.validateEligibility(
                customer.id
            );
            setEligibility(result);

            const { mivivienda, techoPropio } = result;

            const mvMsg = mivivienda.eligible
                ? "✅ Elegible para Nuevo Crédito MiVivienda."
                : "❌ No elegible para Nuevo Crédito MiVivienda.";
            const mvDetails = (
                mivivienda.eligible
                    ? mivivienda.reasons
                    : mivivienda.failureReasons
            ).join(" | ");

            const tpMsg = techoPropio.eligible
                ? "✅ Elegible para Techo Propio."
                : "❌ No elegible para Techo Propio.";
            const tpDetails = (
                techoPropio.eligible
                    ? techoPropio.reasons
                    : techoPropio.failureReasons
            ).join(" | ");

            toast.success("Elegibilidad actualizada", {
                id: `eligibility-${customer.id}`,
                description: [mvMsg, mvDetails, "", tpMsg, tpDetails]
                    .filter(Boolean)
                    .join("\n"),
            });
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "No se pudo recalcular la elegibilidad.";
            toast.error("Error al recalcular elegibilidad", {
                id: `eligibility-${customer.id}`,
                description: msg,
            });
        } finally {
            setEligibilityLoading(false);
        }
    };

    const fullName = customer?.fullName.fullName ?? "";

    const initials =
        customer &&
        (
            (customer.fullName.firstName[0] || "") +
            (customer.fullName.lastName[0] || "")
        ).toUpperCase();

    return (
        <SidebarLayout>
            <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/customers")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="sr-only">Volver</span>
                        </Button>

                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback>
                                    {initials || "CL"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {loading ? "Cargando cliente..." : fullName || "Cliente"}
                                </h1>
                                {!loading && customer && (
                                    <p className="text-xs text-muted-foreground">
                                        {customer.contactInfo.email} ·{" "}
                                        {customer.contactInfo.phoneNumber}
                                    </p>
                                )}
                            </div>
                            {!loading && customer && (
                                <StatusBadge status={customer.status} />
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRecalculateEligibility}
                            disabled={eligibilityLoading || loading || !customer}
                        >
                            {eligibilityLoading
                                ? "Recalculando..."
                                : "Recalcular elegibilidad"}
                        </Button>
                    </div>
                </div>

                {/* CONTENT */}
                {loading || !customer ? (
                    <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                        Cargando información del cliente...
                    </div>
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
                        {/* LEFT COLUMN: datos personales + socioeconómicos */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Datos personales y de contacto
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-xs">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ReadOnlyField
                                            label="Nombres"
                                            value={`${customer.fullName.firstName}${
                                                customer.fullName.middleName
                                                    ? ` ${customer.fullName.middleName}`
                                                    : ""
                                            }`}
                                        />
                                        <ReadOnlyField
                                            label="Apellidos"
                                            value={customer.fullName.lastName}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ReadOnlyField
                                            label="Correo electrónico"
                                            value={customer.contactInfo.email}
                                            icon={<Mail className="h-3 w-3" />}
                                        />
                                        <ReadOnlyField
                                            label="Teléfono"
                                            value={customer.contactInfo.phoneNumber}
                                            icon={<Phone className="h-3 w-3" />}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ReadOnlyField
                                            label="Fecha de nacimiento"
                                            value={customer.demographics.birthDate}
                                        />
                                        <ReadOnlyField
                                            label="Edad"
                                            value={`${customer.demographics.age} años`}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ReadOnlyField
                                            label="Estado civil"
                                            value={formatMaritalStatus(
                                                customer.demographics.maritalStatus
                                            )}
                                        />
                                        <ReadOnlyField
                                            label="Nivel educativo"
                                            value={formatEducationLevel(
                                                customer.demographics.educationLevel
                                            )}
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <p className="mb-1 flex items-center gap-1 text-[11px] font-medium text-slate-600">
                                            <Home className="h-3 w-3" />
                                            Dirección
                                        </p>
                                        <Input
                                            readOnly
                                            value={customer.contactInfo.address.fullAddress}
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Información socioeconómica y laboral
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-xs">
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <ReadOnlyField
                                            label="Ocupación"
                                            value={customer.employmentInfo.occupation}
                                        />
                                        <ReadOnlyField
                                            label="Profesión"
                                            value={customer.employmentInfo.profession}
                                        />
                                        <ReadOnlyField
                                            label="Tipo de empleo"
                                            value={formatEmploymentType(
                                                customer.employmentInfo.employmentType
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <ReadOnlyField
                                            label="Ingreso mensual titular"
                                            value={formatCurrency(
                                                customer.financialSummary
                                                    .monthlyIncomeAmount,
                                                customer.financialSummary
                                                    .monthlyIncomeCurrency
                                            )}
                                            icon={<Banknote className="h-3 w-3" />}
                                        />
                                        <ReadOnlyField
                                            label="Gastos mensuales"
                                            value={formatCurrency(
                                                customer.financialSummary
                                                    .monthlyExpensesAmount,
                                                customer.financialSummary
                                                    .monthlyExpensesCurrency
                                            )}
                                        />
                                        <ReadOnlyField
                                            label="Ingreso familiar neto"
                                            value={formatCurrency(
                                                customer.financialSummary.netIncome,
                                                customer.financialSummary
                                                    .monthlyIncomeCurrency
                                            )}
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <ReadOnlyField
                                            label="Dependientes"
                                            value={`${customer.familyDetails.dependents}`}
                                            icon={<Users className="h-3 w-3" />}
                                        />
                                        <ReadOnlyField
                                            label="Ingreso familiar total"
                                            value={formatCurrency(
                                                customer.familyDetails
                                                    .totalFamilyIncomeAmount,
                                                customer.familyDetails
                                                    .totalFamilyIncomeCurrency
                                            )}
                                        />
                                        <ReadOnlyField
                                            label="Tiene otros préstamos"
                                            value={
                                                customer.creditProfile.hasOtherLoans
                                                    ? "Sí"
                                                    : "No"
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <ReadOnlyField
                                            label="Tiene otras propiedades"
                                            value={
                                                customer.hasOtherProperties ? "Sí" : "No"
                                            }
                                        />
                                        <ReadOnlyField
                                            label="Recibió apoyo estatal"
                                            value={
                                                customer.hasReceivedStateHousingSupport
                                                    ? "Sí"
                                                    : "No"
                                            }
                                        />
                                        <ReadOnlyField
                                            label="Origen de fondos"
                                            value={formatFundOrigin(
                                                customer.fundOrigin
                                            )}
                                        />
                                    </div>

                                    {customer.hasReceivedStateHousingSupport &&
                                        customer.stateHousingSupportDetails && (
                                            <div>
                                                <label className="mb-1 block text-[11px] font-medium text-slate-600">
                                                    Detalles del apoyo estatal
                                                </label>
                                                <Textarea
                                                    readOnly
                                                    value={customer.stateHousingSupportDetails}
                                                    className="min-h-[60px] text-xs"
                                                />
                                            </div>
                                        )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: elegibilidad y familia */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Precalificación del cliente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-xs">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ReadOnlyField
                                            label="Califica para crédito"
                                            value={
                                                customer.isEligibleForLoan
                                                    ? "Sí"
                                                    : "No todavía"
                                            }
                                        />
                                        <ReadOnlyField
                                            label="Buen comportamiento crediticio"
                                            value={
                                                customer.creditProfile.hasGoodCredit
                                                    ? "Sí"
                                                    : "No"
                                            }
                                        />
                                    </div>

                                    {!eligibility && (
                                        <p className="text-[11px] text-muted-foreground">
                                            Aún no se ha podido obtener la información de
                                            elegibilidad de los programas. Puedes usar
                                            &ldquo;Recalcular elegibilidad&rdquo; para
                                            intentarlo nuevamente.
                                        </p>
                                    )}

                                    {eligibility && (
                                        <EligibilitySummary eligibility={eligibility} />
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">
                                        Detalle familiar
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-xs">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <ReadOnlyField
                                            label="Tamaño del hogar"
                                            value={`${customer.familyDetails.familySize} personas`}
                                        />
                                        <ReadOnlyField
                                            label="Miembro con silla de ruedas"
                                            value={
                                                customer.familyDetails.hasWheelchairUser
                                                    ? "Sí"
                                                    : "No"
                                            }
                                        />
                                    </div>

                                    {customer.familyDetails.spouse.hasSpouse && (
                                        <>
                                            <p className="text-[11px] font-semibold text-slate-600">
                                                Cónyuge / conviviente
                                            </p>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <ReadOnlyField
                                                    label="Nombre completo"
                                                    value={`${customer.familyDetails.spouse.firstName ?? ""} ${
                                                        customer.familyDetails.spouse.lastName ?? ""
                                                    }`.trim() || "—"}
                                                />
                                                <ReadOnlyField
                                                    label="Ocupación"
                                                    value={
                                                        customer.familyDetails.spouse
                                                            .occupation || "—"
                                                    }
                                                />
                                            </div>
                                            <div className="grid gap-4 md:grid-cols-2">
                                                <ReadOnlyField
                                                    label="Documento"
                                                    value={
                                                        customer.familyDetails.spouse
                                                            .documentNumber || "—"
                                                    }
                                                />
                                                <ReadOnlyField
                                                    label="Ingreso mensual"
                                                    value={
                                                        customer.familyDetails.spouse
                                                            .monthlyIncomeAmount
                                                            ? formatCurrency(
                                                                customer.familyDetails.spouse
                                                                    .monthlyIncomeAmount,
                                                                customer.familyDetails.spouse
                                                                    .monthlyIncomeCurrency ||
                                                                customer.familyDetails
                                                                    .totalFamilyIncomeCurrency
                                                            )
                                                            : "—"
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </SidebarLayout>
    );
}

/* ---------- SUBCOMPONENTES ---------- */

function ReadOnlyField({
                           label,
                           value,
                           icon,
                       }: {
    label: string;
    value: string;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-medium text-slate-600">
                {label}
            </p>
            <div className="flex items-center gap-1.5 rounded-md border bg-slate-50 px-2 py-1.5 text-xs text-slate-800">
                {icon}
                <span className="truncate">{value || "—"}</span>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: CustomerStatusEnum }) {
    let className =
        "ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium";
    let label: string;

    switch (status) {
        case CustomerStatusEnum.ACTIVE:
            className +=
                " bg-emerald-50 text-emerald-700 border-emerald-200";
            label = "Activo";
            break;
        case CustomerStatusEnum.SUSPENDED:
            className += " bg-amber-50 text-amber-700 border-amber-200";
            label = "Suspendido";
            break;
        case CustomerStatusEnum.INACTIVE:
        default:
            className += " bg-slate-50 text-slate-600 border-slate-200";
            label = "Inactivo";
            break;
    }

    return <span className={className}>{label}</span>;
}

/* ---------- ELEGIBILITY UI ---------- */

function EligibilitySummary({
                                eligibility,
                            }: {
    eligibility: EligibilityResponse;
}) {
    const { mivivienda, techoPropio } = eligibility;

    const bonosElegibles = mivivienda.availableBonos.filter(
        (b) => b.eligible && b.amount != null
    );

    return (
        <div className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-700">
                        Nuevo Crédito MiVivienda
                    </p>
                    <span
                        className={
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                            (mivivienda.eligible
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200")
                        }
                    >
            {mivivienda.eligible ? "ELEGIBLE" : "NO ELEGIBLE"}
          </span>
                </div>
                <ul className="ml-4 list-disc space-y-1 text-[11px] text-slate-700">
                    {(mivivienda.eligible
                            ? mivivienda.reasons
                            : mivivienda.failureReasons
                    ).map((r, idx) => (
                        <li key={idx}>{r}</li>
                    ))}
                </ul>

                {bonosElegibles.length > 0 && (
                    <div className="mt-2">
                        <p className="text-[11px] font-semibold text-slate-700">
                            Bonos MiVivienda disponibles
                        </p>
                        <ul className="ml-4 list-disc space-y-1 text-[11px] text-slate-700">
                            {bonosElegibles.map((b, idx) => (
                                <li key={idx}>
                                    <span className="font-medium">{b.type}</span>:{" "}
                                    {b.amount != null
                                        ? `S/ ${b.amount.toFixed(2)}`
                                        : "Monto por definir"}
                                    {b.reason ? ` · ${b.reason}` : ""}
                                    {b.priceRange ? ` · Rango: ${b.priceRange}` : ""}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="rounded-lg border bg-slate-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                    <p className="text-[11px] font-semibold text-slate-700">
                        Programa Techo Propio
                    </p>
                    <span
                        className={
                            "rounded-full px-2 py-0.5 text-[10px] font-semibold " +
                            (techoPropio.eligible
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200")
                        }
                    >
            {techoPropio.eligible ? "ELEGIBLE" : "NO ELEGIBLE"}
          </span>
                </div>
                <ul className="ml-4 list-disc space-y-1 text-[11px] text-slate-700">
                    {(techoPropio.eligible
                            ? techoPropio.reasons
                            : techoPropio.failureReasons
                    ).map((r, idx) => (
                        <li key={idx}>{r}</li>
                    ))}
                </ul>

                {techoPropio.modalidad && (
                    <p className="mt-2 text-[11px] text-slate-700">
                        <span className="font-semibold">Modalidad:&nbsp;</span>
                        {techoPropio.modalidad}
                    </p>
                )}

                {techoPropio.availableBonos &&
                    techoPropio.availableBonos.length > 0 && (
                        <div className="mt-2">
                            <p className="text-[11px] font-semibold text-slate-700">
                                Bonos Techo Propio
                            </p>
                            <ul className="ml-4 list-disc space-y-1 text-[11px] text-slate-700">
                                {techoPropio.availableBonos.map((b, idx) => (
                                    <li key={idx}>
                                        <span className="font-medium">{b.type}</span>:{" "}
                                        {b.amount != null
                                            ? `S/ ${b.amount.toFixed(2)}`
                                            : "Monto por definir"}
                                        {b.reason ? ` · ${b.reason}` : ""}
                                        {!b.eligible && b.failureReason
                                            ? ` · No elegible: ${b.failureReason}`
                                            : ""}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
            </div>
        </div>
    );
}

/* ---------- FORMAT HELPERS ---------- */

function formatCurrency(amount: number, currency: string) {
    if (Number.isNaN(amount)) return "—";
    const symbol = currency === "USD" ? "$" : "S/";
    return `${symbol} ${amount.toLocaleString("es-PE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

function formatMaritalStatus(status: string) {
    switch (status) {
        case "SINGLE":
            return "Soltero(a)";
        case "MARRIED":
            return "Casado(a)";
        case "DIVORCED":
            return "Divorciado(a)";
        case "WIDOWED":
            return "Viudo(a)";
        case "COHABITING":
            return "Conviviente";
        default:
            return status;
    }
}

function formatEducationLevel(level: string) {
    switch (level) {
        case "PRIMARY":
            return "Primaria";
        case "SECONDARY":
            return "Secundaria";
        case "TECHNICAL":
            return "Técnica";
        case "UNIVERSITY":
            return "Universitaria";
        case "POSTGRADUATE":
            return "Postgrado";
        default:
            return level;
    }
}

function formatEmploymentType(type: string) {
    switch (type) {
        case "DEPENDENT":
            return "Dependiente";
        case "INDEPENDENT":
            return "Independiente";
        case "RETIRED":
            return "Jubilado";
        case "UNEMPLOYED":
            return "Desempleado";
        default:
            return type;
    }
}

function formatFundOrigin(origin: string) {
    switch (origin) {
        case "FINANCIAL_SYSTEM_SAVINGS":
            return "Ahorros en sistema financiero";
        case "PERSONAL_SAVINGS":
            return "Ahorros personales";
        case "FAMILY_SUPPORT":
            return "Apoyo familiar";
        case "SALE_OF_ASSETS":
            return "Venta de activos";
        case "INHERITANCE":
            return "Herencia";
        case "OTHER":
            return "Otro";
        default:
            return origin;
    }
}
