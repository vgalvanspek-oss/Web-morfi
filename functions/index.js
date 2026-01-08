const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const cors = require("cors")({origin: true});

// Get Gmail credentials from environment variables
const gmailEmail = process.env.GMAIL_EMAIL;
const gmailPassword = process.env.GMAIL_PASSWORD;

// Create a Nodemailer transporter using Gmail's SMTP server
const mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

exports.sendContactEmail = functions.https.onRequest((req, res) => {
    // Enable CORS
    cors(req, res, () => {
        // Basic validation
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }
        if (!req.body.name || !req.body.email || !req.body.message) {
            return res.status(400).send("Bad Request: Missing required fields.");
        }

        const { name, company, email, interest, message } = req.body;

        // Email content
        const mailOptions = {
            from: `"${name}" <${gmailEmail}>`,
            replyTo: email,
            to: "ventas@morfimx.com",
            subject: `Nuevo Mensaje de Contacto - ${interest}`,
            html: `
                <p><strong>Nombre:</strong> ${name}</p>
                <p><strong>Empresa:</strong> ${company || "No especificada"}</p>
                <p><strong>Correo de Contacto:</strong> ${email}</p>
                <p><strong>Asunto de Interés:</strong> ${interest}</p>
                <hr>
                <p><strong>Mensaje:</strong></p>
                <p>${message}</p>
            `,
        };

        // Send the email
        mailTransport.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email: ", error);
                return res.status(500).send("Error al enviar el correo.");
            }
            return res.status(200).send("Correo enviado exitosamente.");
        });
    });
});