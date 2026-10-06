export interface User {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
