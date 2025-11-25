// -------------- REQUESTS --------------

export interface SignInRequest {
    email: string;
    password: string;
}

export interface SignUpRequest {
    email: string;
    username: string;
    password: string;
}

export interface SetInitialPasswordRequest {
    activationToken: string;
    password: string;
}

export interface ResetPasswordRequest {
    resetToken: string;
    newPassword: string;
}

// forgot password uses: ?email=...
export type ForgotPasswordRequest = string;

// resend activation uses: ?userId=...
export type ResendActivationTokenRequest = string;

// -------------- RESPONSES --------------

export interface AuthenticatedUserResponse {
    id: string | null;
    email: string | null;
    username: string | null;
    token: string | null;
}

export interface ResetCompletedPasswordResponse {
    userId: string | null;
    email: string | null;
    roles: string[] | null;
}

export interface SetCompletedInitialPasswordResponse {
    userId: string | null;
    email: string | null;
    roles: string[] | null;
}
