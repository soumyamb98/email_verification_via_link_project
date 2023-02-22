const express = require('express');
const port = process.env.PORT || 5000;
const index = express();

const cors = require('cors')
const SignUpData = require('./model/signupmodel');

// email verify
const UserVerifications = require('./model/signupemailverify');

const multer = require('multer');
const session = require('express-session');
    // aPZAsutyIsa8
    const fs = require('fs');
// const signupdata = require('./model/signupmodel');




const cookieparser = require('cookie-parser');

const jwt = require('jsonwebtoken'); const bcrypt = require('bcrypt');
const { requireAuth, checkUser } = require('./middleware/middleware');
const nodemailer = require('nodemailer');




const { v4: uuidv4 } = require('uuid');
index.use(session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false
}));


index.use(cors({
    // credentials: true,
    // origin: ['http://localhost:6000']
}))


index.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})
const path= require('path')
;
index.use(express.json())
index.use(express.urlencoded({ extended: true }));
// index.use(express.static("./public"));

index.set("views", __dirname + "/src/views");
index.use(cookieparser());


// index.get('*', checkUser)
// index or login page
    // index.get("/", function (req, res) {
    //         res.render("index");
    //     });

// i page
    // index.get("/user",requireAuth ,function (req, res) {
    //     employmodel.find()
    //         .then(function (items) {
    //             res.render("user", {
    //                 // items
    //             });
    //         });
    // });


    // index.get("/single", function (req, res) {
    //     res.render("single");
    // });

// signup page
index.get("/signup", function (req, res) {
    res.render("signup");
});
// logout
    index.get('/logout', (req, res) => {
        res.cookie('jwt', '', { maxAge: 1 });
        res.redirect('/');
    });


// multer
    var fileStorageEngine = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/images/')
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '--' + file.originalname);
        },
    });
    var imageupload = multer({ storage: fileStorageEngine });
    









//error handlng
    const signuperrors = (err) => {
        console.log(err.message, err.code);
        let errors = { email: '', password: '' };

        //incorrect email
        if (err.message === "incorrect email") {
            errors.email='that email is not registered'
        }
        //incorrect password
        if (err.message === "incorrect password") {
            errors.password='that password is incorrect'
        }
        
        // duplicate email error code mesage
        if (err.code === 11000) {
            errors.email = 'that email is already registered';
            return errors;
        };
        // validation errors
        if (err.message.includes('signupdata validation failed')) {
            // console.log(Object.values(err.errors));

            Object.values(err.errors).forEach(({properties}) => {
                // console.log(error.properties);
                errors[properties.path] = properties.message;
            })
        }
        return errors;
    }  


// jwt token create
    const maxAge = 60 * 60 * 15
    //jwt expects seconds not milliseconds like cookies
    const createToken = (id) => {
        return jwt.sign({ id }, 'my secret jwt secret key',{
            expiresIn: maxAge
        })
    }



    
//signup data insert to mongo db
index.post('/signup', async function (req, res) {
    var email = req.body.email;
    let password = req.body.password;
    let username = req.body.username;
    // const { username, email, password } = req.body;
    try {
        const signup = await SignUpData.create({
            username, email, password,
            verified: false
        
        });
        signup
            .save()
            .then((result) => {
                sendverificationemail(result, res);
                // sigdata
        })
        const token = createToken(signup._id);
    
        res.cookie('jwt', token, { httpOnly: true, maxAge : maxAge * 1000 });
        res.status(201).json({ signup: signup._id });

    } catch (err) {
        const errors= signuperrors(err);
        // console.log(err);
        res.status(400).json({ errors })
    }
    
});
// mailer sentim
let transporter = nodemailer.createTransport({
    service:"gmail",
    // host: 'mail.YOURDOMAIN.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'appnodemailermail@gmail.com',
        pass: '1234567098'
    },
    tls:{
      rejectUnauthorized:false
    }
  });
// testing sucess
    transporter.verify((error, success) => {
    if (error) {
        return console.log(error);
    } else {
        console.log(success);
    }
  })
