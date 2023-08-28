/*############################################################################
# 
# Module: user.controller.js
#
# Description:
#     Route for Manage User API
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
#     V2.0.0 Thu Mar 02 2023 17:51:21 seenivasan
#       Module created
############################################################################*/

const adminconst = require('../config/envdata')
const Config = require('../models/config.model')
const Custom = require('../models/custom.model')
const Users = require('../models/user.model.js');
const Invites = require('../models/invitelog.model')
const Turl = require('../models/turl.model')

const Orgs = require('../models/org.model.js');

const validfn = require('../misc/validators');
const emailer = require('../misc/email')
const htmlbody = require('../misc/htmldata')

const htmllink = require('../misc/htmllink')

var crypto = require('crypto'); 
const jwt = require('jsonwebtoken');
const constants = require('../misc/constants');

const appenv = require('../config/envdata')

const {SESSION_TIMEOUT} = {... appenv.envobj}



/* API endpoint functions */

exports.updtaeorg = (req, res) => {
    if(!req.body.acode || !req.body.aemail || !req.body.aorg) {
        return res.status(400).send({
            message: "Provide required input fields (acode, aemail, aorg)"
        });
    }

    const acode = adminconst.envobj.FIRST_ADMIN_CODE

    if(acode != req.body.acode){
        return res.status(400).send({
            message: "Provide a valid admin code!"
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


exports.updtcconfig = (req, res) => {
    if(!req.body.mccode || !req.body.ccode || !req.body.cparams) {
        return res.status(400).send({
            message: "Provide required input fields (acode, aemail, aorg)"
        });
    }

    const mccode = adminconst.envobj.FIRST_CUSTOM_CODE

    if(mccode != req.body.mccode){
        return res.status(400).send({
            message: "Provide a valid custom code!"
        });
    }

    const custom = new Custom({
        ccode: req.body.ccode,
        cparams: req.body.cparams
    });
    custom.save()
    .then(data => {
        res.status(200).send({message: "Custom data configured successfully"});
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Custom data creation failed!"
        });
    });
}

// To send invite to Admin signup

exports.sendAinvite = async(req, res) => {
    Config.findOne()
    .then(function(data) {
        if(data){
            if(data.status == "2"){
                let fncode = "nusu", role = "4", email = data.email
                const filter = {$and:[{"fcode": fncode},{"email": email}, {"used": false}]}
                Turl.findOne(filter)
                .then(data => {
                    console.log(" After read Turl")
                    this.salt = crypto.randomBytes(8).toString('hex')
                    this.hash = crypto.pbkdf2Sync(email, this.salt,1000, 64, `sha512`).toString('hex');
                    if(data == null){
                        console.log(" turl fresh")
                        const turl = new Turl({
                            email: email,
                            expires: new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
                            url: this.hash,
                            fcode: fncode,
                            role: role,
                            used: false
                        });
                        turl.save()
                        .then(data => {
                            let htmld = htmllink.constructHtml(data.url, email, fncode)
                            emailer.sendEmail(email, htmld)
                            res.status(200).send({message: "Email Link sent successfully"});
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: err.message || "Link creation failed!"
                            });
                        });
                    }
                    else{
                        const exptime = data.expires.valueOf()
                        const currenttime = new Date().valueOf()
                        if(currenttime < exptime){
                            let htmld = htmllink.constructHtml(data.url, email, fncode)
                            emailer.sendEmail(email, htmld)
                            return res.status(400).send({
                                message: "Email Link already Sent"
                            });
                        }
                        else{
                            console.log("Old link expired, send new one")
                            const update = {"expires": new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000),
                                            "url": this.hash, "role": role }            
                            Turl.findOneAndUpdate(filter, update, { new: true })
                            .then(data => {
                                let htmld = htmllink.constructHtml(this.hash, email, fncode)
                                emailer.sendEmail(email, htmld)
                                res.status(200).send({message: "Old Link expired, new link sent"});    
                            })
                            .catch(err => {
                                res.status(500).send({
                                    message: err.message || "Error occured while accessing DB"
                                });
                            });
                        }
                    }
                })
                .catch(err => {
                    res.status(500).send({message: err.message || "Error occured while accessing DB"});
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
        else{
            res.status(400).send({
                message: "No record founds in config"
            });
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while reading the config"
        });
    });
}


// To send SignUp / Forgot password Link

exports.sendElink = (req, res) => {

    if(!req.body.fcode || !req.body.email) {
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    let fncode = req.body.fcode
    
    if(fncode == "nusu" || fncode == "fgpw"){

        let role = req.body.role ? req.body.role: "0"
    
        const filter = {$and:[{"fcode": fncode},{"email": req.body.email}, {"used": false}]}
        Turl.findOne(filter)
        .then(data => {
            this.salt = crypto.randomBytes(8).toString('hex')
            this.hash = crypto.pbkdf2Sync(req.body.email, this.salt,1000, 64, `sha512`).toString('hex');
            if(data == null){
                const turl = new Turl({
                    email: req.body.email,
                    expires: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
                    url: this.hash,
                    fcode: fncode,
                    role: role,
                    used: false
                });

                turl.save()
                .then(data => {
                    let htmld = htmllink.constructHtml(data.url, data.email, fncode)
                    emailer.sendEmail(data.email, htmld)
                    res.status(200).send({message: "Email Link sent successfully"});
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Link creation failed!"
                    });
                });
            }
            else{
                const exptime = data.expires.valueOf()
                const currenttime = new Date().valueOf()
                if(currenttime < exptime){
                    let htmld = htmllink.constructHtml(data.url, data.email, fncode)
                    emailer.sendEmail(data.email, htmld)
                    return res.status(400).send({
                        message: "Email Link already Sent"
                    });
                }
                else{
                    console.log("Old link expired, send new one")
                    const update = {"expires": new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
                        "url": this.hash, "role": role               
                    };
                    Turl.findOneAndUpdate(filter, update, { new: true })
                    .then(data => {
                        let htmld = htmllink.constructHtml(this.hash, data.email, fncode)
                        emailer.sendEmail(data.email, htmld)
                        res.status(200).send({message: "Old Link expired, new link sent"});    
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Error occured while accessing DB"
                        });
                    });
                }
            }
        })
        .catch(err => {
            res.status(500).send({message: err.message || "Error occured while accessing DB"});
        })
    }
    else{
        return res.status(400).send({
            message: "Invalid function code"
        });
    }
}

