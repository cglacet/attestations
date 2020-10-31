import nodemailer from 'nodemailer';
import { mailAuth, DEFAULT_MAIL_PWD } from './config';

const TRANSPORTER_PROMISE = createTransporter()

async function createTransporter(){
    return nodemailer.createTransport({
        service: 'gmail',
        auth: mailAuth,
    });
}

export async function attestationMail(to, text, attachments){
    const transporter = await TRANSPORTER_PROMISE;
    let info = await transporter.sendMail({
        to,
        text,
        from: `"Moi-même" <${to}>`,
        subject: "Attestation 🛂",
        attachments,
    });
}