"use client";

import React, { useMemo, useRef, useState, ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Home, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

import SidebarLayout from "@/components/layout/SidebarLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    CreatePropertyRequest,
    PropertyTypeEnum,
    OrientationEnum,
    FinishingQualityEnum,
} from "@/types/property.types";

import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import { getPropertyService } from "@/services/property.service";

const defaultForm: CreatePropertyRequest = {
    projectId: null,
    propertyCode: "",
    parkingSpaces: 0,
    parkingPriceAmount: 0,
    parkingCurrency: "PEN",
    constructionYear: new Date().getFullYear(),
    finishingQuality: FinishingQualityEnum.STANDARD,
    hasBalcony: false,
    hasLaundryArea: true,
    facing: null,
    features: [],
    propertyType: PropertyTypeEnum.APARTMENT,
    bedrooms: 2,
    bathrooms: 1,
    halfBathrooms: 0,
    floor: 1,
    storageRoom: false,
    priceAmount: 0,
    priceCurrency: "PEN",
    builtArea: 0,
    totalArea: 0,
    maintenanceFeeAmount: 0,
    isEligibleForMiVivienda: false,
    hasSustainabilityCertification: false,
    certificationType: null,
};

type Step = 1 | 2;

export default function NewPropertyPage() {
    const router = useRouter();
    const propertyService = getPropertyService();
    const [step, setStep] = useState<Step>(1);
    const [form, setForm] = useState<CreatePropertyRequest>(defaultForm);
    const [featuresInput, setFeaturesInput] = useState("");
    const [saving, setSaving] = useState(false);

    // ---- IMAGEN PRINCIPAL ----
    const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
    const [primaryImagePreview, setPrimaryImagePreview] = useState<string | null>(
        null
    );
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // ENUM OPTIONS
    const finishingOptions = useMemo(
        () => [
            { value: FinishingQualityEnum.BASIC, label: "Básico" },
            { value: FinishingQualityEnum.STANDARD, label: "Estándar" },
            { value: FinishingQualityEnum.PREMIUM, label: "Premium" },
            { value: FinishingQualityEnum.LUXURY, label: "Lujo" },
        ],
        []
    );

    const propertyTypeOptions = useMemo(
        () => [
            { value: PropertyTypeEnum.APARTMENT, label: "Departamento" },
            { value: PropertyTypeEnum.HOUSE, label: "Casa" },
            { value: PropertyTypeEnum.DUPLEX, label: "Dúplex" },
            { value: PropertyTypeEnum.TOWNHOUSE, label: "Casa en condominio" },
            { value: PropertyTypeEnum.PENTHOUSE, label: "Penthouse" },
            { value: PropertyTypeEnum.FLAT, label: "Flat" },
        ],
        []
    );

    const orientationOptions = [
        { value: "none", label: "Sin orientación" },
        { value: OrientationEnum.NORTH, label: "Norte" },
        { value: OrientationEnum.SOUTH, label: "Sur" },
        { value: OrientationEnum.EAST, label: "Este" },
        { value: OrientationEnum.WEST, label: "Oeste" },
        { value: OrientationEnum.NORTHEAST, label: "Nor-Este" },
        { value: OrientationEnum.NORTHWEST, label: "Nor-Oeste" },
        { value: OrientationEnum.SOUTHEAST, label: "Sur-Este" },
        { value: OrientationEnum.SOUTHWEST, label: "Sur-Oeste" },
    ];

    function updateField<K extends keyof CreatePropertyRequest>(
        key: K,
        value: CreatePropertyRequest[K]
    ) {
        setForm((prev) => ({ ...prev, [key]: value }));
    }

    /** FILE UPLOADER */
    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validación simple de tamaño (2MB)
        const maxSizeMb = 2;
        if (file.size > maxSizeMb * 1024 * 1024) {
            toast.error(`La imagen debe pesar menos de ${maxSizeMb} MB.`);
            return;
        }

        setPrimaryImageFile(file);
        const url = URL.createObjectURL(file);
        setPrimaryImagePreview(url);
    };

    /** VALIDACIÓN PARA PASAR AL STEP 2 */
    const canGoNextStep1 = useMemo(() => {
        return (
            form.propertyCode.trim().length > 0 &&
            form.builtArea > 0 &&
            form.totalArea > 0 &&
            form.bedrooms > 0 &&
            form.bathrooms > 0
        );
    }, [form]);

    /** SUBMIT FINAL */
    const handleSubmit = async () => {
        try {
            setSaving(true);

            const payload: CreatePropertyRequest = {
                ...form,
                features: featuresInput
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
            };

            const created = await propertyService.create(payload);

            if (primaryImageFile) {
                try {
                    await propertyService.uploadPrimaryImage(created.id, primaryImageFile);
                } catch (err) {
                    const msg =
                        err instanceof Error ? err.message : "Error al subir la imagen.";
                    toast.error(
                        "La propiedad se creó, pero hubo un problema subiendo la imagen.",
                        { description: msg }
                    );
                }
            }

            toast.success("Propiedad registrada correctamente.");
            router.push("/properties");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Error al guardar propiedad";
            toast.error("Error al guardar propiedad", { description: message });
        } finally {
            setSaving(false);
        }
    };

    /** HEADER STEPPER */
    const StepHeader = () => (
        <div className="mb-8">
            <div className="flex items-center justify-center gap-16">
                {/* STEP 1 */}
                <button
                    type="button"
                    onClick={() => setStep(1)}
                    className={`flex flex-col items-center gap-2 ${
                        step === 1 ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white ${
                            step === 1
                                ? "border-primary text-primary"
                                : "border-slate-200 text-slate-400"
                        }`}
                    >
                        <Home className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium">Descripción del inmueble</span>
                </button>

                <div className="hidden md:block h-px w-40 bg-slate-200" />

                {/* STEP 2 */}
                <button
                    type="button"
                    onClick={() => canGoNextStep1 && setStep(2)}
                    className={`flex flex-col items-center gap-2 ${
                        step === 2 ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                    <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full border bg-white ${
                            step === 2
                                ? "border-primary text-primary"
                                : "border-slate-200 text-slate-400"
                        }`}
                    >
                        <Home className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium">
            Valorización y atributos financieros
          </span>
                </button>
            </div>
        </div>
    );

    return (
        <SidebarLayout>
            <div className="flex flex-col h-full">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Propiedades / Nueva propiedad
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Registra una nueva unidad en el catálogo.
                        </p>
                    </div>

                    <Button variant="outline" asChild>
                        <Link href="/properties">Volver</Link>
                    </Button>
                </div>

                {/* CARD */}
                <div className="flex-1 rounded-xl border bg-white shadow-sm px-8 py-6">
                    <StepHeader />

                    {/* ---------------- STEP 1 ---------------- */}
                    {step === 1 && (
                        <div className="space-y-8">
                            {/* IDENTIFICACIÓN */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Identificación
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Proyecto (opcional)
                                        </label>
                                        <Input
                                            placeholder="ID proyecto"
                                            value={form.projectId ?? ""}
                                            onChange={(e) =>
                                                updateField(
                                                    "projectId",
                                                    e.target.value.trim() === ""
                                                        ? null
                                                        : e.target.value.trim()
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs">Código *</label>
                                        <Input
                                            placeholder="Ej. DEP-101"
                                            value={form.propertyCode}
                                            onChange={(e) =>
                                                updateField("propertyCode", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs">Tipo de inmueble *</label>

                                        <Select
                                            value={form.propertyType}
                                            onValueChange={(v) =>
                                                updateField("propertyType", v as PropertyTypeEnum)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {propertyTypeOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </section>

                            {/* CARACTERÍSTICAS */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Características
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <InputLabeled
                                        label="Área construida (m²) *"
                                        value={form.builtArea}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("builtArea", Number(e.target.value))
                                        }
                                    />

                                    <InputLabeled
                                        label="Área total (m²) *"
                                        value={form.totalArea}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("totalArea", Number(e.target.value))
                                        }
                                    />

                                    <InputLabeled
                                        label="Dormitorios *"
                                        value={form.bedrooms}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("bedrooms", Number(e.target.value))
                                        }
                                    />

                                    <InputLabeled
                                        label="Baños completos *"
                                        value={form.bathrooms}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("bathrooms", Number(e.target.value))
                                        }
                                    />

                                    <InputLabeled
                                        label="Medios baños"
                                        value={form.halfBathrooms ?? ""}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("halfBathrooms", Number(e.target.value))
                                        }
                                    />

                                    <InputLabeled
                                        label="Piso"
                                        value={form.floor ?? ""}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("floor", Number(e.target.value))
                                        }
                                    />

                                    <InputLabeled
                                        label="Año construcción"
                                        value={form.constructionYear}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("constructionYear", Number(e.target.value))
                                        }
                                    />

                                    <div className="space-y-1.5">
                                        <label className="text-xs">Calidad de acabados *</label>
                                        <Select
                                            value={form.finishingQuality}
                                            onValueChange={(v) =>
                                                updateField(
                                                    "finishingQuality",
                                                    v as FinishingQualityEnum
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {finishingOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* FACING */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs">Orientación</label>
                                        <Select
                                            value={form.facing ?? ""}
                                            onValueChange={(val) =>
                                                updateField(
                                                    "facing",
                                                    val === "none" ? null : (val as OrientationEnum)
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sin orientación" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {orientationOptions.map((opt) => (
                                                    <SelectItem key={opt.label} value={opt.value}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* BALCÓN */}
                                    <BooleanSelect
                                        label="¿Tiene balcón?"
                                        value={form.hasBalcony}
                                        onChange={(v) => updateField("hasBalcony", v)}
                                    />

                                    {/* LAVANDERIA */}
                                    <BooleanSelect
                                        label="¿Área de lavandería?"
                                        value={form.hasLaundryArea}
                                        onChange={(v) => updateField("hasLaundryArea", v)}
                                    />

                                    {/* DEPOSITO */}
                                    <BooleanSelect
                                        label="¿Tiene depósito?"
                                        value={form.storageRoom}
                                        onChange={(v) => updateField("storageRoom", v)}
                                    />
                                </div>

                                {/* FEATURES */}
                                <InputLabeled
                                    label="Características adicionales"
                                    placeholder="Cocina abierta, vista al parque, walking closet..."
                                    value={featuresInput}
                                    onChange={(e) => setFeaturesInput(e.target.value)}
                                />
                            </section>

                            {/* FOOTER */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <Button variant="outline" asChild>
                                    <Link href="/properties">Cancelar</Link>
                                </Button>

                                <Button onClick={() => setStep(2)} disabled={!canGoNextStep1}>
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* ---------------- STEP 2 ---------------- */}
                    {step === 2 && (
                        <div className="space-y-8">
                            {/* VALORIZACION */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Valorización
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputLabeled
                                        label="Precio del inmueble (S/)"
                                        value={form.priceAmount}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("priceAmount", Number(e.target.value))
                                        }
                                    />

                                    <div className="space-y-1.5">
                                        <label className="text-xs">Moneda</label>
                                        <Select
                                            value={form.priceCurrency}
                                            onValueChange={(v) =>
                                                updateField("priceCurrency", v as "PEN" | "USD")
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                                <SelectItem value="USD">Dólares (USD)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <InputLabeled
                                        label="Mantenimiento mensual"
                                        value={form.maintenanceFeeAmount}
                                        type="number"
                                        onChange={(e) =>
                                            updateField(
                                                "maintenanceFeeAmount",
                                                Number(e.target.value)
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <InputLabeled
                                        label="N° de estacionamientos"
                                        value={form.parkingSpaces}
                                        type="number"
                                        onChange={(e) =>
                                            updateField("parkingSpaces", Number(e.target.value))
                                        }
                                    />

                                    <InputLabeled
                                        label="Precio estacionamiento"
                                        value={form.parkingPriceAmount}
                                        type="number"
                                        onChange={(e) =>
                                            updateField(
                                                "parkingPriceAmount",
                                                Number(e.target.value)
                                            )
                                        }
                                    />

                                    <div className="space-y-1.5">
                                        <label className="text-xs">Moneda</label>
                                        <Select
                                            value={form.parkingCurrency}
                                            onValueChange={(v) =>
                                                updateField("parkingCurrency", v as "PEN" | "USD")
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="PEN">Soles (PEN)</SelectItem>
                                                <SelectItem value="USD">Dólares (USD)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </section>

                            {/* FINANCIAMIENTO */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Atributos para financiamiento
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <BooleanSelect
                                        label="¿Ecoamigable (certificación)?"
                                        value={form.hasSustainabilityCertification}
                                        onChange={(v) =>
                                            updateField("hasSustainabilityCertification", v)
                                        }
                                    />
                                </div>

                                {form.hasSustainabilityCertification && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs">Tipo certificación</label>
                                            <Select
                                                value={form.certificationType ?? ""}
                                                onValueChange={(v) =>
                                                    updateField(
                                                        "certificationType",
                                                        v === "" ? null : v
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="EDGE">EDGE</SelectItem>
                                                    <SelectItem value="LEED">LEED</SelectItem>
                                                    <SelectItem value="BREEAM">BREEAM</SelectItem>
                                                    <SelectItem value="CASA">CASA</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Uploader Imagen */}
                            <section className="space-y-4">
                                <h2 className="text-sm font-semibold text-slate-800">
                                    Imagen principal
                                </h2>

                                <div
                                    className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center cursor-pointer hover:bg-slate-100 overflow-hidden"
                                    onClick={handleFileClick}
                                >
                                    {primaryImagePreview ? (
                                        <>
                                            <Image
                                                src={primaryImagePreview}
                                                alt="Vista previa de la imagen principal"
                                                fill
                                                className="object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/20" />
                                            <div className="relative z-10 flex flex-col items-center">
                                                <p className="text-xs text-white mb-1">
                                                    Haz click para cambiar la imagen
                                                </p>
                                                {primaryImageFile && (
                                                    <p className="text-[11px] text-slate-100">
                                                        {primaryImageFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <ImageIcon className="h-8 w-8 text-slate-400 mb-2" />
                                            <p className="text-sm font-medium text-slate-700">
                                                Subir imagen principal
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                SVG, PNG, JPG, GIF (máx. 2MB)
                                            </p>
                                        </>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileSelected}
                                    />
                                </div>
                            </section>

                            {/* FOOTER */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <Button variant="outline" onClick={() => setStep(1)}>
                                    Volver
                                </Button>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => router.push("/properties")}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button onClick={handleSubmit} disabled={saving}>
                                        {saving ? "Guardando..." : "Guardar propiedad"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </SidebarLayout>
    );
}

/* COMPONENTES AUXILIARES */

function InputLabeled({
                          label,
                          ...props
                      }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
                {label}
            </label>
            <Input {...props} />
        </div>
    );
}

function BooleanSelect({
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
            <label className="text-xs font-medium text-muted-foreground">
                {label}
            </label>

            <Select
                value={value ? "true" : "false"}
                onValueChange={(v) => onChange(v === "true")}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="false">No</SelectItem>
                    <SelectItem value="true">Sí</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}