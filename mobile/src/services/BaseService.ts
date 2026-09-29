export type ServiceResponse<T> = {
  data: T | null;
  error: Error | null;
  success: boolean;
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
