"use client";

import React, {useEffect, useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {Search} from "lucide-react";

import SidebarLayout from "@/components/layout/SidebarLayout";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

import {getLoanSimulationService} from "@/services/loan-simulation.service";
import {LoanSimulationEntity, SimulationStatusEnum,} from "@/types/loan-simulation.types";

export default function SimulationsPage() {
    const router = useRouter();
    const simulationService = getLoanSimulationService();

    const [simulations, setSimulations] = useState<LoanSimulationEntity[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadSimulations().then();
    }, []);

    async function loadSimulations() {
        try {
            setLoading(true);
            const data = await simulationService.getAll();
            setSimulations(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Error al cargar simulaciones");
        } finally {
            setLoading(false);
        }
    }

    const savedSimulations = useMemo(
        () => simulations.filter((s) => s.status === SimulationStatusEnum.SAVED),
        [simulations]
    );

    const filteredSimulations = useMemo(() => {
        if (!search.trim()) return savedSimulations;

        const term = search.toLowerCase();

        return savedSimulations.filter((sim) => {
            return (
                sim.id.toLowerCase().includes(term) ||
                sim.customerId.toLowerCase().includes(term) ||
                (sim.propertyId ?? "").toLowerCase().includes(term) ||
                sim.institutionId.toLowerCase().includes(term) ||
                sim.loanProgramId.toLowerCase().includes(term)
            );
        });
    }, [savedSimulations, search]);

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
                            Visualiza las simulaciones guardadas (estado SAVED).
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={loadSimulations}
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
                            placeholder="Buscar por ID, cliente, institución…"
                            className="pl-9"
                        />
                    </div>

                    <div className="flex gap-3 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium">
                            Total simulaciones: {simulations.length}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-700">
                            Estado “SAVED”: {savedSimulations.length}
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
                                    <th className="px-4 py-3 text-left">ID</th>
                                    <th className="px-4 py-3 text-left">Cliente</th>
                                    <th className="px-4 py-3 text-left">Propiedad</th>
                                    <th className="px-4 py-3 text-right">Monto</th>
                                    <th className="px-4 py-3 text-right">Cuota</th>
                                    <th className="px-4 py-3 text-right">TCEA</th>
                                    <th className="px-4 py-3 text-right">Plazo</th>
                                    <th className="px-4 py-3 text-left">Creado</th>
                                    <th className="px-4 py-3 text-center">Acciones</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredSimulations.map((sim) => {
                                    const loanAmount =
                                        sim.parameters.loanAmount.amount;

                                    const monthlyPayment =
                                        sim.paymentPlan?.monthlyPayment.amount;

                                    return (
                                        <tr
                                            key={sim.id}
                                            className="border-b border-slate-100 hover:bg-slate-50/70"
                                        >
                                            <td className="px-4 py-3 text-xs font-mono text-slate-600">
                                                {sim.id}
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {sim.customerId}
                                            </td>

                                            <td className="px-4 py-3 text-slate-700">
                                                {sim.propertyId ?? "-"}
                                            </td>

                                            <td className="px-4 py-3 text-right text-slate-800">
                                                {formatCurrency(loanAmount)}
                                            </td>

                                            <td className="px-4 py-3 text-right text-slate-800">
                                                {monthlyPayment != null
                                                    ? formatCurrency(monthlyPayment)
                                                    : "-"}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                {sim.paymentPlan?.tcea != null
                                                    ? `${sim.paymentPlan.tcea.toFixed(
                                                        2
                                                    )}%`
                                                    : "-"}
                                            </td>

                                            <td className="px-4 py-3 text-right">
                                                {sim.parameters.termInMonths} m
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
                                                        router.push(
                                                            `/simulations/${sim.id}`
                                                        )
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
