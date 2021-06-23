const router = require("express").Router()
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL,
        pass: process.env.WORD,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
})

transporter.verify((err, success) => {
    err ? console.log(err) : console.log(`server is ready to take messages: ${success}`)
})

router.post("/sendmail", (req, res, next) => {
    const mailOptions = {
        from: `identumu@gmail.com`,
        to: `${process.env.EMAIL}`,
        subject: `Message from nodemailer API`,
        text: `This is an experimenting message`
    }

    transporter.sendMail(mailOptions, (err, data) => {
        if(err) return res.status(400).json({status: "failed"})
        console.log("message sent!");
        res.json({status: "success"})
    })
})

module.exports = router