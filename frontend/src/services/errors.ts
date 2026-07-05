/**
 * Normalizes backend error shapes into a human-readable string.
 * Handles FastAPI's validation error array, plain detail strings,
 * and generic JS Error objects.
 */
export function extractErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred.";

  // Axios error with a response body
  const axiosError = error as any;
  const detail = axiosError?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  // FastAPI validation errors come back as an array of objects
  if (Array.isArray(detail)) {
    return detail
      .map((d: any) => `${d.loc?.join(".")} — ${d.msg}`)
      .join("; ");
  }

  // Plain JS error message
  if (axiosError?.message) return axiosError.message;

  return "An unexpected error occurred.";
}
