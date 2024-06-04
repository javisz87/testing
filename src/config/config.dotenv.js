const dotenv = require('dotenv')

dotenv.config()

module.exports = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    persistence: process.env.PERSISTENCE,
    twilio_account_sid: process.env.TWILIO_ACCOUNT_SID,
    twilio_auth_token: process.env.TWILIO_AUTH_TOKEN,
    twilio_sms_number: process.env.TWILIO_SMS_NUMBER
}