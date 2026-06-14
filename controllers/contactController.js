const nodemailer = require("nodemailer");

const sendContactMail = async (req, res) => {
  try {
    const { firstName, lastName, email, projectSubject, message } = req.body;

    console.log("Contact request received");

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });

    await transporter.verify();
console.log("SMTP Connected");

    console.log("Before sendMail");

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Form Submission</h2>

        <p><strong>First Name:</strong> ${firstName}</p>
        <p><strong>Last Name:</strong> ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>

        ${
          projectSubject
            ? `<p><strong>Project Subject:</strong> ${projectSubject}</p>`
            : ""
        }

        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    console.log("After sendMail");

    return res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("EMAIL ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
      error: error,
    });
  }
};

module.exports = { sendContactMail };
