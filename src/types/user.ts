export interface User {
  id: string;
  email: string;
  name: string;
  role: 'system_owner' | 'company_operator' | 'board_member' | 'administrator' | 'executive';
  createdAt: string;
  lastActive: string;
  isActive: boolean;
  status?: string;
}
