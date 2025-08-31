export enum UserType {
  UTILISATEUR = 'UTILISATEUR',
  CLIENT_ABONNE = 'CLIENT_ABONNE', 
  AGENCE_IMMOBILIERE = 'AGENCE_IMMOBILIERE',
  ADMINISTRATEUR = 'ADMINISTRATEUR'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export interface UserRegistration {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  telephone: string;
  adresse: string;
  userType: UserType;
  nomAgence?: string;
  numeroLicence?: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
}

export interface UserLogin {
  email: string;
  motDePasse: string;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  userType: UserType;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  nomAgence?: string;
  numeroLicence?: string;
  siteWeb?: string;
  nombreEmployes?: number;
  zonesCouverture?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  message?: string;
  error?: string;
  timestamp?: string;
  data?: T;
}