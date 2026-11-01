export type ServiceResponse<T> = {
  data: T | null;
  error: Error | null;
  success: boolean;
};

export const toError = (error: unknown): Error => {
  if (error instanceof Error) {
    return error;
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    return new Error(String(error.message));
  }

  return new Error(String(error));
};

export const createResponse = <T>(data: T | null, error: Error | null = null): ServiceResponse<T> => {
  if (error) {
    console.error('[Service Error]', error.message);
  }
  return {
    data,
    error,
    success: error === null,
  };
};
