const Clients = require('../models/client.model.js');
const Config = require('../models/config.model.js');
const otplogs = require('../models/otplog.model.js');
const Users = require('../models/user.model.js');

const validfn = require('../misc/validators.js');

const mongoose = require('mongoose');
const e = require('express');

var crypto = require('crypto'); 


exports.updtaemail = (req, res) => {
    if(!req.body.aemail) {
        return res.status(400).send({
            message: "Email can not be empty"
        });
    }

    const [resb, rest] = validfn.emailvalidation(req.body.aemail)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email "+rest}); 
    }

    Config.findOne()
    .then(function(data) {
        if(data)
        {
            if(data.status == "2")
            {
                res.status(200).send({message: "Admin account already created"})
            }
            else
            {
                var update = {"email": req.body.aemail}
                Config.findOneAndUpdate(update, {useFindAndModify: false, new: true})
                .then(function(data){
                    if(data)
                    {
                        res.status(200).send(data)
                    }
                    else
                    {
                        return res.status(400).send({
                            message: "Record not found "
                        });
                    }   
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Error occurred while updating admin email."
                    });
                });
            }
            
        }
        else
        {
            cdict = {}
            cdict["email"] = req.body.aemail
            cdict["status"] = "1"
            const config = new Config(cdict);
            config.save()
            .then(data => {
                res.status(200).send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while configuring admin email."
                });
            });   
        }

    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while reading the Config."
        });
    });  
}

exports.signup = (req, res) => {
    Config.findOne()
    .then(function(data) {
        if(data)
        {
            if(data.status == "0")
            {
                res.status(200).send({message: "Admin email not configured"})
            }
            else
            if(data.status == "1")
            {
                res.status(200).send({message: "Welcome Admin"}) 
            }
            else
            if(data.status == "2")
            {
                res.status(200).send({message: "Welcome User"}) 
            }
            else
            {
                res.status(200).send({message: "Database not configured"}) 
            }
            
        }
        else
        {
            res.status(200).send({message: "Database not configured"}) 
        }

    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while reading the Config."
        });
    });  

}


exports.asignup = (req, res) => {
    if(!req.body.email || !req.body.oname || !req.body.uname || !req.body.pwd) {
        return res.status(400).send({
            message: "Field can not be empty"
        });
    }

    var [resb, rest] = validfn.inputvalidation(req.body.oname)
    
    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Organization Name"+rest});  
    }

    [resb, rest] = validfn.inputvalidation(req.body.uname)
    
    if(!Boolean(resb))
    {
        return res.status(400).send({message: "User Name"+rest}); 
    }

    [resb, rest] = validfn.pwdvalidation(req.body.pwd)
    
    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Password"+rest}); 
    }

    [resb, rest] = validfn.emailvalidation(req.body.email)
    
    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email"+rest}); 
    }

    Config.findOne()
    .then(function(data) {
        if(data)
        {
            if(data.status == "2")
            {
                res.status(200).send({message: "Admin account already created"})
            }
            else
            if(data.status != "1")
            {
                res.status(200).send({message: "Admin Email not configured"}) 
            }
            else
            {
                if(data.email != req.body.email)
                {
                    res.status(200).send({message: "Given Email not match with the configured email"}) 
                }
                else
                {
                    CreateUserAccount("0", "4", req, res)
                }
            }
        }
        else
        {
            res.status(200).send({message: "Database not configured"}) 
        }

    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while reading the Config."
        });
    });  
}


