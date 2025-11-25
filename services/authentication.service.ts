import {BaseService} from "./base.service";

import type {
    AuthenticatedUserResponse,
    ResetCompletedPasswordResponse,
    ResetPasswordRequest,
    SetCompletedInitialPasswordResponse,
    SetInitialPasswordRequest,
    SignInRequest,
    SignUpRequest,
} from "@/types/authentication.types";

import type {UserEntity, UserResponse} from "@/types/user.types";

import {
    mapAuthenticatedUserFromResponse,
    mapResetCompletedPasswordFromResponse,
    mapSetCompletedInitialPasswordFromResponse,
} from "@/mappers/authentication.mapper";

import {mapUserFromResponse} from "@/mappers/user.mapper";
import {StorageService} from "@/utils/storage";

export class AuthenticationService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "authentication";
    }

    async signUp(data: SignUpRequest): Promise<UserEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/sign-up`);

        const res = await this.request<UserResponse>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });

        return mapUserFromResponse(res);
    }

    async signIn(data: SignInRequest): Promise<UserEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/sign-in`);

        const res = await this.request<AuthenticatedUserResponse>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });

        if (res.token) StorageService.setToken(res.token);

        return mapAuthenticatedUserFromResponse(res);
    }

    async setInitialPassword(
        data: SetInitialPasswordRequest
    ): Promise<SetCompletedInitialPasswordResponse> {
        const url = this.buildUrl(`${this.resourceEndpoint}/set-initial-password`);

        const res = await this.request<SetCompletedInitialPasswordResponse>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });

        return mapSetCompletedInitialPasswordFromResponse(res);
    }

    async forgotPassword(email: string): Promise<boolean> {
        const url = this.buildUrl(`${this.resourceEndpoint}/forgot-password`, {
            email,
        });

        await this.request(url, { method: "POST" });
        return true;
    }

    async resetPassword(
        data: ResetPasswordRequest
    ): Promise<ResetCompletedPasswordResponse> {
        const url = this.buildUrl(`${this.resourceEndpoint}/reset-password`);

        const res = await this.request<ResetCompletedPasswordResponse>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });

        return mapResetCompletedPasswordFromResponse(res);
    }

    async resendActivationToken(userId: string): Promise<boolean> {
        const url = this.buildUrl(`${this.resourceEndpoint}/resend-activation-token`, {
            userId,
        });

        await this.request(url, { method: "POST" });
        return true;
    }

    async getCurrentUser(): Promise<UserEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/me`);

        const res = await this.request<UserResponse>(url, { method: "GET" });

        return mapUserFromResponse(res);
    }
}

// Singleton pattern
let instance: AuthenticationService | null = null;

export const getAuthenticationService = (): AuthenticationService => {
    if (!instance) instance = new AuthenticationService();
    return instance;
};
