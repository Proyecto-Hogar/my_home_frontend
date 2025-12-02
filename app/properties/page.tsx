"use client";

import React, {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {toast} from "sonner";
import {Bath, BedDouble, Car, Filter, Home, Leaf, MapPin,} from "lucide-react";

import SidebarLayout from "@/components/layout/SidebarLayout";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

import {FinishingQualityEnum, PropertyEntity, PropertyStatusEnum, PropertyTypeEnum,} from "@/types/property.types";
import {getPropertyService} from "@/services/property.service";
import Image from "next/image";

const PAGE_SIZE = 9;

// ---- TYPES ----
type MiViviendaFilter = "ALL" | "YES" | "NO";

interface PropertyFilters {
    minBedrooms?: number;
    maxPrice?: number;
    propertyType?: PropertyTypeEnum | "ALL";
    status?: PropertyStatusEnum | "ALL";
    miVivienda?: MiViviendaFilter;
}

// ---- HELPERS ----
const formatCurrency = (amount: number, currency: string) => {
    if (!amount) return "-";
    const formatter = new Intl.NumberFormat("es-PE", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    });
    return formatter.format(amount);
};

const translatePropertyType = (type: PropertyTypeEnum) => {
    const map: Record<PropertyTypeEnum, string> = {
        [PropertyTypeEnum.APARTMENT]: "Departamento",
        [PropertyTypeEnum.HOUSE]: "Casa",
        [PropertyTypeEnum.DUPLEX]: "Dúplex",
        [PropertyTypeEnum.TOWNHOUSE]: "Casa en condominio",
        [PropertyTypeEnum.PENTHOUSE]: "Penthouse",
        [PropertyTypeEnum.FLAT]: "Flat",
    };
    return map[type] ?? type;
};

const translateStatus = (status: PropertyStatusEnum) => {
    const map: Record<PropertyStatusEnum, string> = {
        [PropertyStatusEnum.AVAILABLE]: "Disponible",
        [PropertyStatusEnum.RESERVED]: "Reservada",
        [PropertyStatusEnum.SOLD]: "Vendida",
        [PropertyStatusEnum.SUSPENDED]: "Suspendida",
    };
    return map[status] ?? status;
};

const translateFinishing = (quality: FinishingQualityEnum) => {
    const map: Record<FinishingQualityEnum, string> = {
        [FinishingQualityEnum.BASIC]: "Básico",
        [FinishingQualityEnum.STANDARD]: "Estándar",
        [FinishingQualityEnum.PREMIUM]: "Premium",
        [FinishingQualityEnum.LUXURY]: "Lujo",
    };
    return map[quality] ?? quality;
};

const statusBadgeClass = (status: PropertyStatusEnum) => {
    const base = "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border";
    switch (status) {
        case PropertyStatusEnum.AVAILABLE:
            return (
                base +
                " bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900"
            );
        case PropertyStatusEnum.RESERVED:
            return (
                base +
                " bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900"
            );
        case PropertyStatusEnum.SOLD:
            return (
                base +
                " bg-slate-100 text-slate-600 border-slate-200 line-through dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800"
            );
        case PropertyStatusEnum.SUSPENDED:
        default:
            return (
                base +
                " bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900"
            );
    }
};

// =======================================================
// PAGE
// =======================================================

