import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateLogin = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ min: 6, max: 25 })
    .withMessage("Email must be between 6 and 25 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 64 })
    .withMessage("Password must be less than 64 characters"),

  handleValidationErrors,
];

export const validateSignup = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 4, max: 50 })
    .withMessage("Name must be between 4 and 50 characters"),

  body("email")
    .isEmail()
    .withMessage("Invalid email format")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ min: 6, max: 25 })
    .withMessage("Email must be between 6 and 25 characters"),

  body("password")
    .notEmpty()
    .isStrongPassword()
    .withMessage(
      "Password must be strong (min 8 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol)"
    )
    .isLength({ max: 64 })
    .withMessage("Password must be less than 64 characters"),

  body("phoneNo")
    .notEmpty()
    .withMessage("Mobile number is required")
    .isMobilePhone("en-IN")
    .withMessage("Invalid mobile number format"),

  handleValidationErrors,
];