// To send SignUp / Forgot password Link
exports.signUp = (req, res) => {
    if(!req.body.turl || !req.body.email || !req.body.uname 
        || !req.body.pwd){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }
    addNewUser(req, res)
}

exports.forgotpwd = (req, res)=>{
    console.log("FGPWD: ", req)
    if(!req.body.turl || !req.body.email || !req.body.pwd){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }
    setPassword(req, res)
}


// Utility functions
function GenerateRandom()
{
   var a = Math.floor((Math.random() * 9999) + 999);
   a = String(a);
   return a = a.substring(0, 4);
}


function updateTurl(indict){
    const filter = {$and:[{"email": indict.email},{"url": indict.turl},{"fcode": indict.fcode}]}
    const update = {"used": true};
    Turl.findOneAndUpdate(filter, update, { new: true })
    .then(data=>{
        console.log("Link update success: ", data)
    })
    .catch(err=>{
        console.log("Error while update Link: ", err)
    })
}


function checkUrlValid(indict){
    return new Promise(function(resolve, reject) {
        const filter = {$and:[{"fcode": indict.fcode},{"email": indict.email}, 
                          {"used": indict.used}, {"url": indict.url}]}
        Turl.findOne(filter)
        .then(data => {
            if(data == null){
                console.log("URL not Found")
                reject("Invalid URL")
            }
            else{
                const exptime = data.expires.valueOf()
                const currenttime = new Date().valueOf()
                if(currenttime < exptime){
                    resolve("url found")
                }
                else{
                    console.log("URL Expired")
                    reject("url expired")
                }
            }
        })
        .catch(err => {
            console.log("URL Access Error")
            reject("url access error")
        })
    })
    
}

