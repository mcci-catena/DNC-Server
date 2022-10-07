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
const Invites = require('../models/invitelog.model.js')

const jwt = require('jsonwebtoken');
const constants = require('../misc/constants');

const validfn = require('../misc/validators.js');
const emailer = require('../misc/email')
const htmlbody = require('../misc/htmldata')

const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false); 

const e = require('express');

var crypto = require('crypto'); 
var nodemailer = require('nodemailer');

const otpmail = require('../misc/email')

/* Utility functions */

// Generate random number
function generateRandom()
{
   var a = Math.floor((Math.random() * 999999) + 99999);
   a = String(a);
   return a = a.substring(0, 6);
}

function updateInviteLog(indict){
    // Update Invite record
    console.log("Going to update Invite Record: ", indict)

    const filter = {$and:[{"cname": indict.cname},{"email": indict.email}]}
    const update = {"isUsed": true};
    Invites.findOneAndUpdate(filter, update, { new: true })
    .then(data=>{
        console.log("Invite update success: ", data)
    })
    .catch(err=>{
        console.log("Error while update Invitation: ", err)
    })
    
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
        obsolete: false
    });
	
	const filter = {"email": req.body.email};
	const update = {"status": "3"};
	Config.findOneAndUpdate(filter, update, { new: true })
	.then(data => {
		user.save()
        .then(data => {
            res.status(200).send({
                message: "Admin signed up successfully!"
            });
            let outdict = {}
            outdict["cname"] = req.body.cname
            outdict["email"] = req.body.email
            updateInviteLog(outdict)
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

    Users.find({$and:[{$or: [{"uname": req.body.uname}, {"email": req.body.email}]},{obsolete: {$eq: true}}]})
	.then(data => {
        if(data.length > 0)
        {
            const filter = {"email": req.body.email, "obsolete": true}
            const update = {"cid": clientId, "uname": req.body.uname, "psalt":this.salt, "phash": this.hash, "obsolete": false}
            Users.findOneAndUpdate(filter, update, {new: true})
            .then(data => {
                if(data)
                {
                    res.status(200).send("User signed up successfully");
                }
                else{
                    res.status(200).send("User sign up failed, contact admin");
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while adding user"
                });
            })
        }
        else
        {
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
                let outdict = {}
                outdict["cname"] = req.body.cname
                outdict["email"] = req.body.email
                updateInviteLog(outdict)
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "User signup failed!"
                });
            });
        }
    })
	.catch(err => {
		res.status(500).send({message: "Error occured while accessing DB"});
	})
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


