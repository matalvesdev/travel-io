export type AccountStatus = 'active' | 'deleted' | 'suspended';

export interface AccountDeletionRequest {
  id: string;
  userId: string;
  reason?: string;
  requestedAt: string;
  scheduledFor: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface DataExportLog {
  id: string;
  userId: string;
  requestedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  expiresAt: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}

export interface ExportDataResponse {
  downloadUrl: string;
  expiresAt: string;
  dataSize: number;
}
