/*############################################################################
# 
# Module: dnc.controller.js
#
# Description:
#     Endpoint implementation for handling DNC Tags
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

const mongoose = require('mongoose');
const Client = require('../models/client.model.js');
const Users = require('../models/user.model.js');

const readdb = require('./influx.js');
const dschema = require('./dnc.schema.js');

const USER = 1;
const ADMIN = 2;

var crypto = require('crypto'); 

exports.alogin = (req, res) => {
    var filter = {"dbdata.user": req.body.influxd.uname, "dbdata.pwd": req.body.influxd.pwd, "dbdata.dbname": req.body.influxd.dbname}
    Client.findOne(filter)
    .then(function(data){
        if(data)
        {
            res.status(200).send(data)
        }
        else
        {
            res.status(401).send({
                message: "Invalid User!"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}


exports.pluginLogin = (req, res) => {
    var username = {"uname" : req.body.uname};
    var pwd = {"pwd" : req.body.pwd};

    Users.findOne(username)
    .then(function(data) {
            if(data)
            {
                var clientid = data.cid
                var dbsalt = data.psalt
                var dbhash = data.phash
                var level = data.level
                var filter = {"uname": req.body.uname}

                this.hash = crypto.pbkdf2Sync(req.body.pwd, dbsalt,1000, 64, `sha512`).toString(`hex`);

                if(this.hash == dbhash)
                {
                    if(level == ADMIN)
                    {
                       getClientList(req, res);
                    }
                    else
                    if(level == USER)
                    {
                       getClient(clientid, req, res);
                    }
               }
               else
               {
                   return res.status(400).send({
                       message: "User ID and Password is not valid"
                   });
               }
            }
            else
            {
                return res.status(400).send({
                  message: "User ID and Password is not valid"
               });
            }
     })
     .catch((err) => {
        console.log("Username Read Error", err)
     })
};


exports.readtags = (req, res) => {
    var filter = {"cname": req.body.influxd.uname}

    Client.findOne(filter)
    .then(function(data){
        if(data)
        {
            res.status(200).send({
                message: data.taglist
            });
        }
        else
        {
            res.status(401).send({
                message: "Invalid User!"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}

exports.readtagval = (req, res) => {
    var filter = {"cname": req.body.influxd.uname}
    Client.findOne(filter)
    .then(async function(data){
        if(data)
        {
            var tagname = null
            gettn = req.body.influxd.query.split("KEY")
            const rek = /"(.*?)"/g;
            inptag = (rek.exec(gettn[1])).pop()

            if(data.taglist.indexOf(inptag) > -1)
            {
                tagname = inptag
            
                var keydict = {}
                var filtdict = {}
                var tagval = []

                try{
                    var gval = await getDNCTagValues(data, tagname, keydict)
                    for(var j=0; j<gval.length; j++)
                    {
                        tagval.push(gval[j])
                    }
                    
                }catch(err){
                    console.log("DNC Val Read Err: ", err)
                }
                        
                var resdict = {}
                var dict = {}
                        
                if(req.body.influxd.query.includes("SHOW TAG VALUES FROM"))
                {
                    var measstr = req.body.influxd.query.split("FROM")
                    const rek = /"(.*?)"/g;
                    var measname = (rek.exec(measstr[1])).pop()
                    dict["name"] = measname
                }
                else
                {
                    dict["name"] = "MeasName"
                } 
                        
                dict["columns"] = ["key","value"]
                dict["values"] = tagval 
        
                var dictm = {}
                dictm["statement_id"] = 0
                dictm["series"] = [dict]
        
                resdict["results"] = [dictm]
                res.status(200).send(resdict)

            }
            else{
                res.status(401).send({
                    message: "Invalid Tag"
                }); 
            }
        }
        else
        {
            res.status(401).send({
                message: "Invalid User!"
            });
        }
    })
    .catch((err) => {
        console.log("Get Val Catch Error: ", err)
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}

exports.getFields = (req, res) => {
    var filter = {"cname": req.body.cname}
    Client.findOne(filter)
    .then(async function(data) {
            if(data)
            {
                let dbdata = data.dbdata
                var indict = {}
                indict["server"] = dbdata.url
                indict["db"] = dbdata.dbname
                indict["user"] = dbdata.user
                indict["pwd"] = dbdata.pwd
                indict["qry"] = "show field keys from "+dbdata.mmtname

                try{
                    influxdata = await readdb.readInflux(indict)
             
                    if(influxdata != 'error')
                    {
                        try{
                            if(influxdata.hasOwnProperty("results"))
                            {
                                resobj = influxdata.results[0];
                                if(resobj.hasOwnProperty("series"))
                                {
                                    var finarray = []
                                    var farray =  resobj.series[0].values
                                    for(i=0; i<farray.length; i++)
                                    {
                                        finarray.push(farray[i][0])
                                    }   
                                    var resdict = {};
                                    resdict["fields"] = finarray
                                    res.status(200).send(resdict);
                                }
                                else
                                {
                                    return res.status(400).send({
                                        error: "Series not found in response"
                                    });
                                }
                            }
                            else
                            {
                                return res.status(400).send({
                                    error: "Results not found in response"
                                });
                            }
                        }
                        catch(err)
                        {
                            return res.status(400).send({
                                error: "Error in reading Fields"
                            });
                        }
                    }
             
                }catch(err){
                    return res.status(400).send({
                         error: "Field data not available"
                    });
                }
            }
            else
            {
                return res.status(400).send({
                  message: "Client not found"
               });
            }
     })
     .catch((err) => {
        console.log("Client Read Error", err)
     })
};


exports.getDevices = (req, res) => {
    var filter = {"cname": req.body.cname}
    Client.findOne(filter)
    .then(async function(data) {
            if(data)
            {
                taglist = data.taglist
                Cdev = dschema.getDevSchema(data)
                Cdev.find()
                .then(function(data){
                    var devarray = [];
                    for(var i=0; i<data.length; i++)
                    {
                        darray = []
                        for(k=0; k<taglist.length;  k++)
                        {
                            darray.push(data[i][taglist[k]])
                        }

                        darray.push(data[i]["hwid"])
                        
                        devarray.push(darray);

                    }
                    let findict = {}
                    findict['devices'] = devarray;
                    findict['taglist'] = taglist
                    res.status(200).send(findict);
                })
                .catch(err => {
                    res.status(201).send({
                        message: "Data Read Error"
                    });
                })
            }
            else
            {
                return res.status(400).send({
                  message: "Client not found"
               });
            }
     })
     .catch((err) => {
        console.log("Client Read Error", err)
     })
};


function getDevSchema(data)
{
    mschema = {} 
            
    mschema["latitude"] = {"type": "String"}
    mschema["longitude"] = {"type": "String"}
    var taglist = data.taglist
    for(i=0; i<taglist.length; i++)
    {
        mschema[taglist[i]] = {"type": "String"}
    }
    mschema["devEUI"] = {"type": "String"}
    mschema["idate"] = {"type": "String"}
    mschema["rdate"] = {"type": "String"}

    cid = data.cid

    let Cdev
    try {
        Cdev = mongoose.model('devices'+cid)

    }catch (error){
        const devSchema = mongoose.Schema(mschema, {timestamps: true})
        Cdev = mongoose.model('devices'+cid, devSchema)
    }

    return Cdev
}


function getDNCTagValues(data1, tagname, filtdict)
{
    return new Promise(function(resolve, reject) {
        var tagval = [];
        Cdev = getDevSchema(data1)
        Cdev.find(filtdict)
        .then(data => {
            if(data)
            {
                for(var j=0; j<data.length; j++)
                {
                    var indata = data[j][tagname]
                    tagval.push(indata);
                }
                resolve(tagval)
            }
            else
            {
                resolve("Filter Error")
            }
        }).catch(err => {
            reject("Filter Error")
        });
    });
}

function getClientList(req, res){
    Client.find()
    .then(function(data){
        if(data)
        {
            var clients = [];
            var results = {};
            for(var i=0; i<data.length; i++)
            {
                clients.push(data[i].cname);
            }
            results["clients"] = clients;
            res.status(200).send({
                results
            });
        }
        else
        {
            res.status(401).send({
                message: "Couldn't find clients"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}

function getClient(cid, req, res) {
    var filter = {"cid": cid}
    Client.findOne(filter)
    .then(function(data){
        if(data)
        {
            var clients = [];
            var results = {};
            
            clients.push(data.cname);
            results["clients"] = clients;
            res.status(200).send({
                results
            });
        }
        else
        {
            res.status(401).send({
                message: "Invalid Client ID!"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}

function extractTags(inq)
{
    var alltag = []
    var ntag = []
    var nval = []

    const rek = /"(.*?)"/g;
    const rev = /'(.*?)'/g;

    
    for(var i=0; i<inq.length; i++)
    {
        const rek = /"(.*?)"/g;
        const rev = /'(.*?)'/g;      
  
        ntag.push((rek.exec(inq[i])).pop())
        nval.push((rev.exec(inq[i])).pop())
    }

    var dictall = {}

    for(var i=0; i<ntag.length; i++)
    {
        if(dictall.hasOwnProperty(ntag[i]))
        {
            dictall[ntag[i]].push(nval[i])
        }
        else
        {
            dictall[ntag[i]] = [nval[i]] 
        }
    } 
    
    alltag.push(dictall)
    
    return alltag
}
