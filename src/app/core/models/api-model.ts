// RESPUESTAS API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
}

export interface ApiResponseWithMeta<T, TMeta> extends ApiResponse<T> {
  meta?: TMeta;
}

export interface MetaDataPagination {
  pageNumber?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}


// RESPUESTA PROBLEM DETAILS (API)
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: any;
}

export interface ApiErrorItem {
  code: string;
  message: string;
  field?: string | null;
}

export interface ProblemDetailsWithErrors extends ProblemDetails {
  errors?: ApiErrorItem[];
  extensions?: { errors?: ApiErrorItem[]; [key: string]: any };
}
