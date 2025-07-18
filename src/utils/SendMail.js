import nodemailer from "nodemailer";
import _CONFIG from "../config.js";
import { ApiError } from "./ApiError.js";
import Mailgen from "mailgen";

function createDelay(delay) {
    return new Promise((res, rej) => setTimeout(res, delay));
}

// generic function for sending email
async function sendMail(email, emailContent, subject) {
    const transportor = nodemailer.createTransport({
        host: _CONFIG.MAIL_HOST,
        port: _CONFIG.MAIL_PORT,
        secure: false,
        auth: {
            user: _CONFIG.MAIL_AUTH_USER,
            pass: _CONFIG.MAIL_AUTH_PASSWORD,
        },
    });

    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            // Appears in header & footer of e-mails
            name: "Factbot",
            link: "https://factbot.online/",
            logo: "public/img/logo/chat_icon_2.png",
        },
    });

    const emailBody = mailGenerator.generate(emailContent);
    const plaintextBody = mailGenerator.generatePlaintext(emailContent);

    var message = {
        from: "FactBot <smpt@factbot.io>",
        to: email,
        subject: subject,
        text: plaintextBody,
        html: emailBody,
    };

    try {
        const info = await transportor.sendMail(message);
        return info;
    } catch (error) {
        // re-attempt sending mail for 3 times using exponential backof strategy
        let attempt = 1;
        let expBackoffTime = 1000;

        while (true) {
            console.log("Sending email. Attempt: ", attempt);
            attempt++;

            try {
                const info = await transportor.sendMail(message);
                return info;
            } catch (error) {
                // if failed for 4 times, throw error
                if (attempt === 4) {
                    throw new ApiError(400, "Failed to send mail");
                }

                await createDelay(expBackoffTime);
                expBackoffTime = expBackoffTime * 2;
            }
        }
    }
}

const send = {
    verificationMail: async function (
        to = "",
        fname = "",
        lname = "",
        verificationEndPoint = "",
        verificationToken = ""
    ) {
        const emailContent = {
            body: {
                name: `${fname} ${lname}`,
                intro: "Welcome to Factbot! We're very excited to have you on board.",
                action: {
                    instructions:
                        "To get started with Mailgen, click here to verfiy your email:",
                    button: {
                        color: "#22BC66",
                        text: "Confirm your account",
                        link: verificationEndPoint + verificationToken,
                    },
                },
                outro: "Need help, or have questions? Just reply to this email, we'd love to help.",
            },
        };

        try {
            return await sendMail(to, emailContent, "Verification Mail");
        } catch (error) {
            throw new ApiError(
                207,
                "Account created Successfully but failed to send verification mail"
            );
        }
    },
    passwordResetMail: async function (
        to = "",
        fname = "",
        lname = "",
        resetPasswordEndPoint = "",
        resetPasswordToken = ""
    ) {
        const emailContent = {
            body: {
                name: `${fname} ${lname}`,
                intro: "We got a request from you to change your FactBot password.",
                action: {
                    instructions: "To change your password, click here:",
                    button: {
                        color: "#22BC66",
                        text: "Change your password",
                        link: resetPasswordEndPoint + resetPasswordToken,
                    },
                },
                outro: "If this request is not made from your side, please immediately change your password",
            },
        };

        try {
            return await sendMail(to, emailContent, "Change FactBot password");
        } catch (error) {
            throw new ApiError(207, "Failed to send change password mail");
        }
    },
};

export default send;
