const nodemailer = require('nodemailer');
const DbService = require('./db.service');
const CryptoService = require('./crypto.service'); 
const { COLLECTIONS } = require('../global');

const EmailService = {
    sendEmail: async (business, email, subject, message) => {
        try {
            const decryptedPassword = CryptoService.unhash(business.senderPassword);

            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: business.senderEmail, //"primego.bg@gmail.com"
                    pass: decryptedPassword, //"ngmgokzpngcokanu"
                },
                tls: {
                    rejectUnauthorized: true,
                    minVersion: "TLSv1.2",
                },
            });

            const mailOptions = {
                from: business.senderEmail,
                to: email,
                subject: subject,
                text: message,
                html: `
                    <div style="
                        font-family: 'Inter', sans-serif; 
                        line-height: 1.6; 
                        color: #333; 
                        font-size: 14px; 
                        margin: 0; 
                        padding: 16px; 
                        background-color: #f9f9f9; 
                        border: 1px solid #ddd; 
                        border-radius: 8px;
                    ">
                        <h4 style="margin: 0 0 16px;">
                            <b>${message}</b>
                        </h4>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
                        <p style="font-size: 0.9em; color: #666; margin: 0;">
                            Ако имате въпроси, свържете се с нас на: 
                            <br>
                            <strong>Имейл:</strong> 
                            <a href="mailto:${business.email}" style="color: #007BFF; text-decoration: none;">${business.email}</a> 
                            <br>
                            <strong>Телефон:</strong> 
                            <a href="tel:${business.phone}" style="color: #007BFF; text-decoration: none;">${business.phone}</a> 
                            <br>
                            <strong>Уебсайт:</strong> 
                            <a href="${business.website}" style="color: #007BFF; text-decoration: none;">${business.website}</a>
                            <br><br>
                            <strong>Поздрави,</strong>
                            <br>
                            Екипът на ${business.name}.
                        </p>
                        <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
                        <p style="font-size: 0.8em; color: #999; text-align: left; margin: 16px 0 0;">
                            Powered by <a href="https://sitezup.com" style="color: #007BFF; text-decoration: none;">sitezup.com</a>
                        </p>
                    </div>
                `
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            return { success: true, message: 'Email sent successfully!' };
        } catch (error) {
            console.error('Error sending email:', error);
            return { success: false, message: 'Failed to send email.', error };
        }
    },
};

module.exports = EmailService;
