import { body } from "express-validator";

function userRegistrationValidator() {
    return [
        body("fname")
            .trim()
            .notEmpty()
            .withMessage("first name is required")
            .isLength({ min: 3 })
            .withMessage("Minimum 3 character first name is required")
            .escape(),
        body("lname")
            .trim()
            .notEmpty()
            .withMessage("last name is required")
            .isLength({ min: 3 })
            .withMessage("Minimum 3 character last name is required")
            .escape(),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid")
            .escape(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("minimum password length is 8")
            .isLength({ max: 16 })
            .withMessage("maximum password length is 16")
            .escape(),
    ];
}

function userLoginvalidator() {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("email is required")
            .isEmail()
            .withMessage("email is invalid")
            .escape(),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required")
            .isLength({ min: 8 })
            .withMessage("minimum password length is 8")
            .isLength({ max: 16 })
            .withMessage("maximum password length is 16")
            .escape(),
    ];
}

export { userRegistrationValidator, userLoginvalidator };
