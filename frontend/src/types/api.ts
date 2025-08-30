export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  payload?: T;
}

export interface PaginationInfo {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

