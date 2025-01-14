//REMEMBER: app passwords get revoked when Google Account password changes

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: true, 
        minVersion: "TLSv1.2",   
    },
});

const EmailService = {
    sendEmail: async (email, subject, message) => {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER, 
                to: email,                    
                subject: subject,             
                text: message,                
                /*html: `
                    <div style="font-family: 'Inter', sans-serif; line-height: 1.6; color: #333;">
                        <h1 style="color: #007BFF; font-weight: 600;">Hello!</h1>
                            <p>${message}</p>
                            <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">
                            <p style="font-size: 0.9em; color: #666;">
                                This is a custom email sent from our service.<br>
                                <strong style="font-weight: 600;">Thank you for using our platform!</strong>
                            </p>
                        </hr>    
                    </div>
                `*/
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