// Send OTP to mail id
exports.sendAdminOtp = (req, res) => {
    // check req.body has required fields
    if(!req.body.email) {
        return res.status(400).send({
            message: "Email ID required to send OTP"
        });
    }

    if(!req.body.uname) {
        return res.status(400).send({
            message: "Username required to send OTP"
        });
    }

    // email id validation
    let emailId = req.body.email;
    const [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email "+rest}); 
    }

    // username validation required
    let userName = req.body.uname;

    // check admin status
    Config.find({ "email": { $eq: emailId } })
    .then(function(data){
        if(data[0].status == "0"){
            // check config collection doc count
            // if more than one, check username is available
            Config.estimatedDocumentCount()
                .then(function(data) {
                    if(data > 1){
                        Users.countDocuments({ "uname": userName })
                            .then(function(data){
                                if(data >= 1){
                                    return res.status(400).send({message: "Username not available"});
                                }
                                else{
                                    saveOtpInfo(req, res);
                                }
                            })
                            .catch((err) => {
                                return res.status(500).send({
                                    message: err.message || "Some error occurred while reading the user."
                                });
                            });
                    }
                    else{
                        saveOtpInfo(req, res);
                    }
                })
                .catch((err) => {
                    return res.status(500).send({
                        message: err.message || "Some error occurred while reading the Config."
                    });
                });
        }
        else if(data[0].status == "2"){
            return res.status(400).send({message: "Admin account already configured"});
        }
        else if(data[0].status == "1"){
            return res.status(400).send({message: "Admin signup already done"});
        }
        else{
            return res.status(400).send({message: "Invalid admin account status"});
        }
    })
    .catch((err) => {
        return res.status(500).send({
            message: err.message || "Some error occurred while reading the Config."
        });
    });

};


exports.sendAmail = (req, res) => {
    if(!req.body.email) {
        return res.status(400).send({
            message: "Email account not provided!"
        });
    }



}

function CreateUserAccount(clientid, level, req, res)
{
    this.salt = crypto.randomBytes(16).toString('hex')
    this.hash = crypto.pbkdf2Sync(req.body.pwd, this.salt,1000, 64, `sha512`).toString(`hex`); 

    //const update = {"uname": req.body.uname, "psalt": this.salt, "pwd": this.hash, "email": req.body.email}

    const client = new Users({
                      cid: clientid,
                      uname: req.body.uname,
                      psalt: this.salt,
                      phash: this.hash,
                      email: req.body.email,
                      level: level
                  });    

    client.save()
    .then(data => {
        var resdict = {};
        resdict["uname"] = data.uname;
        resdict["email"] = data.email;
        res.status(200).send(resdict);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Account."
        });
    });      

}

exports.usignup = (req, res) => {
    res.status(200).send({message: "Sorry, not implemented"})    
}


function saveOtpInfo(req, res){
    const otpNum = GenerateRandom();
    var currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 30);

    const otplog = new otplogs({
        uname: req.body.uname,
        email: req.body.email,
        otp: otpNum,
        isVerified: "no",
        expiryTime: currentDate
    });

    otplog.save()
    .then(data => {
        sendMail = sendOtpMail(req.body.email, otpNum, req, res);
        console.log("Mail Sent Status: " + sendMail);
        if(sendMail){
            return res.status(200).send({message: "OTP sent successfully!"}); 
        }
        else {
            return res.status(400).send({message: "OTP sending failed!"});
        }
    })
    .catch((err) => {
        return res.status(500).send({
            message: err.message || "Some error occurred while otp processing."
        });
    }
    );
}


function GenerateRandom()
{
   var a = Math.floor((Math.random() * 999999) + 99999);
   a = String(a);
   return a = a.substring(0, 6);
}


function sendOtpMail(emailId, otpNum, req, res)
{
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'srinimcci@gmail.com',
            pass: 'Srini@Mcci21'
        }
    });

    var mailOptions = {
        from: 'srinimcci@gmail.com',
        //to: 'seenivasanv@mcci.com',
        to: emailId,
        subject: 'Test mail from Node.js',
        text: 'Your OTP for DNC login is '+ otpNum
    };
    
    try{
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                return res.status(400).send({message: "OTP sending failed!"});
            } else {
                console.log('Email sent: ' + info.response);
                // return res.status(200).send({message: "OTP sent successfully!"});
            }
        });
    }
    catch(err){
        return res.status(400).send({message: "OTP sending failed! \n" + err});
    }    

    return true;
}
