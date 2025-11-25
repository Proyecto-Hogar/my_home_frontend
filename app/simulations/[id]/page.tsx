"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
    ArrowLeft,
    Loader2,
} from "lucide-react";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";

import { getLoanSimulationService } from "@/services/loan-simulation.service";
import { getCustomerService } from "@/services/customer.service";
import { getPropertyService } from "@/services/property.service";
import { getFinancialInstitutionService } from "@/services/financial-institution.service";

import type { LoanSimulationEntity } from "@/types/loan-simulation.types";
import type { CustomerEntity } from "@/types/customer.types";
import type { PropertyEntity } from "@/types/property.types";
import type { InstitutionRateEntity } from "@/types/financial-institution.types";

export default function SimulationDetailsPage() {
    const router = useRouter();
    const { id } = useParams() as { id: string };

    const simulationService = getLoanSimulationService();
    const customerService = getCustomerService();
    const propertyService = getPropertyService();
    const institutionService = getFinancialInstitutionService();

    const [loading, setLoading] = useState(true);
    const [simulation, setSimulation] = useState<LoanSimulationEntity | null>(null);
    const [customer, setCustomer] = useState<CustomerEntity | null>(null);
    const [property, setProperty] = useState<PropertyEntity | null>(null);
    const [institution, setInstitution] = useState<InstitutionRateEntity | null>(null);

    async function load() {
        try {
            setLoading(true);

            const sim = await simulationService.getById(id);
            if (!sim) {
                toast.error("Simulación no encontrada");
                return router.push("/simulations");
            }

            setSimulation(sim);

            const cust = await customerService.getById(sim.customerId);
            const prop = await propertyService.getById(sim.propertyId);
            const inst = await institutionService.getInstitutionRate(
                sim.institutionId,
                sim.loanProgramId
            );

            setCustomer(cust);
            setProperty(prop);
            setInstitution(inst);
        } catch (e) {
            console.error(e);
            toast.error("Error al cargar la simulación");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    if (loading) {
        return (
            <SidebarLayout>
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </SidebarLayout>
        );
    }

    if (!simulation) {
        return (
            <SidebarLayout>
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No se encontró la simulación.
                </div>
            </SidebarLayout>
        );
    }

    const plan = simulation.paymentPlan;
    const installments = plan?.installments || [];

    function formatCurrency(amount?: number) {
        if (amount == null) return "-";
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
        }).format(amount);
    }

    function formatDate(date?: string) {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("es-PE");
    }

    return (
        <SidebarLayout>
            <div className="flex flex-col flex-1 overflow-hidden p-6">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Detalles de la Simulación
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Información completa del crédito generado.
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/simulations")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </div>
                </div>

                {/* IDENTIFICADORES */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoCard label="ID Simulación" value={simulation.id} />
                    <InfoCard label="Fecha" value={formatDate(simulation.simulationDate)} />
                    <InfoCard label="Institución" value={institution?.institutionName || "-"} />
                </div>

                {/* RESUMEN GENERAL */}
                <Section title="Resumen del crédito">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        <SummaryCard
                            title="Cuota mensual"
                            value={formatCurrency(plan?.monthlyPayment?.amount)}
                            color="blue"
                        />

                        <SummaryCard
                            title="TCEA"
                            value={plan ? `${plan.tcea.toFixed(2)} %` : "-"}
                            color="green"
                        />

                        <SummaryCard
                            title="TIR"
                            value={plan ? `${plan.tir.toFixed(2)} %` : "-"}
                            color="purple"
                        />

                        <SummaryCard
                            title="VAN"
                            value={formatCurrency(plan?.van.amount)}
                            color="orange"
                        />
                    </div>
                </Section>

                {/* CLIENTE Y PROPIEDAD */}
                <Section title="Cliente y Propiedad">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Cliente */}
                        <div className="border rounded-xl p-4 bg-white">
                            <h3 className="font-semibold mb-3 text-sm">Cliente</h3>
                            <div className="space-y-1 text-xs">
                                <p><strong>Nombre:</strong> {customer?.fullName.fullName}</p>
                                <p><strong>Email:</strong> {customer?.contactInfo.email}</p>
                                <p><strong>Ingreso mensual:</strong> S/ {customer?.financialSummary.monthlyIncomeAmount.toFixed(2)}</p>
                                <p><strong>Score:</strong> {customer?.creditProfile.creditScore || "N/A"}</p>
                            </div>
                        </div>

                        {/* Propiedad */}
                        <div className="border rounded-xl p-4 bg-white">
                            <h3 className="font-semibold mb-3 text-sm">Propiedad</h3>
                            <div className="space-y-1 text-xs">
                                <p><strong>Código:</strong> {property?.propertyCode}</p>
                                <p><strong>Tipo:</strong> {property?.propertyType}</p>
                                <p><strong>Precio:</strong> {formatCurrency(property?.pricing?.priceAmount)}</p>
                                <p><strong>Dormitorios:</strong> {property?.bedrooms}</p>
                            </div>
                        </div>

                    </div>
                </Section>

                {/* TABLA CRONOGRAMA */}
                <Section title="Cronograma de pagos">
                    <div className="rounded-xl border overflow-hidden">
                        <div className="max-h-[420px] overflow-auto">
                            <table className="min-w-full text-xs">
                                <thead className="bg-slate-100 sticky top-0">
                                <tr>
                                    <Th>#</Th>
                                    <Th>Fecha</Th>
                                    <Th className="text-right">Saldo Inicial</Th>
                                    <Th className="text-right">Interés</Th>
                                    <Th className="text-right">Amortización</Th>
                                    <Th className="text-right">Otros Costos</Th>
                                    <Th className="text-right">Cuota</Th>
                                    <Th className="text-right">Saldo Final</Th>
                                </tr>
                                </thead>

                                <tbody>
                                {installments.map((row) => (
                                    <tr key={row.installmentNumber} className="border-t">
                                        <Td>{row.installmentNumber}</Td>
                                        <Td>{formatDate(row.dueDate)}</Td>
                                        <TdRight>{formatCurrency(row.initialBalance.amount)}</TdRight>
                                        <TdRight>{formatCurrency(row.interest.amount)}</TdRight>
                                        <TdRight>{formatCurrency(row.amortization.amount)}</TdRight>
                                        <TdRight>{formatCurrency(row.otherCosts.amount)}</TdRight>
                                        <TdRight className="font-semibold">
                                            {formatCurrency(row.totalPayment.amount)}
                                        </TdRight>
                                        <TdRight>{formatCurrency(row.finalBalance.amount)}</TdRight>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Section>

            </div>
        </SidebarLayout>
    );
}

/* ---------------------- COMPONENTES UTILITARIOS ---------------------- */

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-semibold mt-1">{value}</p>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mb-8">
            <h2 className="text-xs font-semibold tracking-wide uppercase text-slate-500 mb-3">
                {title}
            </h2>
            {children}
        </div>
    );
}

function SummaryCard({
                         title,
                         value,
                         color,
                     }: {
    title: string;
    value: string | number;
    color: "blue" | "green" | "orange" | "purple";
}) {
    const colorMap = {
        blue: "border-blue-200 bg-blue-50 text-blue-700",
        green: "border-green-200 bg-green-50 text-green-700",
        purple: "border-purple-200 bg-purple-50 text-purple-700",
        orange: "border-orange-200 bg-orange-50 text-orange-700",
    };

    return (
        <div className={`rounded-xl border-2 p-4 text-center ${colorMap[color]}`}>
            <p className="text-xs opacity-75 mb-1">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
        </div>
    );
}

function Th({ children, className = "" }: any) {
    return (
        <th className={`px-3 py-2 text-left font-semibold ${className}`}>{children}</th>
    );
}

function Td({ children }: any) {
    return <td className="px-3 py-2">{children}</td>;
}

function TdRight({ children, className = "" }: any) {
    return <td className={`px-3 py-2 text-right ${className}`}>{children}</td>;
}
