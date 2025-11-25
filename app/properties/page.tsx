"use client";

import RequireAuth from "@/components/auth/RequireAuth";

export default function PropertiesPage() {
    return (
        <RequireAuth>
            <div className="p-10">
                <h1 className="text-3xl font-bold">Listado de Propiedades</h1>
                <p className="mt-4 text-gray-600">Aquí cargarás las propiedades.</p>
            </div>
        </RequireAuth>
    );
}
