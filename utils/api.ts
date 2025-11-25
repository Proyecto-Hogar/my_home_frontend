export const getApiBaseUrl = () => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) {
        console.warn("NEXT_PUBLIC_API_BASE_URL no definida en .env.local");
    }
    return base ?? "";
};
