/*############################################################################
# 
# Module: ui.controller.js
#
# Description:
#     Endpoint implementation for User Interface
#
# Copyright notice:
#     This file copyright (c) 2021 by
#
#         MCCI Corporation
#         3520 Krums Corners Road
#         Ithaca, NY  14850
#
#     Released under the MCCI Corporation.
#
# Author:
#     Seenivasan V, MCCI Corporation February 2021
#
# Revision history:
#     V1.0.0 Fri Oct 22 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const Config = require('../models/config.model.js');
const Users = require('../models/user.model.js');
const Clients = require('../models/client.model.js');
const emotps = require('../models/emotp.model.js');

const jwt = require('jsonwebtoken');
const constants = require('../misc/constants');

const validfn = require('../misc/validators.js');

const mongoose = require('mongoose');
const e = require('express');

var crypto = require('crypto'); 
var nodemailer = require('nodemailer');

/* Utility functions */

// Generate random number
function generateRandom()
{
   var a = Math.floor((Math.random() * 999999) + 99999);
   a = String(a);
   return a = a.substring(0, 6);
}

// To send OTP mail
function sendEmail(otpNum, req, res)
{
    var transporter = nodemailer.createTransport({
        host: 'postfix',
        port: 25,
		secure: false,
        tls: {rejectUnauthorized: false},
    });

    var mailOptions = {
        from: 'no-reply@mcci.com',
        to: req.body.email,
        subject: 'Test mail from DNC Server',
        text: 'Your OTP from DNC is '+ otpNum
    };
    
	try{
		transporter.sendMail(mailOptions, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log('Email sent successfully');
			}
        });
		return true;
	}
	catch(err) {
		return res.status(400).send({message: "Send OTP failed"}); 
	}
	
}

// save admin user
function addAdminUserInfo(clientId, req, res) {
	this.salt = crypto.randomBytes(8).toString('hex')
    this.hash = crypto.pbkdf2Sync(req.body.pwd, this.salt,1000, 64, `sha512`).toString(`hex`); 
	
	const user = new Users({
        cid: clientId,
        uname: req.body.uname,
        psalt: this.salt,
        phash: this.hash,
        email: req.body.email,
        level: "2",
        obsolete: "no"
    });
	
	const filter = {"email": req.body.email};
	const update = {"status": "2"};
	Config.findOneAndUpdate(filter, update, { new: true })
	.then(data => {
		user.save()
        .then(data => {
            res.status(200).send({
                message: "Admin signed up successfully!"
            });
        })
		.catch(err => {
            res.status(500).send({
                message: err.message || "Admin signup failed!"
            });
        });	
	})
	.catch(err => {
			res.status(400).send("Admin signup failed");
	});
	
}

// save normal user
function addUserInfo(clientId, req, res) {
	this.salt = crypto.randomBytes(8).toString('hex')
    this.hash = crypto.pbkdf2Sync(req.body.pwd, this.salt,1000, 64, `sha512`).toString(`hex`); 
	
	const user = new Users({
        cid: clientId,
        uname: req.body.uname,
        psalt: this.salt,
        phash: this.hash,
        email: req.body.email,
        level: "1",
        obsolete: false
    });
	
	user.save()
    .then(data => {
		     res.status(200).send("User signed up successfully");
        })
    .catch(err => {
            res.status(500).send({
                message: err.message || "User signup failed!"
            });
        });	
	
}

// update pwd
function updatePassword(req, res) {
	this.salt = crypto.randomBytes(8).toString('hex')
    this.hash = crypto.pbkdf2Sync(req.body.new_pwd, this.salt,1000, 64, `sha512`).toString(`hex`); 
	
	const filter = {"email": {$regex: new RegExp(req.body.email, "ig")}};
    const update = {"psalt": this.salt, "phash": this.hash};
	
	Users.findOneAndUpdate(filter, update, { new: true })
    .then(data => {
        if(!data) {
            return res.status(400).send({
                message: "Invalid email: " +
                req.body.email
            });
        }
		else{
		    res.status(200).send({message: "Password updated successfully!"});	
		}
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while updating password."
        });
    });
}