// Token
function sendToken(req,res,level)
{
    const user = req.body.uname;

    jwt.sign({user}, constants.KEY_SECRET, {expiresIn: '1800s'}, (err, token) => {
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
            if(data.status == "3")  // earlier it was 2
            {
                res.status(200).send({message: "Admin account already created"})
            }
            else
            {
                var update = {"email": req.body.aemail, "org": req.body.aorg, "status": "2"}
                Config.findOneAndUpdate(update)
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
            cdict["status"] = "2"
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


exports.signup = (req, res) => {
    if(!req.body.cname || !req.body.uname || !req.body.pwd || !req.body.email) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    console.log("Entering into Signup ...")
	
	// email validation
	const [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email " + rest}); 
    }


    Invites.find({$and:[{"cname": req.body.cname},{"email": req.body.email}, {"isUsed": false}]})
    .then(data => {
        if(data.length == 0){
            // Forbidden for whome invitation not sent
            return res.status(403).send({message: "Couldn't find valid signup invitation for your request."})
        }
        else{
            console.log("Is Admin Status: ", data)
            console.log(typeof(data[0].cname))
            console.log(typeof(data[0].isAdmin))
            if(data[0].isAdmin == true){
                // Admin Signup request
                console.log("This is Admin Signup request")
                addAdminUserInfo("0000", req, res);
            }
            else{
                // General User Signup request
                console.log("This is User Signup request")
                Clients.find({"cname": req.body.cname})
	            .then(data => {
		            if(data.length == 1) {
			            var clientId = data[0].cid;
				        addUserInfo(clientId, req, res);
                    }
                    else {
                        res.status(400).send({
                            message: "Invalid client name"
                        });
                    }
                })
                .catch(err => {
                    res.status(400).send({
                        message: "Error occured while accessing Client record"
                    });
                });
            }
        }
    })
    .catch(err => {
        res.status(500).send({
            message: "Error occurred while accessing Invite Log"
        });
    })
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
	
	await otpmail.sendOTPmail(otpNum, req, res);
    
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
				otpmail.sendOTPmail(sOtp, req, res);
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


// To send invite to Admin signup

exports.sendAinvite = async(req, res) => {
    Config.findOne()
    .then(function(data) {
        if(data){
            if(data.status == "2"){
                let htmld = htmlbody.constructHtml(data.org, data.email)
                emailer.sendEmail(data.email, htmld)
                .then(function(edata){
                    Invites.find({$and:[{"cname": data.org},{"email": data.email}]})
                    .then(function(invdata){
                        if(invdata.length == 0){
                            console.log("Before Log Invite: ", data.org, data.email)
                            const invite = new Invites({
                                cname: data.org,
                                email: data.email,
                                isAdmin: true,
                                isUsed: false
                            });
                            invite.save()
                            .then(data => {
                                console.log("Inv Logged: ", data)
                                res.status(200).send({
                                    message: "SignUp link sent successfully"
                                });
                            })
                            .catch(err => {
                                res.status(500).send({
                                    message: "Invite Log Failed!, try again"
                                });
                            })
                        }
                        else{
                            console.log(invdata)
                            res.status(200).send({
                                message: "SignUp link sent successfully"
                            });
                        }
                    })
                    .catch(err=>{
                        console.log("Error in Accessing Invite Rec: ", err)
                        res.status(500).send({message: "Issues in Accessing Invite record"})
                    })
                })
                .catch(err=>{
                    // console.log("Error in Email Sending: ", err)
                    res.status(500).send({message: "Issues in sending of Email"})
                })
            }
            else{
                if(data.status == "1"){
                    res.status(200).send({message: "Admin Email not configured!"})
                }
                else
                if(data.status == "3"){
                    res.status(200).send({message: "Admin account already created"})
                }
            }
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while reading the config."
        });
    });
}

// Send User Invite through mail
exports.sendInvite = async(req, res) => {
	if(!req.body.cname || !req.body.email) {
        return res.status(400).send({
            message: "Client name and Email ID are required"
        });
    }

    // email validation
	var [resb, rest] = validfn.emailvalidation(req.body.email)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Email " + rest}); 
    }

    console.log(req.body.cname, req.body.email)

    var filter = {"cname": {$regex: new RegExp(req.body.cname, "ig")}}
    Clients.findOne(filter)
    .then(function(data) {
        if(data)
        {
            Invites.find({$and:[{"cname": req.body.cname},{"email": req.body.email}]})
            .then(function(data){
                if(data.length == 0){
                    let htmld = htmlbody.constructHtml(req.body.cname, req.body.email)
                    emailer.sendEmail(req.body.email, htmld)
                    .then(data => {
                         const invite = new Invites({
                            cname: req.body.cname,
                            email: req.body.email,
                            isAdmin: false,
                            isUsed: false
                        });
                        invite.save()
                        .then(data => {
                            res.status(200).send({
                                message: "SignUp link sent successfully"
                            });
                        })
                        .catch(err => {
                            console.log(err)
                            res.status(500).send({
                                message: "Invite Log Failed!"
                            });
                        })
                    })
                    .catch(err => {
                        console.log("Error in Email Sending: ", err)
                        res.status(500).send({message: "Issues in sending of Email"})
                    });
                }
                else{
                    console.log("Invitation Data: ", data)
                    let htmld = htmlbody.constructHtml(req.body.cname, req.body.email)
                    emailer.sendEmail(req.body.email, htmld)
                    .then(data => {
                        res.status(200).send({
                            message: "SignUp link sent successfully"
                        });
                    })
                    .catch(err => {
                        console.log("Error in Email Sending: ", err)
                        res.status(500).send({message: "Issues in sending of Email"})
                    })
                }
            })
            .catch(err => {
                console.log(err)
                res.status(500).send({
                    message: "Error occurred while accessing Client record"
                });
            })
       }
        else{
            return res.status(400).send({message: "Client doesn't exists!"})
        }
    })
    .catch(err => {
        console.log(err)
		res.status(500).send({
            message: "Error occurred while accessing Client record"
        });
	});
}