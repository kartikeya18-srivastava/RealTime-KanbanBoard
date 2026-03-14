export const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err);

  const status = err.status || 500;
  const code = err.code || "SERVER_ERROR";
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    code,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    code: "NOT_FOUND",
    message: `Resource not found: ${req.method} ${req.url}`,
  });
};
