export interface IAuthResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    existUser: {
      roles: string[];
    };
  };
}

export type AuthLoginForm = {
  email?: string;
  user_name?: string;
  password: string;
};
