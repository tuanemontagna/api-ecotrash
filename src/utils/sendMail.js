import nodemailer from 'nodemailer';
import 'dotenv/config';

// Configuração do "transportador" de e-mail usando as variáveis de ambiente
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true para a porta 465, false para as outras
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Função para enviar um e-mail de notificação.
 * @param {string} destinatarioEmail - O e-mail do destinatário.
 * @param {string} destinatarioNome - O nome do destinatário.
 * @param {string} assunto - O assunto do e-mail.
 * @param {string} corpoHtml - O conteúdo do e-mail em formato HTML.
 */
const enviarEmailDeNotificacao = async (destinatarioEmail, destinatarioNome, assunto, corpoHtml) => {
    try {
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_FROM}>`, // Remetente
            to: `"${destinatarioNome}" <${destinatarioEmail}>`, // Destinatário
            subject: assunto, // Assunto
            html: corpoHtml, // Corpo do e-mail em HTML
        });

        console.log("E-mail de notificação enviado: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Erro ao enviar e-mail de notificação:", error);
        // Em uma aplicação real, você poderia ter um sistema de fallback ou logging mais robusto aqui
        return false;
    }
};

export { enviarEmailDeNotificacao };
