exports.success = (res, data, message = 'Operation successful', status = 200) =>
  res.status(status).json({ success: true, data, message });

exports.fail = (res, error, message, status = 400) =>
  res.status(status).json({ success: false, error, message });
