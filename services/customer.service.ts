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
        const url = this.buildUrl(`${this.resourceEndpoint}/sign-up`);

        const response = await this.request<UserResponse>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });

        return mapUserFromResponse(response);
    }

    async signIn(data: SignInRequest): Promise<UserEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/sign-in`);

        const response = await this.request<AuthenticatedUserResponse>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });

        return mapAuthenticatedUserFromResponse(response);
    }

    async setInitialPassword(
        data: SetInitialPasswordRequest
    ): Promise<SetCompletedInitialPasswordResponse> {
        const url = this.buildUrl(
            `${this.resourceEndpoint}/set-initial-password`
        );

        const response = await this.request<SetCompletedInitialPasswordResponse>(
            url,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );

        return mapSetCompletedInitialPasswordFromResponse(response);
    }

    async forgotPassword(email: string): Promise<boolean> {
        const url = this.buildUrl(`${this.resourceEndpoint}/forgot-password`, {
            email,
        });

        await this.request<Response>(url, {
            method: "POST",
        });

        return true;
    }

    async resetPassword(
        data: ResetPasswordRequest
    ): Promise<ResetCompletedPasswordResponse> {
        const url = this.buildUrl(`${this.resourceEndpoint}/reset-password`);

        const response = await this.request<ResetCompletedPasswordResponse>(url, {
            method: "POST",
            body: JSON.stringify(data),
        });

        return mapResetCompletedPasswordFromResponse(response);
    }

    async resendActivationToken(userId: string): Promise<boolean> {
        const url = this.buildUrl(
            `${this.resourceEndpoint}/resend-activation-token`,
            { userId }
        );

        await this.request<Response>(url, {
            method: "POST",
        });

        return true;
    }

    async getCurrentUser(): Promise<UserEntity> {
        const url = this.buildUrl(`${this.resourceEndpoint}/me`);

        const response = await this.request<UserResponse>(url, {
            method: "GET",
        });

        return mapUserFromResponse(response);
    }
}

let authenticationServiceInstance: AuthenticationService | null = null;

export const getAuthenticationService = (): AuthenticationService => {
    if (!authenticationServiceInstance) {
        authenticationServiceInstance = new AuthenticationService();
    }
    return authenticationServiceInstance;
};