// Verify OTP message
function verifyOtp(clientId, req, res) {
	
	emotps.find({"email": req.body.email})
	.then(data => {
		if(data.length > 0){
			vFlag = 0;
			for(i=0; i<data.length; i++) {
				var dbsalt = data[i].otpsalt;
                var dbhash = data[i].otphash;
				var rHash = crypto.pbkdf2Sync(req.body.otpnum, dbsalt,100, 16, `sha512`).toString(`hex`);
				
				if(dbhash == rHash && data[i].functionMode == req.body.mode && data[i].status == "non-verified") {
					vFlag = 1;
				}
			}
			
			if(vFlag == 1 && req.body.mode == "asignup") {
				addAdminUserInfo(clientId, req, res);
			}
			else if(vFlag == 1 && req.body.mode == "usignup") {
				addUserInfo(clientId, req, res);
			}
			else if(vFlag == 1 && req.body.mode == "fpwd") {
				updatePassword(req, res);
			}
			else {
				return res.status(400).send({message: "Invalid OTP"});
			}
		}
		else {
			return res.status(400).send({
				message: "Invalid OTP or OTP expired"
			});
		}
	})
	.catch(err => {
		res.status(500).send({
			message: "Error occurred while accessing DB"
		});
	});
}

// Get client id of the client
function getClientId(req, res) {
	var cname = req.body.cname;
	
	Clients.find({"cname": cname})
	.then(data => {
		if(data.length == 1) {
			return data[0].cid;
		}
		else {
			res.status(400).send({
			message: "Invalid client name"
		});
		}
	})
	.catch(err => {
		res.status(400).send({
			message: "Some error occured when accessing DB"
		});
	});
}

// Verify admin user mail and status
function checkAdminConfig(req, res) {
	Config.findOne()
	.then(data => {
		if(data) {
			if(data.status == "0")
            {
                return res.status(400).send({message: "Admin email not configured"})
            }
			else if(data.status == "1" && data.email == req.body.email) {
				return true;
			}
		    else if(data.status == "2") {
				return res.status(400).send({message: "Admin email already configured"})
			}
			else {
				return res.status(400).send({message: "Not admin user"})
			}
		}
		else {
			res.status(400).send({message: "Admin config not done"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Some error occured when accessing DB"});
	});
}

// Token
function sendToken(req,res,level)
{
    const user = req.body.uname;

    jwt.sign({user}, constants.KEY_SECRET, {expiresIn: '60s'}, (err, token) => {
            if(token)
            {
                var resdict = {};
                
                resdict["token"] = token;
				resdict["level"] = level;
                res.status(200).send(resdict); 
            }
            else
            {
                res.status(400).send({message: "Token creation failed"});
            }
    });
}

/* API functions */

exports.updtaeorg = (req, res) => {
    if(!req.body.aemail || !req.body.aorg) {
        return res.status(400).send({
            message: "Email and Org can not be empty"
        });
    }

    var [resb, rest] = validfn.emailvalidation(req.body.aemail)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email "+rest}); 
    }

    [resb, rest] = validfn.lengthvalidation(req.body.aorg)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Org "+rest}); 
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
                var update = {"email": req.body.aemail, "org": req.body.aorg}
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
                        message: err.message || "Error occurred while updating admin data."
                    });
                });
            }
            
        }
        else
        {
            cdict = {}
            cdict["email"] = req.body.aemail
            cdict["org"] = req.body.aorg
            cdict["status"] = "1"
            const config = new Config(cdict);
            config.save()
            .then(data => {
                res.status(200).send(data);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Error occurred while configuring admin data."
                });
            });   
        }

    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while reading the config."
        });
    });  
}

// To get sign-up mode
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
            message: err.message || "Error occurred while reading the config."
        });
    });  

}

