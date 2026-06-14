const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendContactMail = async (req, res) => {
  try {
    const { firstName, lastName, email, projectSubject, message } = req.body;

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "info@meranoelite.com", // your receiving email
      subject: "New Contact Form Submission",
      html: `
        <h2>New Contact Form Submission</h2>

        <p><b>First Name:</b> ${firstName}</p>
        <p><b>Last Name:</b> ${lastName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Project Subject:</b> ${projectSubject}</p>
        <p><b>Message:</b> ${message}</p>
      `,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { sendContactMail };