"use client";

import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Search} from "lucide-react";

import SidebarLayout from "@/components/layout/SidebarLayout";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

import {getLoanSimulationService} from "@/services/loan-simulation.service";
import {getCustomerService} from "@/services/customer.service";
import {getPropertyService} from "@/services/property.service";
import {LoanSimulationEntity, SimulationStatusEnum,} from "@/types/loan-simulation.types";
import type {CustomerEntity} from "@/types/customer.types";
import type {PropertyEntity} from "@/types/property.types";

export default function SimulationsPage() {
    const router = useRouter();
    const simulationService = getLoanSimulationService();
    const customerService = getCustomerService();
    const propertyService = getPropertyService();

    const [simulations, setSimulations] = useState<LoanSimulationEntity[]>([]);
    const [customers, setCustomers] = useState<CustomerEntity[]>([]);
    const [properties, setProperties] = useState<PropertyEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadAllData().then();
    }, []);

    async function loadAllData() {
        try {
            setLoading(true);

            // Load all data in parallel
            const [simulationsData, customersData, propertiesData] = await Promise.all([
                simulationService.getAll(),
                customerService.getAll(),
                propertyService.getAll(),
            ]);

            setSimulations(simulationsData || []);
            setCustomers(customersData || []);
            setProperties(propertiesData || []);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar datos");
        } finally {
            setLoading(false);
        }
    }

    // Helper functions to get names
    function getCustomerName(customerId: string): string {
        const customer = customers.find(c => c.id === customerId);
        return customer?.fullName.fullName || "Cliente desconocido";
    }

    function getCustomerEmail(customerId: string): string {
        const customer = customers.find(c => c.id === customerId);
        return customer?.contactInfo.email || "";
    }

    function getPropertyCode(propertyId: string | null): string {
        if (!propertyId) return "-";
        const property = properties.find(p => p.id === propertyId);
        return property?.propertyCode || "Propiedad desconocida";
    }

    function getPropertyType(propertyId: string | null): string {
        if (!propertyId) return "";
        const property = properties.find(p => p.id === propertyId);
        return property?.propertyType || "";
    }

    const savedSimulations = useMemo(
        () => simulations.filter((s) => s.status === SimulationStatusEnum.SAVED),
        [simulations]
    );

    const filteredSimulations = useMemo(() => {
        if (!search.trim()) return savedSimulations;

        const term = search.toLowerCase();

        return savedSimulations.filter((sim) => {
            const customerName = getCustomerName(sim.customerId).toLowerCase();
            const customerEmail = getCustomerEmail(sim.customerId).toLowerCase();
            const propertyCode = getPropertyCode(sim.propertyId).toLowerCase();

            return (
                customerName.includes(term) ||
                customerEmail.includes(term) ||
                propertyCode.includes(term) ||
                sim.parameters.loanAmount.amount.toString().includes(term)
            );
        });
    }, [savedSimulations, search, customers, properties]);

    function formatCurrency(amount?: number, currency = "PEN") {
        if (amount == null) return "-";
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(amount);
    }

    function formatDate(dateStr?: string) {
        if (!dateStr) return "-";
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) return "-";
        return d.toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <SidebarLayout>
            <div className="flex h-full flex-col">
                {/* HEADER */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Simulaciones de crédito
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Visualiza las simulaciones guardadas y genera nuevas.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={loadAllData}
                            disabled={loading}
                        >
                            {loading ? "Actualizando..." : "Actualizar"}
                        </Button>

                        <Button
                            type="button"
                            onClick={() => router.push("/simulations/new")}
                        >
                            Nueva simulación
                        </Button>
                    </div>
                </div>

                {/* SEARCH & SUMMARY */}
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar por cliente, propiedad, monto..."
                            className="pl-9"
                        />
                    </div>

                    <div className="flex gap-3 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                            Total simulaciones: {simulations.length}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
                            Guardadas: {savedSimulations.length}
                        </span>
                    </div>
                </div>

                {/* TABLE */}
                <div className="flex-1 overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="h-full overflow-auto">
                        {loading ? (
                            <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                                Cargando simulaciones...
                            </div>
                        ) : filteredSimulations.length === 0 ? (
                            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-slate-500">
                                <p>No se encontraron simulaciones guardadas.</p>
                                {simulations.length > 0 && (
                                    <p className="text-xs text-slate-400">
                                        Prueba limpiando el buscador.
                                    </p>
                                )}
                            </div>
                        ) : (
                            <table className="min-w-full border-collapse text-sm">
                                <thead className="sticky top-0 z-10 bg-slate-50">
                                <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                                    <th className="px-4 py-3 text-left">Cliente</th>
                                    <th className="px-4 py-3 text-left">Propiedad</th>
                                    <th className="px-4 py-3 text-right">Monto Préstamo</th>
                                    <th className="px-4 py-3 text-right">Cuota Mensual</th>
                                    <th className="px-4 py-3 text-right">TCEA</th>
                                    <th className="px-4 py-3 text-right">Plazo</th>
                                    <th className="px-4 py-3 text-left">Fecha Creación</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredSimulations.map((sim) => {
                                    const customerName = getCustomerName(sim.customerId);
                                    const customerEmail = getCustomerEmail(sim.customerId);
                                    const propertyCode = getPropertyCode(sim.propertyId);
                                    const propertyType = getPropertyType(sim.propertyId);
                                    const loanAmount = sim.parameters.loanAmount.amount;
                                    const monthlyPayment = sim.paymentPlan?.monthlyPayment.amount;

                                    return (
                                        <tr
                                            key={sim.id}
                                            className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-800">
                                                        {customerName}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {customerEmail}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-700">
                                                        {propertyCode}
                                                    </span>
                                                    {propertyType && (
                                                        <span className="text-xs text-slate-500">
                                                            {propertyType}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 text-right font-semibold text-slate-800">
                                                {formatCurrency(loanAmount)}
                                            </td>

                                            <td className="px-4 py-3 text-right text-slate-800">
                                                {monthlyPayment != null
                                                    ? formatCurrency(monthlyPayment)
                                                    : "-"}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                <span className={sim.paymentPlan?.tcea ? "font-medium text-green-700" : "text-slate-400"}>
                                                    {sim.paymentPlan?.tcea != null
                                                        ? `${sim.paymentPlan.tcea.toFixed(2)}%`
                                                        : "-"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-right text-slate-700">
                                                {sim.parameters.termInMonths} meses
                                                <span className="block text-xs text-slate-500">
                                                    ({(sim.parameters.termInMonths / 12).toFixed(1)} años)
                                                </span>
                                            </td>

                                            <td className="px-4 py-3 text-slate-600 text-xs">
                                                {formatDate(sim.simulationDate)}
                                            </td>

                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        router.push(`/simulations/${sim.id}`)
                                                    }
                                                >
                                                    Ver detalle
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}