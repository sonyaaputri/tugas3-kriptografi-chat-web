export const sendSuccess = (res, data = {}, message = 'Success', status = 200) => {
  return res.status(status).json({ success: true, message, data });
};

export const sendError = (res, message = 'Error', status = 400, errors = null) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};