"use client";

import React, {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {toast} from "sonner";
import {ArrowLeft, Bath, BedDouble, Car, Home, Info, Leaf, Ruler,} from "lucide-react";

import SidebarLayout from "@/components/layout/SidebarLayout";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

import {FinishingQualityEnum, PropertyEntity, PropertyStatusEnum, PropertyTypeEnum,} from "@/types/property.types";
import {getPropertyService} from "@/services/property.service";

/* ---------------------------------- HELPERS ---------------------------------- */

function translateType(type: PropertyTypeEnum) {
    const map: Record<PropertyTypeEnum, string> = {
        APARTMENT: "Departamento",
        HOUSE: "Casa",
        DUPLEX: "Dúplex",
        TOWNHOUSE: "Casa en condominio",
        PENTHOUSE: "Penthouse",
        FLAT: "Flat",
    };
    return map[type] ?? type;
}

function translateFinishing(q: FinishingQualityEnum) {
    const map: Record<FinishingQualityEnum, string> = {
        BASIC: "Básico",
        STANDARD: "Estándar",
        PREMIUM: "Premium",
        LUXURY: "Lujo",
    };
    return map[q] ?? q;
}

function translateStatus(status: PropertyStatusEnum) {
    const map: Record<PropertyStatusEnum, string> = {
        AVAILABLE: "Disponible",
        RESERVED: "Reservada",
        SOLD: "Vendida",
        SUSPENDED: "Suspendida",
    };
    return map[status] ?? status;
}

function statusBadgeClass(status: PropertyStatusEnum) {
    const base =
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border";
    switch (status) {
        case PropertyStatusEnum.AVAILABLE:
            return base + " bg-emerald-50 text-emerald-700 border-emerald-200";
        case PropertyStatusEnum.RESERVED:
            return base + " bg-amber-50 text-amber-700 border-amber-200";
        case PropertyStatusEnum.SOLD:
            return base + " bg-slate-100 text-slate-600 border-slate-200 line-through";
        case PropertyStatusEnum.SUSPENDED:
        default:
            return base + " bg-rose-50 text-rose-700 border-rose-200";
    }
}

function formatCurrency(amount: number, currency: string) {
    const symbol = currency === "USD" ? "$" : "S/";
    return `${symbol} ${amount.toLocaleString("es-PE")}`;
}

/* ----------------------------- READONLY COMPONENT ----------------------------- */

function ReadOnlyField({
                           label,
                           value,
                           icon,
                       }: {
    label: string;
    value: string | number | null;
    icon?: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-medium text-slate-600">{label}</p>
            <div className="flex items-center gap-1.5 rounded-md border bg-slate-50 px-2 py-1.5 text-xs">
                {icon}
                <span className="truncate">{value ?? "—"}</span>
            </div>
        </div>
    );
}

/* ------------------------------------ PAGE ----------------------------------- */

export default function PropertyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const propertyService = getPropertyService();

    const [property, setProperty] = useState<PropertyEntity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) {
            router.push("/properties");
            return;
        }

        const load = async () => {
            try {
                setLoading(true);
                const data = await propertyService.getById(id);
                setProperty(data);
            } catch {
                toast.error("Error al cargar propiedad");
                router.push("/properties");
            } finally {
                setLoading(false);
            }
        };

        load().then();
    }, [id, propertyService, router]);

    if (!property || loading) {
        return (
            <SidebarLayout>
                <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Cargando propiedad...
                </div>
            </SidebarLayout>
        );
    }

    /* ------------------------------ IMAGE HANDLING ------------------------------ */

    const imageUrl =
        property.primaryImageFileId && property.primaryImageFileId.trim().length > 0
            ? property.primaryImageFileId
            : "/images/placeholder-property.png";

    return (
        <SidebarLayout>
            <div className="flex flex-col h-full">
                {/* -------------------------------- HEADER -------------------------------- */}
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/properties")}
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>

                        <div>
                            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                                Propiedad {property.propertyCode}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                {translateType(property.propertyType)} ·{" "}
                                {translateFinishing(property.finishingQuality)}
                            </p>
                        </div>

                        <span className={statusBadgeClass(property.status)}>
                            {translateStatus(property.status)}
                        </span>
                    </div>

                    <Button onClick={() => router.push(`/properties/${property.id}/edit`)}>
                        Editar propiedad
                    </Button>
                </div>

                {/* ------------------------------ IMAGE HERO ------------------------------ */}
                <div className="relative mb-6">
                    <div className="aspect-[4/2] w-full overflow-hidden rounded-xl border bg-slate-100">
                        <img
                            src={imageUrl}
                            alt="Imagen de la propiedad"
                            className="object-cover w-full h-full opacity-85"
                        />
                    </div>
                </div>

                {/* -------------------------------- CONTENT -------------------------------- */}
                <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
                    {/* LEFT SIDE */}
                    <div className="space-y-6">
                        {/* DATOS GENERALES */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">
                                    Información general
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4 text-xs">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <ReadOnlyField
                                        label="Tipo"
                                        value={translateType(property.propertyType)}
                                        icon={<Home className="h-3 w-3" />}
                                    />
                                    <ReadOnlyField
                                        label="Año de construcción"
                                        value={property.constructionYear}
                                        icon={<Info className="h-3 w-3" />}
                                    />
                                    <ReadOnlyField
                                        label="Acabado"
                                        value={translateFinishing(property.finishingQuality)}
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <ReadOnlyField
                                        label="Dormitorios"
                                        value={property.bedrooms}
                                        icon={<BedDouble className="h-3 w-3" />}
                                    />
                                    <ReadOnlyField
                                        label="Baños"
                                        value={property.bathrooms}
                                        icon={<Bath className="h-3 w-3" />}
                                    />
                                    <ReadOnlyField
                                        label="Medios baños"
                                        value={property.halfBathrooms}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <ReadOnlyField
                                        label="Piso"
                                        value={property.floor}
                                    />
                                    <ReadOnlyField
                                        label="Orientación"
                                        value={property.facing ?? "Sin orientación"}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* ÁREAS Y PRECIO */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">
                                    Áreas y precios
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <ReadOnlyField
                                        label="Área construida (m²)"
                                        value={property.pricing.builtArea}
                                        icon={<Ruler className="h-3 w-3" />}
                                    />
                                    <ReadOnlyField
                                        label="Área total (m²)"
                                        value={property.pricing.totalArea}
                                    />
                                    <ReadOnlyField
                                        label="Precio"
                                        value={formatCurrency(
                                            property.pricing.priceAmount,
                                            property.pricing.priceCurrency
                                        )}
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-4">
                                    <ReadOnlyField
                                        label="Mantenimiento"
                                        value={formatCurrency(
                                            property.pricing.maintenanceFeeAmount,
                                            property.pricing.maintenanceFeeCurrency
                                        )}
                                    />
                                    <ReadOnlyField
                                        label="Precio m²"
                                        value={formatCurrency(
                                            property.pricing.pricePerSquareMeterAmount,
                                            property.pricing.pricePerSquareMeterCurrency
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* PARKING */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">
                                    Estacionamiento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-xs">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <ReadOnlyField
                                        label="Espacios"
                                        value={property.parking.parkingSpaces}
                                        icon={<Car className="h-3 w-3" />}
                                    />
                                    <ReadOnlyField
                                        label="Precio"
                                        value={formatCurrency(
                                            property.parking.parkingPriceAmount,
                                            property.parking.parkingPriceCurrency
                                        )}
                                    />
                                    <ReadOnlyField
                                        label="Total"
                                        value={formatCurrency(
                                            property.parking.parkingTotalAmount,
                                            property.parking.parkingTotalCurrency
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* FEATURES */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">
                                    Características
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    {property.features.length > 0 ? (
                                        property.features.map((f) => (
                                            <span
                                                key={f}
                                                className="px-2 py-1 rounded-md border bg-slate-50"
                                            >
                                                {f}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-muted-foreground text-xs">
                                            No hay características registradas.
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6">
                        {/* FINANCIABILIDAD */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">
                                    Financiabilidad
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4 text-xs">
                                <ReadOnlyField
                                    label="Monto máximo financiable"
                                    value={formatCurrency(
                                        property.financiability.maxFinanceableAmount,
                                        property.financiability.maxFinanceableCurrency
                                    )}
                                />

                                <div className="flex flex-col gap-1">
                                    <p className="text-[11px] font-medium">Elegibilidad</p>

                                    <div className="flex gap-2 flex-wrap">
                                        {property.financiability.isEligibleForMiVivienda && (
                                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px]">
                                                MiVivienda
                                            </span>
                                        )}

                                        {property.financiability.isEligibleForBFH && (
                                            <span className="px-2 py-0.5 rounded-md bg-sky-50 border border-sky-200 text-sky-700 text-[11px]">
                                                BFH
                                            </span>
                                        )}
                                    </div>

                                    {property.financiability.miViviendaReason && (
                                        <p className="text-[11px] text-muted-foreground mt-1">
                                            {property.financiability.miViviendaReason}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* SUSTAINABILIDAD */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold">
                                    Sostenibilidad
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4 text-xs">
                                <div className="flex items-center gap-2">
                                    {property.sustainability.hasCertification ? (
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] flex items-center gap-1">
                                            <Leaf className="h-3 w-3" />
                                            Certificada
                                        </span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-600 text-[11px]">
                                            No certificada
                                        </span>
                                    )}
                                </div>

                                <ReadOnlyField
                                    label="Tipo de certificación"
                                    value={property.sustainability.certificationType}
                                />

                                <ReadOnlyField
                                    label="Elegible a bono verde"
                                    value={property.sustainability.bonusEligible ? "Sí" : "No"}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </SidebarLayout>
    );
}
