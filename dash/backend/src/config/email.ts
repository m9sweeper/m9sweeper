export default {
    use: process.env.EMAIL_CONFIG_USE || 'SMTP',
    smtp: {
        host: process.env.EMAIL_SMTP_HOST || '',
        port: process.env.EMAIL_SMTP_PORT || 465,
        debug: +process.env.EMAIL_DEBUG === 1, // defaults to false unless set to true
        secure: +process.env.EMAIL_SMTP_SECURE_CONNECTION === 1, // default to false
        auth: {
            user: process.env.EMAIL_SMTP_AUTH_USER || '',
            password: process.env.EMAIL_SMTP_AUTH_PASSWORD || ''
        }
    },
    default: {
        sender: process.env.EMAIL_DEFAULT_SENDER_EMAIL || ''
    },
    system: {
        enableErrorReportEmail: +process.env.EMAIL_SYSTEM_ERROR_REPORT_ENABLE === 1,
        errorReportReceiver: process.env.EMAIL_SYSTEM_ERROR_REPORT || ''
    },
    templateDir: process.cwd() + '/' + (process.env.EMAIL_TEMPLATE_DIR || 'dist/email-templates')
};
