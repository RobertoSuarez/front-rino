export interface Institution {
  id: number;
  name: string;
  description: string;
  logoUrl: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  userCount?: number;
}

export interface CreateInstitutionDto {
  name: string;
  description?: string;
  logoUrl?: string;
}

export interface UpdateInstitutionDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  status?: string;
}
