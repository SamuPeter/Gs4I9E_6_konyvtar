jest.mock('express-validator');

const { validationResult } = require('express-validator');
const validate = require('../../src/middleware/validate');

describe('validate middleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  test('calls next when there are no validation errors', () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    validate(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 400 with first error message when validation fails', () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Email is invalid' }, { msg: 'Second error' }]
    });
    validate(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Email is invalid' }));
    expect(next).not.toHaveBeenCalled();
  });
});
