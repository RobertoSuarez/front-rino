/**
 * Interfaz para el modelo de usuario
 */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  whatsApp: string;
  urlAvatar: string | null;
  status: 'active' | 'inactive';
  typeUser: 'student' | 'admin' | 'teacher' | 'parent';
  requiredUpdate: boolean;
  isVerified: boolean;
  approved: boolean;
  institutionId?: number;
  institution?: {
    id: number;
    name: string;
    logoUrl: string;
  };
}
