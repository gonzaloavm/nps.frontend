// utils/problem-utils.ts
import { ProblemDetailsWithErrors, ApiErrorItem } from '../models/api-model';

export function extractProblemErrors(body: any): ApiErrorItem[] {
  try {
    const pd = body as ProblemDetailsWithErrors;
    const direct = pd.errors;
    const ext = pd.extensions?.errors;
    const candidate = direct ?? ext ?? body?.errors ?? null;

    if (Array.isArray(candidate)) {
      return candidate.map((e: any) => ({
        code: e.code ?? '',
        message: e.message ?? e.detail ?? '',
        field: e.field ?? null
      }));
    }
  } catch {
    // fallthrough
  }
  return [];
}
