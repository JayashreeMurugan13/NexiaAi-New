/**
 * Centralized Error Handling
 */

export enum ErrorCode {
  SKILL_DETECTION_FAILED = 'SKILL_DETECTION_FAILED',
  ML_PREDICTION_FAILED = 'ML_PREDICTION_FAILED',
  VIDEO_ANALYSIS_FAILED = 'VIDEO_ANALYSIS_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export function handleError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }
  
  return {
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
    statusCode: 500,
  };
}
