"use client";

import React, {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {EllipsisVertical, Mail, UserCircle,} from "lucide-react";
import {useRouter} from "next/navigation";
import {toast} from "sonner";

import {getCustomerService} from "@/services/customer.service";
import type {CustomerEntity, CustomerStatusEnum} from "@/types/customer.types";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {getLoanProgramService} from "@/services/loan-program.service";
import {EligibilityResponse} from "@/types/eligibility.types";
import SidebarLayout from "@/components/layout/SidebarLayout";

const PAGE_SIZE = 5;

export default function CustomersPage() {
    const router = useRouter();
    const customerService = getCustomerService();
    const loanProgramService = getLoanProgramService();

    const [customers, setCustomers] = useState<CustomerEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [eligibilityMap, setEligibilityMap] = useState<
        Record<string, EligibilityResponse | null>
    >({});


    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await customerService.getAll();
                setCustomers(data);

                const results = await Promise.all(
                    data.map((c) =>
                        loanProgramService
                            .validateEligibility(c.id)
                            .then((r) => ({ id: c.id, data: r }))
                            .catch(() => ({ id: c.id, data: null }))
                    )
                );

                const map: Record<string, EligibilityResponse | null> = {};
                results.forEach((r) => (map[r.id] = r.data));
                setEligibilityMap(map);

            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "No se pudieron cargar los clientes.";
                toast.error("Error al cargar clientes", { description: message });
            } finally {
                setLoading(false);
            }
        };

        load().then();
    }, [customerService, loanProgramService]);

    // ---- FILTER + PAGINATION ----
    const filteredCustomers = useMemo(() => {
        if (!search.trim()) return customers;

        const query = search.toLowerCase();
        return customers.filter((c) => {
            const fullName = c.fullName.fullName.toLowerCase();
            const email = c.contactInfo.email.toLowerCase();
            const phone = c.contactInfo.phoneNumber.toLowerCase();

            return (
                fullName.includes(query) ||
                email.includes(query) ||
                phone.includes(query)
                // Cuando tengas DNI/documento en el modelo, lo agregas aquí
            );
        });
    }, [customers, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredCustomers.length / PAGE_SIZE)
    );

    const paginatedCustomers = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredCustomers.slice(start, start + PAGE_SIZE);
    }, [filteredCustomers, page]);

    // Si cambian los resultados, reseteamos a página 1
    useEffect(() => {
        setPage(1);
    }, [search]);

    // ---- HELPERS ----
    const getInitials = (customer: CustomerEntity) => {
        const { firstName, lastName } = customer.fullName;
        const first = firstName?.[0] ?? "";
        const last = lastName?.[0] ?? "";
        return (first + last || "C").toUpperCase();
    };

    const handleViewEligibility = (id: string) => {
        const e = eligibilityMap[id];

        if (!e) {
            return toast.error("No se pudo obtener la elegibilidad.");
        }

        const mv = e.mivivienda;
        const tp = e.techoPropio;

        toast.custom((t) => (
            <div className="p-4 bg-white rounded-lg shadow-xl border w-[380px]">
                <h3 className="font-semibold text-slate-800 mb-2">Elegibilidad</h3>

                {/* --- MI VIVIENDA --- */}
                <div className="mb-3">
                    <h4 className="font-medium text-emerald-700">Nuevo Crédito MiVivienda</h4>

                    {mv.eligible ? (
                        <p className="text-sm text-emerald-700 font-semibold">✔ Elegible</p>
                    ) : (
                        <p className="text-sm text-red-600 font-semibold">✘ No elegible</p>
                    )}

                    {/* Razones */}
                    {mv.reasons?.length > 0 && (
                        <ul className="text-xs text-slate-600 mt-1 list-disc ml-4">
                            {mv.reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    )}

                    {/* Fallas */}
                    {mv.failureReasons?.length > 0 && (
                        <ul className="text-xs text-red-600 mt-1 list-disc ml-4">
                            {mv.failureReasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    )}

                    {/* Bonos */}
                    {mv.availableBonos?.length > 0 && (
                        <div className="mt-2">
                            <p className="text-xs font-medium text-slate-700">Bonos:</p>
                            {mv.availableBonos.map((b, i) => (
                                <div key={i} className="text-xs mt-1 border p-2 rounded-lg">
                                    <p className="font-medium">{b.type}</p>
                                    {b.eligible ? (
                                        <p className="text-emerald-700">✔ S/ {b.amount}</p>
                                    ) : (
                                        <p className="text-red-600">✘ {b.failureReason}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- TECHO PROPIO --- */}
                <div>
                    <h4 className="font-medium text-blue-700">Techo Propio</h4>

                    {tp.eligible ? (
                        <p className="text-sm text-emerald-700 font-semibold">✔ Elegible</p>
                    ) : (
                        <p className="text-sm text-red-600 font-semibold">✘ No elegible</p>
                    )}

                    {tp.reasons?.length > 0 && (
                        <ul className="text-xs text-slate-600 mt-1 list-disc ml-4">
                            {tp.reasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    )}

                    {tp.failureReasons?.length > 0 && (
                        <ul className="text-xs text-red-600 mt-1 list-disc ml-4">
                            {tp.failureReasons.map((r, i) => (
                                <li key={i}>{r}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    onClick={() => toast.dismiss(t)}
                    className="mt-4 w-full px-3 py-1 rounded bg-slate-800 text-white text-xs"
                >
                    Cerrar
                </button>
            </div>
        ));
    };

    // ---- RENDER ----
    return (
        <SidebarLayout>
            <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona tus clientes y revisa su elegibilidad para los programas de vivienda.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/customers/new">+ Agregar cliente</Link>
                    </Button>
                </div>

                {/* FILTER BAR */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1 max-w-sm">
                        <Input
                            placeholder="Filtrar por DNI, nombre o correo"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Placeholder por si luego agregas filtros avanzados */}
                    {/* <Button variant="outline">Columns</Button> */}
                </div>

                {/* TABLE CARD */}
                <div className="flex-1 rounded-xl border bg-white shadow-sm overflow-hidden">
                    {/* TABLE */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/80">
                                    <TableHead className="w-10">
                                        {/* checkbox general si quieres agregar */}
                                    </TableHead>
                                    <TableHead className="w-[280px]">Correo</TableHead>
                                    <TableHead>Nombres</TableHead>
                                    <TableHead>Apellidos</TableHead>
                                    <TableHead className="w-[140px]">Teléfono</TableHead>
                                    <TableHead className="w-[120px]">Estado</TableHead>
                                    <TableHead className="w-[160px]">Elegible NCMV</TableHead>
                                    <TableHead className="w-10 text-right"></TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                                            Cargando clientes...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedCustomers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                                            No se encontraron clientes.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedCustomers.map((customer) => (
                                        <TableRow key={customer.id} className="hover:bg-slate-50/60">
                                            {/* Avatar / Checkbox */}
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    {/* Podrías añadir checkbox aquí */}
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarFallback>{getInitials(customer)}</AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </TableCell>

                                            {/* Correo */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">
                          {customer.contactInfo.email}
                        </span>
                                                </div>
                                            </TableCell>

                                            {/* Nombres */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                          {customer.fullName.firstName}
                                                        {customer.fullName.middleName
                                                            ? ` ${customer.fullName.middleName}`
                                                            : ""}
                        </span>
                                                </div>
                                            </TableCell>

                                            {/* Apellidos */}
                                            <TableCell className="text-sm">
                                                {customer.fullName.lastName}
                                            </TableCell>

                                            {/* Teléfono */}
                                            <TableCell className="text-sm">
                                                {customer.contactInfo.phoneNumber}
                                            </TableCell>

                                            {/* Estado */}
                                            <TableCell>
                                                <StatusBadge status={customer.status} />
                                            </TableCell>

                                            {/* NCMV */}
                                            <TableCell className="text-sm">
                                                {eligibilityMap[customer.id]?.mivivienda?.eligible ? (
                                                    <span className="text-emerald-700 font-semibold">✔ Sí</span>
                                                ) : (
                                                    <span className="text-red-600 font-semibold">✘ No</span>
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                        >
                                                            <EllipsisVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>

                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuItem
                                                            onClick={() => router.push(`/customers/${customer.id}`)}
                                                        >
                                                            Ver detalle
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem
                                                            onClick={() => handleViewEligibility(customer.id)}
                                                        >
                                                            Ver elegibilidad
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* PAGINATION */}
                    {!loading && filteredCustomers.length > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50/60">
                            <p className="text-xs text-muted-foreground">
                                Mostrando{" "}
                                <span className="font-medium">
                {paginatedCustomers.length}
              </span>{" "}
                                de{" "}
                                <span className="font-medium">
                {filteredCustomers.length}
              </span>{" "}
                                clientes
                            </p>

                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page === 1}
                                    onClick={() => setPage(1)}
                                >
                                    «
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page === 1}
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                >
                                    ‹
                                </Button>

                                {/* Simple pager: página actual / total */}
                                <span className="px-2 text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page === totalPages}
                                    onClick={() =>
                                        setPage((p) => Math.min(totalPages, p + 1))
                                    }
                                >
                                    ›
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(totalPages)}
                                >
                                    »
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}

// ---- SMALL STATUS BADGE COMPONENT ----

function StatusBadge({ status }: { status: CustomerStatusEnum }) {
    let className =
        "px-2 py-0.5 rounded-full text-[11px] font-medium border";
    let label: string;

    switch (status) {
        case "ACTIVE":
            className += " bg-emerald-50 text-emerald-700 border-emerald-200";
            label = "Activo";
            break;
        case "SUSPENDED":
            className += " bg-amber-50 text-amber-700 border-amber-200";
            label = "Suspendido";
            break;
        case "INACTIVE":
        default:
            className += " bg-slate-50 text-slate-600 border-slate-200";
            label = "Inactivo";
            break;
    }

    return <span className={className}>{label}</span>;
}
