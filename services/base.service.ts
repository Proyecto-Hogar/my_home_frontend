export abstract class BaseService {
    protected basePath: string;
    protected resourceEndpoint = "/resources";

    protected constructor() {
        this.basePath = "https://my-home-production.up.railway.app/api/v1";
        if (!this.basePath) {
            console.warn("[BaseService] NEXT_PUBLIC_API_BASE_URL no está definida en .env.local");
        }
    }

    protected resourcePath(): string {
        return `${this.basePath}${this.resourceEndpoint}`;
    }

    protected buildUrl(path: string, query?: Record<string, unknown>): string {
        const cleanBase = this.basePath.replace(/\/+$/, "");
        const cleanPath = path.replace(/^\/+/, "");

        const url = new URL(`${cleanBase}/${cleanPath}`);

        if (query) {
            Object.entries(query).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    url.searchParams.append(key, String(value));
                }
            });
        }

        return url.toString();
    }

    protected async request<T>(url: string, options: RequestInit = {}): Promise<T> {
        const res = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });

        const text = await res.text();
        const data: unknown = text ? JSON.parse(text) : null;

        if (!res.ok) {
            const message =
                typeof data === "object" && data !== null && "message" in data
                    ? String((data as { message?: unknown }).message)
                    : `Error en la solicitud (${res.status})`;

            throw new Error(message);
        }

        return data as T;
    }
}
