/*############################################################################
# 
# Module: devreg.controller.js
#
# Description:
#     Controller API for Manage Device Registry
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
#     Seenivasan V, MCCI Corporation Feb 2021
#
# Revision history:
#     V1.1.2 Wed Feb 23 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const Clients = require('../models/client.model.js');
const Devices = require('../models/devreg.model.js');
const DevSchema = require('../models/device.model.js');
const validfn = require('../misc/validators.js');

const mongoose = require('mongoose');

// Add a new device to the Database 

exports.mcreate = (req, res) => {

    if(!req.body.client || !req.body.hwid || (!req.body.deviceid && 
        !req.body.devID && !req.body.devEUI ) || !req.body.mmname ||
        !req.body.fdname || !req.body.datetime) {

        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var [resb, rest] = validfn.hwidvalidation(req.body.hwid)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Hardware ID "+rest}); 
    }

    var dttmstr = req.body.datetime.split(",")
    var dtstr = dttmstr[0].trim();
    var tmstr = dttmstr[1].trim();

    if(!validfn.validatedate(dtstr) || !validfn.validatetime(tmstr))
    {
        return res.status(400).send({
            message: "Invalid date and time!"
        });
    }

    var gdate = new Date(req.body.datetime)
    var cdate = new Date();
    
    if(cdate < gdate)
    {
        return res.status(400).send({message: 
                "Add date should not be recent to the"+ 
                " current date" });
    }

    var clientname = {"cname" : req.body.client};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            filtlist = []
            filtlist.push({"hwid": req.body.hwid, "rdate": ''})
            if(req.body.deviceid)
            {
                filtlist.push({"deviceid": req.body.deviceid, "rdate": ''})
            }
            if(req.body.devID)
            {
                filtlist.push({"devID": req.body.devID, "rdate": ''})
            }
            if(req.body.devEUI)
            {
                filtlist.push({"devEUI": req.body.devEUI, "rdate": ''})
            }
            
            //Devices.findOne({$or:[{"hwid": req.body.hwid, "rdate": ''}, {"deviceid": req.body.devid, "rdate": ''},
            //                ]})
             Devices.findOne({$or: filtlist})
            .then(function(data) {
                if(!data)
                {
                    addDevice(req, res);    
                }
                else
                {
                    return res.status(400).send({
                        message: "Hardware ID or Device ID already exists!"
                    });
                }  
            })
            .catch((err) => {
                    res.status(500).send({
                        message: err.message || "Error occurred while fetching the device info"
                    });
            });
        }
        else
        {
            res.status(400).send({
                message: "Client not exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}


function addDevice(req, res)
{
    var deviceid, devID, devEUI
    if(req.body.deviceid)
    {
        deviceid = req.body.deviceid
    }
    else
    {
        deviceid = ""
    }

    if(req.body.devID)
    {
        devID = req.body.devID
    }
    else
    {
        devID = ""
    }

    if(req.body.devEUI)
    {
        devEUI = req.body.devEUI
    }
    else
    {
        devEUI = ""
    }
    const device = new Devices({
        client: req.body.client,
        hwid: req.body.hwid,
        deviceid: deviceid,
        devID: devID,
        devEUI: devEUI,
        mmname: req.body.mmname,
        fdname: req.body.fdname,
        idate: new Date(req.body.datetime),
        rdate: ''
    });    
    device.save()
    .then(data => {
        var resdict = {};
        resdict["client"] = data.client;
        resdict["Hw ID"] = data.hwid;
        resdict["Deviceid"] = data.deviceid;
        resdict["Dev ID"] = data.devID;
        resdict["Dev EUI"] = data.devEUI;
        resdict["Meas Name"] = data.mmname;
        resdict["Field Name"] = data.fdname;
        res.status(200).send(resdict);
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while adding the Device."
        });
    });      
    
}


// List the all devices assigned for all clients
exports.adeviceList = (req, res) => {
    Devices.find()
    .then(data => {
        if(data)
        {
            var finlist = [];

            for(var i=0; i<data.length; i++)
            {
                var dict = {};
                dict['client'] = data[i].client;
                dict['hwid'] = data[i].hwid;
                dict['deviceid'] = data[i].deviceid;
                dict['devID'] = data[i].devID;
                dict['devEUI'] = data[i].devEUI;
                dict['idate'] = data[i].idate;
                dict['rdate'] = data[i].rdate;
                finlist.push(dict);
            }
            res.status(200).send(finlist);
        }
        else
        {
            res.status(200).send({message: "No Devices Registered"});
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving devices."
        });
    });
}


// List the all devices assigned for a client
exports.adeviceClient = (req, res) => {

    if(!req.params.client) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
    var clientname = {"cname" : req.params.client};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            Devices.find({"client": req.params.client})
            .then(function(data) {
                if(data)
                {
                    var finlist = [];

                    for(var i=0; i<data.length; i++)
                    {
                        var dict = {};
                        dict['client'] = data[i].client;
                        dict['hwid'] = data[i].hwid;
                        dict['deviceid'] = data[i].deviceid;
                        dict['devID'] = data[i].devID;
                        dict['devEUI'] = data[i].devEUI;
                        dict['idate'] = data[i].idate;
                        dict['rdate'] = data[i].rdate;
                        finlist.push(dict);
                    }
                    res.status(200).send(finlist);
                }
                else
                {
                    res.status(200).send({message: "No Devices Registered"});
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error occurred while fetching the device info"
                });
            });
           
        }
        else
        {
            res.status(400).send({
                message: "Client doesn't exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}


// List the deviceID assigned under a deviceName for a Client
exports.mdeviceList = (req, res) => {
    if(!req.params.client) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
    
    var clientname = {"cname" : req.params.client};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var clientid = data.cid;
            Devices.find({"client": req.params.client, "rdate": ''})
            .then(function(data) {
                if(data)
                {
                    if(data.length > 0)
                    {
                        var hwids = []
                        var devtags = []
                        var devnwids = []
                        var dtime = []

                        for(var i=0; i<data.length; i++)
                        {
                            hwids.push(data[i].hwid)
                            devtags.push(data[i].devtag)
                            devnwids.push(data[i].devid)
                            dtime.push(data[i].idate)
                        }
                        
                        var Cdev = mongoose.model('device'+clientid, DevSchema);
                        var filter = {"rdate": ''};
                        Cdev.find(filter)
                        .then(function(data) {
                            if(data)
                            {
                                var devids = [];
                                var avail = [];
                                var results = {};
                                for(var i=0; i<data.length; i++)
                                {
                                    devids.push(data[i].devid);
                                }
                                for(var i=0; i<hwids.length; i++)
                                {
                                    if(devids.indexOf(hwids[i]) == -1)
                                    {
                                        var hwdict = {}
                                        hwdict['hwid'] = hwids[i]
                                        hwdict['devtag'] = devtags[i]
                                        hwdict['devid'] = devnwids[i]
                                        hwdict['date'] = dtime[i]
                                        avail.push(hwdict)
                                    }
                                }
                                results["hwids"] = avail;
                                res.status(200).send(results);
                            }
                            else
                            {
                                res.status(400).send({
                                    message: "No Devices under the site, pile and location!"
                                });
                            }
                        })
                        .catch((err) => {
                            res.status(500).send({
                                message: err.message || "Error occurred while fetching the Device info"
                            });
                        });
                    }
                    else
                    {
                        res.status(400).send({
                            message: "No Devices registered under this client!"
                        });
                    }
                }
                else
                {
                    res.status(400).send({
                        message: "No Devices registered under this client!"
                    });
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error occurred while fetching the device info"
                });
            });
        }
        else
        {
            res.status(400).send({
                message: "Client doesn't exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}

exports.removemdevice = (devdict) => {
    return new Promise(function(resolve, reject) {

        var filter = {"client": devdict.client, "hwid": devdict.hwid, "idate": devdict.idate}
        var update = {"rdate": new Date(devdict.rdate)};
        Devices.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true}, function(err, data){
            if(err)
            {
                reject(false);
            }
            else
            {
                resolve(true)
            }
        });
 
    });
}


// Edit a device
exports.medit = (req, res) => {
    if(!req.params.client || !req.body.hwid || (!req.body.deviceid && 
       !req.body.devID && !req.body.devEUI && !req.body.nclient &&
       !req.body.nhwid) || !req.body.datetime) {

        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var clientname = {"cname" : req.params.client};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var deviceid, devID, devEUI
            if(req.body.deviceid)
            {
                deviceid = req.body.deviceid
            }
            else
            {
                deviceid = ""
            }

            if(req.body.devID)
            {
                devID = req.body.devID
            }
            else
            {
                devID = ""
            }

            if(req.body.devEUI)
            {
                devEUI = req.body.devEUI
            }
            else
            {
                devEUI = ""
            }
            
            var filter = {"client": req.params.client, "hwid": req.body.hwid, 
                          "rdate": ''}
            var update = {"client": req.params.client, "hwid": req.body.hwid,
                          "deviceid": deviceid, "devID": devID, "devEUI": devEUI,
                          "idate": new Date(req.body.datetime)};
            
            if(req.body.nclient)
            {
                update.client = req.body.nclient
            }
            
            if(req.body.nhwid)
            {
                update.hwid = req.body.nhwid
            }
                    
            Devices.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
            .then(function(data) {
                if(data)
                {
                    res.status(200).send(data);
                }
                else
                {
                    return res.status(400).send({
                        message: "Selected device not found in the record!"
                    });
                }  
            })
            .catch((err) => {
                    res.status(500).send({
                        message: err.message || "Error occurred while updating the device in record!"
                    });
            });
        }
        else
        {
            res.status(400).send({
                message: "Client not exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}


// Delete a device
exports.mdelete = (req, res) => {
    if(!req.params.client || !req.body.hwid || !req.body.datetime) {

        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var clientname = {"cname" : req.params.client};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            Devices.findOneAndDelete({"client": req.params.client, "hwid": req.body.hwid, 
                            "rdate": ''})
            .then(function(data) {
                if(data)
                {
                    res.status(200).send(data);
                }
                else
                {
                    return res.status(400).send({
                        message: "Selected device not found in the record!"
                    });
                }  
            })
            .catch((err) => {
                    res.status(500).send({
                        message: err.message || "Error occurred while fetching the device info"
                    });
            });
        }
        else
        {
            res.status(400).send({
                message: "Client not exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}