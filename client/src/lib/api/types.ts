export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RestorationRequest {
  file: File;
  algorithm?: string;
  strength?: number;
  options?: Record<string, number>;
}

export interface RestorationResult {
  id: string;
  resultUrls: string[];
  status: 'completed' | 'processing' | 'failed';
  type?: string;
  inputFileUrl?: string;
  algorithm?: string;
  parameters?: Record<string, unknown>;
  errorMessage?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface CalligraphyRequest {
  text: string;
  style: string;
}

export interface CalligraphyResult {
  id: string;
  resultUrls: string[];
}