// To send OTP through mail
exports.sendOtp = async(req, res) => {
	if(!req.body.email || !req.body.uname) {
        return res.status(400).send({
            message: "Email Id and Username are required"
        });
    }
	
	const [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email " + rest}); 
    }
	
	var currentDate = new Date();
	
	var otpNum = generateRandom();
	var sOtp = String(otpNum);
	this.salt = crypto.randomBytes(8).toString('hex')
    this.hash = crypto.pbkdf2Sync(sOtp, this.salt,100, 16, `sha512`).toString(`hex`); 

    const emotp = new emotps({
        uname: req.body.uname,
        email: req.body.email,
        otpsalt: this.salt,
        otphash: this.hash,
        functionMode: req.body.mode,
        status: "non-verified",
        tvalid: currentDate
    });
	
	await sendEmail(otpNum, req, res);
	
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

// Admin sign-up
exports.asignup = async(req, res) => {
	if(!req.body.cname || !req.body.uname || !req.body.pwd || !req.body.email || !req.body.otpnum) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
	
	// email validation
	var [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email " + rest}); 
    }
	
    Config.findOne()
	.then(data => {
		if(data) {
			if(data.status == "0")
            {
                return res.status(400).send({message: "Admin email not configured"})
            }
			else 
            if(data.status == "1") 
            {
				if( data.email == req.body.email && data.org == req.body.cname)
                {
                    verifyOtp("0000", req, res);
                }
                else
                {
                    return res.status(400).send({message: "Admin data not match with the record"})
                }
            }
		    else if(data.status == "2") {
				return res.status(400).send({message: "Admin email already configured"})
			}
			else {
				return res.status(400).send({message: "Not an admin user"})
			}
		}
		else {
			res.status(400).send({message: "Admin config not done"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error occured while accessing DB"});
	});
	
}

// User sign-up
exports.usignup = (req, res) => {
	if(!req.body.cname || !req.body.uname || !req.body.pwd || !req.body.email || !req.body.otpnum) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
	
	// email validation
	const [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email " + rest}); 
    }
	
	// email verify in user table
	Users.find({ $or: [{"uname": req.body.uname}, {"email": req.body.email}]})
	.then(data => {
		if(data.length > 0) {
			res.status(400).send({message: "User already exists"});
		}
		else {
			Clients.find({"cname": req.body.cname})
	        .then(data => {
		        if(data.length == 1) {
			        var clientId = data[0].cid;
				    verifyOtp(clientId, req, res);
		        }
		        else {
			        res.status(400).send({
			                message: "Invalid client name"
		                });
		        }
	        })
	        .catch(err => {
		            res.status(400).send({
			            message: "Error occured while accessing DB"
		            });
	        });
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error occured while accessing DB"});
	});
	
}

// List user
exports.listuser = (req, res) => {
	Users.find({obsolete: {$eq: false}})
	.then(data => {
		if(data) {
			res.status(200).send(data);
		}
		else {
			res.status(400).send({message: "User not found"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing DB"});
	});
}

// Update user
exports.updateuser = (req, res) => {
    if(!req.params.uname || !req.body.email || 
        (!req.body.pwd && !req.body.email_new)){
         return res.status(400).send({
             message: "mandatory field missing"
         });
    }

    const filter = {"uname": {$regex: new RegExp(req.params.uname, "ig")}, 
                    "email": {$regex: new RegExp(req.body.email, "ig")}};
    
    var update = {};
    if(req.body.pwd)
    {
        var [resb, rest] = validfn.pwdvalidation(req.body.pwd)
        if(!Boolean(resb))
        {
            return res.status(400).send({message: "Password "+rest}); 
        }        

        this.salt = crypto.randomBytes(16).toString('hex');
        this.hash = crypto.pbkdf2Sync(req.body.pwd, this.salt,1000, 64,
                                      `sha512`).toString(`hex`); 
        update["psalt"] = this.salt;
        update["phash"] = this.hash;
    }
    if(req.body.email_new)
    {
        var [resb, rest] = validfn.emailvalidation(req.body.email_new)
        if(!Boolean(resb))
        {
            return res.status(400).send({message: "Email ID "+rest}); 
        }

        update["email"] = req.body.email_new;
    }
    
    Users.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
    .then(data => {
        if(!data) {
            return res.status(400).send({
                message: req.params.uname+" not found with the email " +
                req.body.email
            });
        }
		else {
			res.status(200).send({message: "User "+req.params.uname+
                             " updated successfully!"});
		}
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while retrieving users."
        });
    });
}

// Delete user
exports.deleteuser = (req, res) => {
    if(!req.body.email){
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
    
    const filter = {"uname": {$regex: new RegExp(req.params.uname, "ig")},
		"email": {$regex: new RegExp(req.body.email, "ig")}};
    const update = {"obsolete": true};
	
    Users.findOneAndUpdate(filter, update, { new: true })
    .then(data => {
        if(!data) {
            return res.status(400).send({
                message: "User not found with the email " +
                req.body.email
            });
        }
		else{
		    res.status(200).send({message: "User "+ req.params.uname +" deleted successfully!"});	
		}
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while retrieving users."
        });
    });
};

// Forgot password
exports.forgotpwd = (req, res) => {
	if(!req.body.email || !req.body.new_pwd || !req.body.otpnum || !req.body.mode){
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
	
	// email validation
	var [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email " + rest}); 
    }
	
	if(req.body.new_pwd)
    {
        var [resb, rest] = validfn.pwdvalidation(req.body.new_pwd)
        if(!Boolean(resb))
        {
            return res.status(400).send({message: "Password "+rest}); 
        }
	}
	 
	var clientId = "dummy";
	verifyOtp(clientId, req, res);
}

// Login
exports.uiLogin = (req, res) => {
	if(!req.body.uname || !req.body.pwd){
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
	
	var username = {"uname" : req.body.uname};
    var pwd = {"pwd" : req.body.pwd};
	
	Users.findOne(username)
    .then(function(data) {
		if(data && data.obsolete === false){
			var dbsalt = data.psalt
            var dbhash = data.phash
            var level = data.level
			
			this.hash = crypto.pbkdf2Sync(req.body.pwd, dbsalt,1000, 64, `sha512`).toString(`hex`);
			
			if(this.hash == dbhash) {
				sendToken(req, res, level);
			}
			else {
				res.status(400).send({
                    message: "Invalid username/password"
                });
			}
		}
		else{
			res.status(400).send({
                message: "User not exists"
            });
		}
	})
	.catch(err => {
		res.status(500).send({
            message: err.message || "Error occurred while accessing DB."
        });
	});
}

// OTP for forgot password
exports.fpSendOtp = async(req, res) => {
	if(!req.body.email || !req.body.mode){
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
	
	// email validation
	const [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email " + rest}); 
    }
	
	var username = '';
	var currentDate = new Date();
	var otpNum = generateRandom();
	var sOtp = String(otpNum);
	this.salt = crypto.randomBytes(8).toString('hex')
    this.hash = crypto.pbkdf2Sync(sOtp, this.salt,100, 16, `sha512`).toString(`hex`);
	
	Users.find({"email": req.body.email})
	.then(data => {
		if(data.length == 1) {
			username = data[0].uname;
			
			try{
				sendEmail(sOtp, req, res);
			}
			catch(err){
				return res.status(500).send({
                    message: err.message || "OTP sending failed!"
                });
			}
			
			
			const emotp = new emotps({
                uname: username,
                email: req.body.email,
                otpsalt: this.salt,
                otphash: this.hash,
                functionMode: req.body.mode,
                status: "non-verified",
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
		else {
			return res.status(400).send({
                message: "Email Id not exist. Please sign up"
            });
		}
	})
	.catch(err => {
		res.status(500).send({
            message: err.message || "Error occurred while accessing DB."
        });
	});
}