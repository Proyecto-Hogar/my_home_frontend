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

export class AuthenticationService extends BaseService {
    constructor() {
        super();
        this.resourceEndpoint = "/authentication";
    }

    async signUp(data: SignUpRequest): Promise<UserEntity> {
        const res = await this.request<UserResponse>(
            `${this.resourcePath()}/sign-up`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

        return mapUserFromResponse(res);
    }

    async signIn(data: SignInRequest): Promise<UserEntity> {
        const res = await this.request<AuthenticatedUserResponse>(
            `${this.resourcePath()}/sign-in`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

        return mapAuthenticatedUserFromResponse(res);
    }

    async setInitialPassword(
        data: SetInitialPasswordRequest
    ): Promise<SetCompletedInitialPasswordResponse> {
        const res = await this.request<SetCompletedInitialPasswordResponse>(
            `${this.resourcePath()}/set-initial-password`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

        return mapSetCompletedInitialPasswordFromResponse(res);
    }

    async forgotPassword(email: string): Promise<boolean> {
        await this.request(`${this.resourcePath()}/forgot-password?email=${email}`, {
            method: "POST",
        });

        return true;
    }

    async resetPassword(
        data: ResetPasswordRequest
    ): Promise<ResetCompletedPasswordResponse> {
        const res = await this.request<ResetCompletedPasswordResponse>(
            `${this.resourcePath()}/reset-password`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

        return mapResetCompletedPasswordFromResponse(res);
    }

    async resendActivationToken(userId: string): Promise<boolean> {
        await this.request(
            `${this.resourcePath()}/resend-activation-token?userId=${userId}`,
            { method: "POST" }
        );

        return true;
    }

    async getCurrentUser(): Promise<UserEntity> {
        const res = await this.request<UserResponse>(
            `${this.resourcePath()}/me`,
            { method: "GET" }
        );

        return mapUserFromResponse(res);
    }
}

// Singleton pattern
let instance: AuthenticationService | null = null;

export const getAuthenticationService = (): AuthenticationService => {
    if (!instance) instance = new AuthenticationService();
    return instance;
};
