import nodemailer from "nodemailer";
import ejs from "ejs";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { htmlToText } from "html-to-text";
import juice from "juice";
import { google } from "googleapis";
import config from "../config/config.js";

const OAuth2 = google.auth.OAuth2;
const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const createTransporter = async () => {
  let transporter;
  if (process.env.NODE_ENV === "production") {
    const oauth2Client = new OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
    oauth2Client.setCredentials({
      refresh_token: config.google.refreshToken,
    });
    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      });
    });

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: config.google.email,
        accessToken,
        clientId: config.google.clientId,
        clientSecret: config.google.clientSecret,
        refreshToken: config.google.refreshToken,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: "localhost",
      port: 25,
      auth: {
        user: "admin@localhost",
        pass: "admin",
      },
    });
  }

  return transporter;
};

const sendEmail = async (to, subject, text, templateName, templateVars, from = "") => {
  // templates are stored in the server/src/server/templates folder
  const templatePath = path.join(__dirname, `../templates/${templateName}.html`);
  if (templateName && fs.existsSync(templatePath)) {
    const template = fs.readFileSync(templatePath, "utf8");
    const html = ejs.render(template, templateVars);
    text = htmlToText(html);
    text = juice(html);

    const transporter = await createTransporter();
    const mailOptions = {
      from: from ? from : config.email.from,
      to,
      subject,
      text,
      html,
    };
    await transporter.sendMail(mailOptions);
  } else {
  }
};

const sendNotifyEmail = async (subject = "", text = {}, type) => {
  // console.log(text);
  switch (type) {
    case "NEW USER":
      subject = "New user Registered";
    case "NEW ORDER":
      subject = `<b>New Order placed #${text.orderNumber}</b>`;
      break;
    default:
      subject = "New user Registered";
  }
  const to = process.env.NODE_ENV === "production" ? config.google.email : "admin@localhost.com";
  const template = type.toLowerCase().split(" ").join("-");

  await sendEmail(to, subject, "", template, {
    orderNumber: text.orderNumber,
    orderTotal: text.orderTotal,
    orderDate: text.orderDate,
  });
};

const sendResetPasswordEmail = async (to, token, origin) => {
  const subject = "Reset password";
  // replace this url with the link to the reset password page of your front-end app
  const resetLink = `${origin}/reset-password?token=${token}`;
  const templateVars = {
    emailAddress: "test@test.com",
    resetLink,
  };
  await sendEmail(to, subject, "", "reset-password", templateVars);
};

const sendVerificationEmail = async (to, token) => {
  const subject = "Email Verification";
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://localhost:5000/api/v1/auth/verify-email?token=${token}`;
  const text = `Dear user,
  <button>Verify Email</button>
  To verify your email, click on this link: ${verificationEmailUrl}
  If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

const sendContactEmail = async (subject, text) => {
  const templateVars = {
    message: text.message,
    name: text.name,
  };
  const to = process.env.NODE_ENV === "production" ? config.google.email : "admin@localhost.com";
  await sendEmail(to, subject, text, "contact-email", templateVars, text.email);
};

export const emailService = {
  sendEmail,
  sendNotifyEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendContactEmail,
};