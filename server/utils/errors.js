export function createHttpError(statusCode, code, publicMessage, cause) {
  const error = new Error(publicMessage);
  error.statusCode = statusCode;
  error.code = code;
  error.publicMessage = publicMessage;
  error.cause = cause;
  return error;
}

export function normalizePortalError(error) {
  if (error.statusCode) {
    return error;
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return createHttpError(
      503,
      "PORTAL_UNAVAILABLE",
      "The GGSIPU portal did not respond in time.",
      error
    );
  }

  if (error.response?.status >= 500) {
    return createHttpError(
      503,
      "PORTAL_UNAVAILABLE",
      "The GGSIPU portal is currently unavailable.",
      error
    );
  }

  if (error.response?.status >= 400) {
    return createHttpError(
      502,
      "PORTAL_REQUEST_FAILED",
      "The GGSIPU portal rejected the request.",
      error
    );
  }

  return createHttpError(
    502,
    "PORTAL_REQUEST_FAILED",
    "Unable to communicate with the GGSIPU portal.",
    error
  );
}
