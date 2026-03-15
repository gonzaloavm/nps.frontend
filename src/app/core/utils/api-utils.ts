import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export interface ApiErrorItem {
  code: string;
  message: string;
  field?: string | null;
}

export function handleApiError(error: HttpErrorResponse) {
  let apiErrors: ApiErrorItem[] = [];

  // Helper para normalizar cualquier item de error
  const normalize = (e: any): ApiErrorItem => ({
    code: e?.code ?? e?.errorCode ?? e?.key ?? `UNKNOWN`,
    message: e?.message ?? e?.detail ?? e?.title ?? String(e) ?? 'Error desconocido',
    field: e?.field ?? e?.property ?? null
  });

  try {
    const body = error.error;

    // Caso 1: Antigua ApiErrorResponse { success: false, errors: [...] }
    if (body && typeof body === 'object' && body.success === false && Array.isArray(body.errors)) {
      apiErrors = body.errors.map(normalize);
    }
    // Caso 2: ProblemDetails (RFC 7807) con errors directo o dentro de extensions
    else if (body && typeof body === 'object' && (body.type || body.title || body.status)) {
      const direct = Array.isArray(body.errors) ? body.errors : null;
      const ext = body.extensions && Array.isArray(body.extensions.errors) ? body.extensions.errors : null;
      const candidate = direct ?? ext ?? null;

      if (Array.isArray(candidate)) {
        apiErrors = candidate.map(normalize);
      } else {
        // Si no hay lista, usamos title/detail como mensaje único
        apiErrors = [{
          code: body.type ?? `HTTP_${body.status ?? error.status}`,
          message: body.detail ?? body.title ?? 'Error del servidor',
          field: null
        }];
      }
    }
    // Caso 3: Error de red o CORS (status 0)
    else if (error.status === 0) {
      apiErrors = [{
        code: 'NETWORK_ERROR',
        message: 'No se pudo contactar con el servidor.',
        field: null
      }];
    }
    // Caso 4: Otros errores HTTP con posible body no estructurado
    else if (body && typeof body === 'object') {
      // Intentamos extraer un array de errores en propiedades comunes
      const candidate = body.errors ?? body.error ?? body.message ?? null;
      if (Array.isArray(candidate)) {
        apiErrors = candidate.map(normalize);
      } else if (typeof candidate === 'string') {
        apiErrors = [{
          code: `HTTP_${error.status}`,
          message: candidate,
          field: null
        }];
      } else {
        apiErrors = [{
          code: `HTTP_${error.status}`,
          message: error.message || 'Error inesperado en la comunicación.',
          field: null
        }];
      }
    }
    // Caso 5: Fallback para cualquier otro caso
    else {
      apiErrors = [{
        code: `HTTP_${error.status}`,
        message: error.message || 'Error inesperado en la comunicación.',
        field: null
      }];
    }
  } catch {
    apiErrors = [{
      code: 'UNKNOWN_ERROR',
      message: 'Error procesando la respuesta del servidor.',
      field: null
    }];
  }

  return throwError(() => ({ original: error, apiErrors }));
}
