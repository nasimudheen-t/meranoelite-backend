const nodemailer = require("nodemailer");

const sendContactMail = async (req, res) => {
  try {
    const { firstName, lastName, name, email, phone, projectSubject, message } =
      req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER, 
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      html: `
  <h2>New Contact Form Submission</h2>

  <p><b>First Name:</b> ${firstName}</p>
  <p><b>Last Name:</b> ${lastName}</p>
  <p><b>Email:</b> ${email}</p>

  ${projectSubject ? `<p><b>Project Subject:</b> ${projectSubject}</p>` : ""}

  <p><b>Message:</b> ${message}</p>
`,
    });

    res.status(200).json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Email failed",
    });
  }
};

module.exports = { sendContactMail };
