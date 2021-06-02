const Config = require('../models/config.model.js');
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