export default function PropertiesPage() {
    const propertyService = getPropertyService();

    const [properties, setProperties] = useState<PropertyEntity[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<PropertyFilters>({
        miVivienda: "ALL",
        propertyType: "ALL",
        status: "ALL",
    });

    // ---- LOAD DATA ----
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await propertyService.getAll();
                setProperties(data);
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "No se pudieron cargar las propiedades.";
                toast.error("Error al cargar propiedades", { description: message });
            } finally {
                setLoading(false);
            }
        };

        load().then();
    }, [propertyService]);

    // ---- FILTERS ----
    const filteredProperties = useMemo(() => {
        let result = properties;

        // Search
        if (search.trim()) {
            const query = search.toLowerCase();
            result = result.filter((p) => {
                const code = p.propertyCode.toLowerCase();
                const type = translatePropertyType(p.propertyType).toLowerCase();
                const finishing = translateFinishing(p.finishingQuality).toLowerCase();
                const price = String(p.pricing.priceAmount ?? "").toLowerCase();
                return (
                    code.includes(query) ||
                    type.includes(query) ||
                    finishing.includes(query) ||
                    price.includes(query)
                );
            });
        }

        // Min bedrooms
        if (filters.minBedrooms && filters.minBedrooms > 0) {
            result = result.filter((p) => p.bedrooms >= (filters.minBedrooms ?? 0));
        }

        // Max price
        if (filters.maxPrice && filters.maxPrice > 0) {
            result = result.filter(
                (p) => p.pricing.priceAmount <= (filters.maxPrice ?? Infinity)
            );
        }

        // Property type
        if (filters.propertyType && filters.propertyType !== "ALL") {
            result = result.filter(
                (p) => p.propertyType === filters.propertyType
            );
        }

        // Status
        if (filters.status && filters.status !== "ALL") {
            result = result.filter((p) => p.status === filters.status);
        }

        // MiVivienda
        if (filters.miVivienda && filters.miVivienda !== "ALL") {
            const target = filters.miVivienda === "YES";
            result = result.filter(
                (p) => p.financiability.isEligibleForMiVivienda === target
            );
        }

        return result;
    }, [properties, search, filters]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredProperties.length / PAGE_SIZE)
    );

    const paginatedProperties = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredProperties.slice(start, start + PAGE_SIZE);
    }, [filteredProperties, page]);

    // reset the page when filters/search change
    useEffect(() => {
        setPage(1);
    }, [search, filters]);

    const handleFilterChange = (patch: Partial<PropertyFilters>) => {
        setFilters((prev) => ({ ...prev, ...patch }));
    };

    // ====================================================
    // RENDER
    // ====================================================
    return (
        <SidebarLayout>
            <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                            <Home className="h-5 w-5 text-primary" />
                            Propiedades
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Gestiona el catálogo de propiedades disponibles para tus clientes.
                        </p>
                    </div>

                    <Button asChild>
                        <Link href="/properties/new">+ Agregar propiedad</Link>
                    </Button>
                </div>

                {/* FILTER BAR */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex-1 max-w-md">
                        <Input
                            placeholder="Filtrar propiedad por código, tipo o precio"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={showFilters ? "default" : "outline"}
                            size="sm"
                            type="button"
                            onClick={() => setShowFilters((v) => !v)}
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filtros avanzados
                        </Button>
                    </div>
                </div>

                {/* ADVANCED FILTERS */}
                {showFilters && (
                    <div className="mb-4 rounded-xl border bg-white/80 p-4 shadow-sm dark:bg-slate-950/60">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            {/* Tipo */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Tipo de propiedad
                                </label>
                                <select
                                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                                    value={filters.propertyType ?? "ALL"}
                                    onChange={(e) =>
                                        handleFilterChange({
                                            propertyType:
                                                (e.target.value as PropertyTypeEnum | "ALL") || "ALL",
                                        })
                                    }
                                >
                                    <option value="ALL">Todos</option>
                                    {Object.values(PropertyTypeEnum).map((t) => (
                                        <option key={t} value={t}>
                                            {translatePropertyType(t)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Min bedrooms */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Dormitorios mínimos
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={filters.minBedrooms ?? ""}
                                    onChange={(e) =>
                                        handleFilterChange({
                                            minBedrooms: e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        })
                                    }
                                />
                            </div>

                            {/* Max price */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Precio máximo
                                </label>
                                <Input
                                    type="number"
                                    min={0}
                                    placeholder="Ej. 450000"
                                    value={filters.maxPrice ?? ""}
                                    onChange={(e) =>
                                        handleFilterChange({
                                            maxPrice: e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        })
                                    }
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Se usa el monto principal ({'"'}priceAmount{'"'}) sin convertir.
                                </p>
                            </div>

                            {/* MiVivienda */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Elegible MiVivienda
                                </label>
                                <select
                                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                                    value={filters.miVivienda ?? "ALL"}
                                    onChange={(e) =>
                                        handleFilterChange({
                                            miVivienda: e.target.value as MiViviendaFilter,
                                        })
                                    }
                                >
                                    <option value="ALL">Todos</option>
                                    <option value="YES">Solo elegibles</option>
                                    <option value="NO">No elegibles</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Estado
                                </label>
                                <select
                                    className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                                    value={filters.status ?? "ALL"}
                                    onChange={(e) =>
                                        handleFilterChange({
                                            status:
                                                (e.target.value as PropertyStatusEnum | "ALL") ||
                                                "ALL",
                                        })
                                    }
                                >
                                    <option value="ALL">Todos</option>
                                    {Object.values(PropertyStatusEnum).map((st) => (
                                        <option key={st} value={st}>
                                            {translateStatus(st)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-3 flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                type="button"
                                onClick={() =>
                                    setFilters({
                                        miVivienda: "ALL",
                                        propertyType: "ALL",
                                        status: "ALL",
                                    })
                                }
                            >
                                Limpiar filtros
                            </Button>
                        </div>
                    </div>
                )}

                {/* GRID CARD WRAPPER */}
                <div className="flex-1 rounded-xl border bg-white shadow-sm p-4 dark:bg-slate-950/60">
                    {loading ? (
                        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                            Cargando propiedades...
                        </div>
                    ) : paginatedProperties.length === 0 ? (
                        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
                            No se encontraron propiedades con los filtros aplicados.
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                            {paginatedProperties.map((property) => (
                                <Link
                                    key={property.id}
                                    href={`/properties/${property.id}`}
                                    className="group"
                                >
                                    <div className="flex h-full flex-col rounded-xl border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md hover:-translate-y-[1px]">
                                        <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900 overflow-hidden">
                                            {property.primaryImageFileId ? (
                                                <Image
                                                    src={property.primaryImageFileId}
                                                    alt={`Propiedad ${property.propertyCode}`}
                                                    fill
                                                    className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-muted-foreground gap-1">
                                                    <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                                                    <span>Sin imagen</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* CONTENT */}
                                        <div className="flex flex-col gap-2 px-4 py-3">
                                            {/* Top meta: area + rooms + baths */}
                                            <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-2">
                        <span className="flex items-center gap-1">
                          <Home className="h-3 w-3" />
                            {property.pricing.totalArea} m²
                        </span>
                                                <span className="flex items-center gap-1">
                          <BedDouble className="h-3 w-3" />
                                                    {property.bedrooms} dorm.
                        </span>
                                                <span className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                                                    {property.bathrooms} baños
                        </span>
                                                {property.parking.parkingSpaces > 0 && (
                                                    <span className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                                                        {property.parking.parkingSpaces}
                          </span>
                                                )}
                                            </div>

                                            {/* PRICE & STATUS */}
                                            <div className="flex items-baseline justify-between gap-3">
                                                <div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Desde
                                                    </div>
                                                    <div className="text-lg font-semibold tracking-tight">
                                                        {formatCurrency(
                                                            property.pricing.priceAmount,
                                                            property.pricing.priceCurrency
                                                        )}
                                                    </div>
                                                </div>

                                                <span className={statusBadgeClass(property.status)}>
                          {translateStatus(property.status)}
                        </span>
                                            </div>

                                            {/* Secondary line */}
                                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                                                <MapPin className="h-3 w-3" />
                                                {/* No hay dirección en la entidad, así que solo mostramos código + tipo */}
                                                <span className="truncate">
                          Cód. {property.propertyCode} ·{" "}
                                                    {translatePropertyType(property.propertyType)} ·{" "}
                                                    {translateFinishing(property.finishingQuality)}
                        </span>
                                            </div>

                                            {/* Bottom tags */}
                                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                                {/* BADGE: MI VIVIENDA */}
                                                {property.financiability.isEligibleForMiVivienda && (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
        MiVivienda
    </span>
                                                )}

                                                {/* BADGE: BFH */}
                                                {property.financiability.isEligibleForBFH && (
                                                    <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 border border-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900">
        BFH
    </span>
                                                )}

                                                {/* BADGE: ECO CERTIFICATION (EDGE, LEED, BREEAM, CASA) */}
                                                {property.sustainability.certificationType && (
                                                    <span
                                                        className={
                                                            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border gap-1 " +
                                                            (
                                                                property.sustainability.certificationType === "EDGE"
                                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                                                                    : property.sustainability.certificationType === "LEED"
                                                                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900"
                                                                        : property.sustainability.certificationType === "BREEAM"
                                                                            ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900"
                                                                            : property.sustainability.certificationType === "CASA"
                                                                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900"
                                                                                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                                                            )
                                                        }
                                                    >
        <Leaf className="h-3 w-3" />
                                                        {property.sustainability.certificationType}
    </span>
                                                )}

                                                {/* BADGE: BONO SOSTENIBLE */}
                                                {property.sustainability.bonusEligible && (
                                                    <span className="inline-flex items-center rounded-full bg-lime-50 px-2 py-0.5 text-[11px] font-medium text-lime-700 border border-lime-200 dark:bg-lime-950/40 dark:text-lime-300 dark:border-lime-900 gap-1">
        🌱 Bono Sostenible
    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* PAGINATION */}
                    {!loading && filteredProperties.length > 0 && (
                        <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                            <p>
                                Mostrando{" "}
                                <span className="font-medium">
                  {paginatedProperties.length}
                </span>{" "}
                                de{" "}
                                <span className="font-medium">
                  {filteredProperties.length}
                </span>{" "}
                                propiedades
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

                                <span className="px-2">
                  Página {page} de {totalPages}
                </span>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