// send email
const sendverificationemail = ({ _id, email }, res) => {
    const currentUrl = "http://localhost:5000/";
    const uniqueString = uuidv4() + _id;
    
    

    const saltRounds = 10; //hash the unique strings
    bcrypt
        .hash(uniqueString, saltRounds)
        .then((hashedUniqueString) => {
            // set values in userverifyemail collections
            const newVerification = new UserVerifications({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 21600000
            })
            newVerification
                .save()
                .then(() => {
                    transporter
                        .sendMail(mailOptions)
                        .then(() => {
                            //email sent and verification record being saves
                            res.json({
                                status: "pending",
                                message: "email verification sent "
                            })
                        })
                        .catch((error) => {
                            console.log(error);
                            res.json({
                                status: "error",
                                message: "mail sending check"
                            })
                        })
                })
                .catch((error) => {
                    console.log(error);
                    res.json({
                        status: "error",
                        message:" error at newverifications couldn't save verification data"
                    })
                })
        })
        .catch(() => {
            res.json({
                status: "error mail",
                message: "error occured while hashing email data"
            })
        })
    //  setup email data with unicode symbols
    let mailOptions = {
        from: 'appnodemailermail@gmail.com',
        to: email, // list of receivers
      subject: 'verifyyour email', // Subject line
      
      html: `<p>pls verifyyour email to complete the signup process<b>this link expires in 6 hrs</b> </p><p>press <a href=${currentUrl +
        
            "verify/" + _id + "/" + uniqueString}>link ${uniqueString}</a>press</p>`,
      //   "user/verify" + _id + "/" + uniqueString}></p>`,
    //   text: 'Hello world?', // plain text body
    //   html: output // html body
    };
}
    


// verifings of the emails
index.get("/verify/:userId/:uniqueString", (req, res) => {
    let { userId, uniqueString } = req.params;

    UserVerifications
        .find({ userId })
        .then((result) => {
            if (result.length > 0) {
                const { expiresAt } = result[0];
                const hashedUniqueString = result[0].uniqueString;

                if (expiresAt < Date.now()) {
                    UserVerifications
                        .deleteOne({ userId })
                        .then(result => {
                            SignUpData
                                .deleteOne({ _id: userId })
                                .then(() => {
                                    let message = "lonk expired pls signup ";
                                    res.redirect(`/verified/error=true&message=${message}`);
                                })
                                .catch(error => {
                                    let message = "the clearing of user eith expired unique string error";
                                    res.redirect(`/verified/error=true&message=${message}`);
                                    // res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                        })
                        .catch((error) => {
                            console.log(error)
                            let message = "error occured while clearing expired user records";
                            res.redirect(`/verified/error=true&message=${message}`);
                        })
                } else {
                    
                    // valid record exists so validate the user string
                    // atfirst compare hashed unique string

                    bcrypt
                        .compare(uniqueString, hashedUniqueString)
                        .then(result => {
                            if (result) {
                                // strings matchs

                                SignUpData
                                    .updateOne({ _id: userId }, { verified: true }).then(() => {
                                        UserVerifications
                                            .deleteOne({ userId })
                                            .then(() => {
                                                res.sendFile(path.join(__dirname,"emails.html"))
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                let message = "error at 317";
                                                res.redirect(`/verified/error=true&message=${message}`);
                                            })
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        let message = "error while updating user records to shows verifieds";
                                        res.redirect(`/verified/error=true&message=${message}`);
                                    })
                            } else {
                                //existing records but incorrect details passed
                                console.log(error);
                                let message = "Invalid verifications details passed,check inboxes";
                                res.redirect(`/verified/error=true&message=${message}`);
                            }
                        })
                        .catch(error => {
                            console.log(error);
                            let message = "error occured while comparing unique strings";
                            res.redirect(`/verified/error=true&message=${message}`);
                        })
                }
            }
            else {
                let message = "Account record doesnt exist or has been veridied already. pls signup or login to continus";
                res.redirect(`/verified/error=true&message=${message}`);
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "error occured while checking for existing user records";
            res.redirect(`/verified/error=true&message=${message}`);
        })
})

//page rout
index.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname,"emails.html")) 
})
//login post
index.post('/logins', async function (req, res) {
            
    const { email, password } = req.body;

    try {
        const user = await SignUpData.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
        res.status(200).json({ signup: user._id });
    }
    catch (err) {
        const errors = signuperrors(err);
        res.status(400).json({ errors });
    }
})

// cookies
    // index.get('/set-cookies', (req, res) => {
    //     // res.setHeader('Set-Cookie', 'newUser=true');
    //     res.cookie('newUser', false);
    //     res.cookie('isEmployee', true, { maxAge: 1000 * 60 * 60 * 15 });
    //     // res.cookie('isEmployee', true, { maxAge: 1000 * 60 * 60 * 15, httpOnly:true });
    //     // res.cookie('isEmployee', true, { maxAge: 1000 * 60 * 60 * 15, secure:true });
    //     res.send('you got the cookie!');
    // })

    // index.get('/read-cookies', (req, res) => {
    //     const cookies = req.cookies;
    //     console.log(cookies);
    //     console.log(cookies.isEmployee);
    //     res.json(cookies);
    // })

    
      // send mail with defined transport object
    //   transporter.sendMail(mailOptions, (error, info) => {
    //       if (error) {
    //           return console.log(error);
    //       }
    //       console.log('Message sent: %s', info.messageId);   
    //       console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    //       res.render('contact', {msg:'Email has been sent'});
    //   });
    //   });

index.listen(port, () => console.log(" listening at " + port))