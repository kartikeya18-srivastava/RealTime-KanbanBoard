/**
 * Standardized API Response Utility
 */

export const sendResponse = (res, { status = 200, success = true, message = '', data = null, code = null }) => {
  const response = {
    success,
    message,
    data,
  };

  if (code) {
    response.code = code;
  }

  return res.status(status).json(response);
};

export const success = (res, data = null, message = 'Success', status = 200) => {
  return sendResponse(res, { status, success: true, message, data });
};

export const error = (res, message = 'Error', status = 500, code = 'INTERNAL_ERROR') => {
  return sendResponse(res, { status, success: false, message, code });
};