function changePassword(req, res){
    this.salt = crypto.randomBytes(8).toString('hex')
    this.hash = crypto.pbkdf2Sync(req.body.pwd, this.salt,1000, 64, `sha512`).toString(`hex`);
    
    const filter = {"email": {$regex: new RegExp(req.body.email, "ig")}};

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

    console.log("Find One and update: ", filter, update)
    Users.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
    .then(data => {
        if(!data) {
            return res.status(400).send({
                message: req.body.email+" not found in the record " 
            });
        }
		else {
			res.status(200).send({message: "User associated with the "+req.body.email+
                             " updated successfully!"});
		}
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while retrieving user."
        });
    });
}

function addUser(req, res, role){
    this.salt = crypto.randomBytes(8).toString('hex')
    this.hash = crypto.pbkdf2Sync(req.body.pwd, this.salt,1000, 64, `sha512`).toString(`hex`); 

    Users.find({$and:[{$or: [{"uname": req.body.uname}, {"email": req.body.email}]},{obsolete: {$eq: true}}]})
	.then(data => {
        if(data.length > 0)
        {
            res.status(400).send({
                message: "User already exists!"
            });
        }
        else
        {
            const user = new Users({
                uid: GenerateRandom(),
                name: req.body.uname,
                psalt: this.salt,
                phash: this.hash,
                email: req.body.email,
                firstName: req.body.firstName ? req.body.firstName: null,
                lastName: req.body.lastName ? req.body.lastName: null,
                role: role,
                status: "Active",
                obsolete: false,
                firstLogin: null,
                validtill: null,
                lastLogin: {"login": null, "logout": null}
            });
            
            user.save()
            .then(data => {
                res.status(200).send({message: "User signed up successfully"});
                let outdict = {}
                outdict["email"] = req.body.email
                outdict["turl"] = req.body.turl
                outdict["fcode"] = "nusu"
                updateTurl(outdict)
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


// Add new User
async function addNewUser(req, res) {
    const indict = {}
    indict["fcode"] = "nusu"
    indict["url"] = req.body.turl
    indict["email"] = req.body.email
    indict["used"] = false

    try{
        const turlresp = await checkUrlValid(indict)

        if(turlresp == "url found"){
            Turl.findOne(indict)
            .then(data => {
                if(data != null){
                    addUser(req, res, data.role)
                }
                else{
                    res.status(400).send({
                        message: "Signup url token not found"
                    });
                }
            })
            .catch(err => {
                res.status(400).send({
                    message: "Error in accessing signup url token"
                });
            })
        }
        else{
            res.status(400).send({
                message: turlresp || "Signup failed"
            });
        }
    }
    catch(error){
        res.status(400).send({
            message: "Signup failed"
        });
    }
}

// Forgot password 
async function setPassword(req, res) {
    const indict = {}
    indict["fcode"] = "fgpw"
    indict["url"] = req.body.turl
    indict["email"] = req.body.email
    indict["used"] = false

    try{
        const turlresp = await checkUrlValid(indict)

        if(turlresp == "url found"){
            changePassword(req, res)
            let outdict = {}
                outdict["email"] = req.body.email
                outdict["turl"] = req.body.turl
                outdict["fcode"] = "fgpw"
                updateTurl(outdict)
        }
        else{
            res.status(400).send({
                message: turlresp || "Password reset failed"
            });
        }
    }
    catch(error){
        res.status(400).send({
            message: error || "Password reset failed"
        });
    }
    
}


// Token
function sendToken(req,res,udata)
{
    const user = {user: udata.user, level: udata.level};

    // jwt.sign({user}, constants.KEY_SECRET, {expiresIn: '1800s'}, (err, token) => {

    jwt.sign({user}, constants.KEY_SECRET, {expiresIn: '36000s'}, (err, token) => {

    // jwt.sign({user}, constants.KEY_SECRET, {expiresIn: ''+SESSION_TIMEOUT+'s'}, (err, token) => {
            if(token)
            {
                var resdict = {};
                
                resdict["token"] = token;
				resdict["udata"] = udata;
                res.status(200).send(resdict); 
            }
            else
            {
                res.status(400).send({message: "Token creation failed"});
            }
    });
}


function updateLogin(username, firstlogin, lastlogin){
    return new Promise(function(resolve, reject) {
        const filter = {"name": username}
        // var logindt = new Date("<YYYY-mm-ddTHH:MM:ss>")
        var logindt = new Date()
        const update = {"lastLogin": {"login": logindt, "logout": lastlogin.logout}}

        console.log("Update Login")
        console.log(filter)
        console.log(update)

        if (firstlogin == null){
            update["firstLogin"] = logindt
        }

        Users.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
        .then(data => {
            if(data == null){
                console.log("User not Found")
                reject("Invalid User")
            }
            else{
                resolve("login update success")
            }
        })
        .catch(err => {
            console.log("Can't access User record")
            reject("can't access user record")
        })
    })
}

function getcconfig(){
    return new Promise(function(resolve, reject) {
        Config.findOne()
        .then(data => {
            if(data) {
                resolve(data.org);
            }
            else {
                reject("Custom not found");
            }
        })
        .catch(err => {
            reject("Error while accessing DB");
        });
    })
}


// Login
exports.userLogin = async(req, res) => {
    if(!req.body.uname || !req.body.pwd){
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
	
	var username = {"name" : req.body.uname};
    var pwd = {"pwd" : req.body.pwd};
	
	Users.findOne(username)
    .then(async function(data) {
		if(data && data.obsolete === false){
			var dbsalt = data.psalt
            var dbhash = data.phash
            var level = data.role
            var firstlogin = data.firstLogin
            var lastlogin = data.lastLogin

            var udata = {}
            udata["user"] = data.name
            udata["level"] = data.role
            udata["email"] = data.email
            udata["firstName"] = data.firstName
            udata["lastName"] = data.lastName
            

            let ccode;
            try{
                ccode = await getcconfig()
            }
            catch(err){
                ccode = 'error'
            }

            udata["ccode"] = ccode
            

            console.log("My CCode:", ccode)
			
			this.hash = crypto.pbkdf2Sync(req.body.pwd, dbsalt,1000, 64, `sha512`).toString(`hex`);
			
			if(this.hash == dbhash) {
                try{
                    let updt = await updateLogin(username.name, firstlogin, lastlogin)
				    sendToken(req, res, udata);
                }catch(error){
                    res.status(400).send({
                        message: error
                    });
                }
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

// List user
exports.listuser = (req, res) => {
    let filter = {}
    if(req.params.uname){
        filter = {$and:[{"name": req.params.uname},{"obsolete": {$eq: false}}]}
    }
    else{
        filter = {obsolete: {$eq: false}}
    }
	Users.find(filter).select({"_id": 0, "psalt": 0, "phash": 0, "obsolete": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
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

exports.updateuser = (req, res) => {
    
    if(! req.body.udata){
        return res.status(400).send({
            message: "Input field missing"
        });
    }

    const filter = {"name": req.params.uname}
    Users.findOne(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
    .then(data => {
        if(data != null){
            let update = {}
            update['name'] = req.body.udata.name ? req.body.udata.name : data.name
            update['firstName'] = req.body.udata.fname ? req.body.udata.fname : data.firstName
            update['lastName'] = req.body.udata.lname ? req.body.udata.lname : data.lastName
            update['email'] = req.body.udata.email ? req.body.udata.email : data.email

            Users.findOneAndUpdate(filter, update, { new: true })
            .then(data => {
                return res.status(200).send({
                    message: "User update success"
                });
                
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Error occurred while retrieving User record"
                });
            });

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

exports.updatePwd = (req, res) => {
    
    const filter = {"name": req.body.user}
    Users.findOne(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
    .then(data => {
        if(data && data.obsolete === false){
			var dbsalt = data.psalt
            var dbhash = data.phash

            this.hash = crypto.pbkdf2Sync(req.body.udata.ecpwd, dbsalt,1000, 64, `sha512`).toString(`hex`);
			
			if(this.hash == dbhash) {
                var update = {}
                var [resb, rest] = validfn.pwdvalidation(req.body.udata.ecpwd)
                if(!Boolean(resb))
                {
                    return res.status(400).send({message: "Password "+rest}); 
                }        

                this.salt = crypto.randomBytes(16).toString('hex');
                this.hash = crypto.pbkdf2Sync(req.body.udata.npwd, this.salt,1000, 64,
                                                `sha512`).toString(`hex`); 
                update["psalt"] = this.salt;
                update["phash"] = this.hash;

                Users.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
                .then(data => {
                    if(!data) {
                        return res.status(400).send({
                            message: req.body.user+" not found in the record" 
                        });
                    }
                    else {
                        res.status(200).send({message: "User "+req.body.user+
                                        " updated successfully!"});
                    }
                })
                .catch(err => {
                    res.status(500).send({
                        message: err.message || "Error occurred while retrieving users."
                    });
                });
            }
            else {
				res.status(400).send({
                    message: "Invalid password"
                });
			}

        }
        else
        {
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

exports.deleteuser = (req, res) => {
    
    if(!req.params.uname || !req.body.user ||
        !req.body.level ){
         return res.status(400).send({
             message: "mandatory field missing"
         });
    }

    if(req.params.uname == req.body.user){
        return res.status(400).send({
            message: "Request for self account not allowed!"
        });
    }

    if(req.body.level != "4"){
        return res.status(400).send({
            message: "This action not allowed for your role"
        });
    }

    var username = {"name" : req.params.uname};
    
	Users.findOne(username)
    .then(async function(data) {
        if(data != null){
            var uid = data.uid

            Orgs.find({users: {$in: uid}})
            .then(function(data){
                if(data.length == 0){
                    const filter = {name: req.params.uname}
                    const update = {"obsolete": true};
                    Users.findOneAndUpdate(filter, update, { new: true })
                    .then(data => {
                        return res.status(200).send({
                            message: "delete success"
                        });
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Error occurred while retrieving users."
                        });
                    });
                }
                else{
                    res.status(400).send({
                        message: "Remove the user from the associated Org"
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Error occurred while accessing Org data"
                });
            });
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

exports.updtRole = (req, res) => {
    if(!req.body.email && !req.body.uname && (req.body.level || req.body.status)){
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    if(req.body.uname == req.user.user.user){
        return res.status(400).send({
            message: "Request for self account not allowed!"
        });
    }

    let filter = {$and:[{"name": req.body.uname}, {"email": req.body.email},{"obsolete": {$eq: false}}]}

    Users.findOne(filter)
    .then(function(data) {
        if(data == null){
            return res.status(400).send({
                message: "User "+req.body.uname+" not found in the record!"
            });
        }
        Users.findOne({"name": req.user.user.user})
        .then(function(data) {
            if(data.role != "4"){
                return res.status(400).send({
                    message: "Only Admin can update the role of other users"
                });
            }
            const filter = {name: req.body.uname}
            const update = {}
            if(req.body.level){
                update["role"] = req.body.level
            }
            if(req.body.status){
                update["status"] = req.body.status
            }
            
            Users.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
            .then(data => {
                if(!data) {
                    return res.status(400).send({
                        message: "User " +
                        req.body.uname+" is not found in the record"
                    });
                }
                else{
                    res.status(200).send({message: "User "+ req.body.uname +" data updated!"});	
                }
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Error occurred while accessing user record."
                });
            });
        })
        .catch(err => {
            console.log(err)
            res.status(500).send({
                message: "Couldn't access the user record"
            });
        });
    })
    .catch(err => {
        console.log(err)
        res.status(500).send({
            message: "Couldn't access the user record"
        });
    });
}

exports.listOrgUser = (req, res) => {
    
    if(!req.params.orgname) {
        return res.status(400).send({
            message: "Provide required input fields to get Org Users"
        });
    }

    Orgs.findOne({"name": req.params.orgname})
    .then(data=>{
        if(data != null){
            let ulist = data.users
            
            Users.find({"uid": {$in: ulist}})
            .then(data=>{
                if(data != null){
                    res.status(200).send({message: data})
                }
                else{
                    res.status(200).send({message: "Users not in the record"})
                }
            })
            .catch(err=>{
                console.log("Error while accessing Users: ", err)
            })
        }
        else{
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org: ", err)
    })
}