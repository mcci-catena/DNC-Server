const Config = require('../models/config.model.js');
const Users = require('../models/user.model.js');
const Clients = require('../models/client.model.js');
const otplogs = require('../models/otplog.model.js');
const emotps = require('../models/emotp.model.js');

const validfn = require('../misc/validators.js');

const mongoose = require('mongoose');
const e = require('express');

var crypto = require('crypto'); 
var nodemailer = require('nodemailer');


// Update admin Email in config record
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


// General signup request from UI
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


// Admin user signup
exports.asignup = (req, res) => {
    // Check fields are not empty
    if(!req.body.email || !req.body.oname || !req.body.uname || !req.body.pwd) {
        return res.status(400).send({
            message: "Field can not be empty"
        });
    }

    // Check OTP field received for verification
    if(!req.body.otp){
        return res.status(400).send({
            message: "OTP required to verify account"
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


// General user signup
/*exports.usignup = (req, res) => {
    res.status(200).send({message: "Sorry, not implemented"})    
} */

// Create and Save a new User
exports.usignup = (req, res) => {
    if(!req.body.cname ||!req.body.uname || !req.body.pwd || 
       !req.body.email){
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var [resb, rest] = validfn.inputvalidation(req.body.uname)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "User name "+rest}); 
    }

    [resb, rest] = validfn.pwdvalidation(req.body.pwd)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Password "+rest}); 
    }

    [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email ID "+rest}); 
    }

    const update = {"cname": req.body.cname, "uname": req.body.uname, "pwd": req.body.pwd, 
                     "email": req.body.email }

    var clientname = {"cname" : {$regex: new RegExp(req.body.cname, "ig")}};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var clientid = data.cid
            var filter = {"uname": {$regex: new RegExp(req.body.uname, "ig")}}
            CheckForExistance(filter, res, "User name")
            .then(function(data) { 
                if(data == 0)
                {
                    var email = {"email": {$regex: new RegExp(req.body.email, "ig")}};
                    CheckForExistance(email, res, "Email Id")
                    .then(function(data) {
                        if(data == 0)
                        {
                            CreateUserAccount(clientid,req,res);
                        }
                    });
                       }     
               });        
        }
        else
        {
            return res.status(400).send({
                message: "Client id is not valid"
            });
        }
    })
    .catch((err) => {
        console.log("Client Read Error", err)
    })
};


exports.checkSendOtp = (req, res) => {
    if(!req.body.email || !req.body.uname || !req.body.oname || !req.body.purpose) {
        return res.status(400).send({
            message: "Fields are required: EmailID, UserName, OrgName, Purpose"
        });
    }

    // Check the Admin account statua
    Config.find()
    .then(async function(data){
        if(data)
        {
            //res.status(200).send(data);
            if(data[0].status == "0")
            {
                res.status(200).send({message: "Admin Email not configured"});
            }
            else
            if(data[0].status == "1")
            {
                //Admin account not created, checking the given email match with the record;
                if(data[0].email == req.body.email)
                {
                    //Admin Email matching OK, next generate and send OTP to that email
                    const otpNum = GenerateRandom();
                    await SendEmailOtp(req, otpNum, res)
                    PushOtpInDb(req, otpNum, res)
                    //res.status(200).send({message: "OTP Sent Successfully!"});
                }
                else
                {
                    res.status(200).send({message: "Email Not match with the record"});
                }
            }
            else
            {
                // General User Signup
                res.status(200).send({message: "Admin account OK"});
            }
        }
        else
        {
            res.status(200).send({message: "Document not created"});
        }
    })
    .catch((err) => {
        return res.status(500).send({
            message: err.message || "Error occurred while reading the Config."
        });
    });
};



async function SendEmailOtp(req, otpNum, res)
{
    try{
        await SendEmail(req.body.email, otpNum)
        return
    }catch(err)
    {
        res.status(200).send({message: "OTP Sending failed!"});
    }
}


function PushOtpInDb(req, otpNum, res)
{
    var currentDate = new Date();
    currentDate.setMinutes(currentDate.getMinutes() + 30);
    console.log("Current Date: ", currentDate)

    this.salt = crypto.randomBytes(8).toString('hex')
    this.hash = crypto.pbkdf2Sync(otpNum, this.salt,100, 16, `sha512`).toString(`hex`); 

    const emotp = new emotps({
        uname: req.body.uname,
        email: req.body.email,
        otpsalt: this.salt,
        otphash: this.hash,
        function: "signup",
        status: "0",
        tvalid: currentDate
    });

    emotp.save()
    .then(data => {
        res.status(200).send({
            message: "OTP Sent Successfully!"
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "OTP Process failed!"
        });
    });   
}

// Send OTP to mail id
exports.sendOtpSiva = (req, res) => {
    // check req.body has required fields
    if(!req.body.email) {
        return res.status(400).send({
            message: "Required field not found: EmailID"
        });
    }

    if(!req.body.uname) {
        return res.status(400).send({
            message: "Required field not found: User Name"
        });
    }

    if(!req.body.purpose) {
        return res.status(400).send({
            message: "Required field not found: Purpose"
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

function CheckForExistance(reqFilter, res, dataId)
{
    return new Promise(function(resolve, reject) {

       Users.countDocuments(reqFilter,function(err, count){
       if(err)
       {
           reject(2);
           return res.status(400).send({
             message: "connection error!!!"
           });
       }
       if(count > 0)
       {
           resolve(1)
              return res.status(400).send({
              message: ""+dataId+" already exists, try with another!!!"
           });
       }
       else{
           resolve(0);
       }
     });

    });
}

// Send OTP through Email
exports.verifyAuth = (req, res) => {
    if(!req.body.email ||!req.body.oauth ){
        return res.status(400).send({
            message: "Email or Auth code missing"
        });
    }

    if(req.body.oauth == "173813")
    {
        return res.status(200).send({message: "Auth Success"});  
    }
    else{
        return res.status(400).send({message: "Auth failed"}); 
    }

}

exports.testApi = (req, res) => {
    // Config.find({email: {$eq: req.body.email}})
    // .then(function(data){
    //     if(data[0].status == "0"){
    //         return res.status(200).send({message: data}); 
    //     }
    //     else{
    //         return res.status(400).send({message: "No data"}); 
    //     }
    // })
    // .catch((err) => {
    //     return res.status(400).send({message: "Error in DB operation"}); 
    // });

    // otplogs.find({email: req.body.email})
    // .then(function(data){
    //     return res.status(200).send({message: data}); 
    // })
    // .catch((err) => {
    //     return res.status(400).send({message: "Error in DB operation" + err}); 
    // })

    const client = new Clients({
        cname: "testclient2",
        cid: "1113",
        dbdata: {},
        taglist: []
    });

    client.save()
        .then(function(data){
            console.log("Query Result: " + data);
            return res.status(200).send({message: "Client data inserted.\n" + data});
        })
        .catch((err) => {
            return res.status(400).send({message: "Error in DB operation" + err}); 
        });
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


function GenerateRandom()
{
   var a = Math.floor((Math.random() * 999999) + 99999);
   a = String(a);
   return a = a.substring(0, 6);
}


function SendEmail(emailId, otpNum)
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
    return transporter.sendMail(mailOptions)
}