export function getErrorMessage(error: unknown, fallback = "Unexpected error"): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return fallback;
}

export function toError(error: unknown, fallback = "Unexpected error"): Error {
  if (error instanceof Error) {
    return error;
  }

  return new Error(getErrorMessage(error, fallback));
}
