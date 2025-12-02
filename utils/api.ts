export const getApiBaseUrl = () => {
    const base = "https://my-home-production.up.railway.app/api/v1";
    if (!base) {
        console.warn("NEXT_PUBLIC_API_BASE_URL no definida en .env.local");
    }
    return base ?? "";
};
