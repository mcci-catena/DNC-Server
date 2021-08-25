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
#     V1.0.0 Wed Aug 23 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const Clients = require('../models/client.model.js');
const Devices = require('../models/devreg.model.js');
const validfn = require('../misc/validators.js');

const mongoose = require('mongoose');

// Add a new device to the Database 

getDevSchema = (client) => {
    mschema = {} 
    mschema["latitude"] = {"type": "String"}
    mschema["longitude"] = {"type": "String"}
    mschema["hwid"] = {"type": "String"}        // previously devEUI, in WeRadiate devid
            
    var taglist = client.taglist
    for(i=0; i<taglist.length; i++)
    {
        mschema[taglist[i]] = {"type": "String"}
    }
            
    mschema["idate"] = {"type": "Date"}
    mschema["rdate"] = {"type": "Date"}

    const devSchema = mongoose.Schema(mschema, {timestamps: true})
    return devSchema
}


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
            req.body.cid = data.cid

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
        cid: req.body.cid,
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
                dict['client'] = data[i].cid;
                dict['hwid'] = data[i].hwid;
                dict['deviceid'] = data[i].deviceid;
                dict['devID'] = data[i].devID;
                dict['devEUI'] = data[i].devEUI;
                dict['mmname'] = data[i].mmname;
                dict['fdname'] = data[i].fdname;
                dict['idate'] = data[i].idate;
                dict['rdate'] = data[i].rdate;
                finlist.push(dict);
            }

            Clients.find()
            .then(data => {
                cids = []
                cnames = []
                for(var i=0; i<data.length; i++)
                {
                    cids.push(data[i].cid)
                    cnames.push(data[i].cname)
                }

                for(var i=0; i<finlist.length; i++)
                {
                    if(cids.indexOf(finlist[i]['client']) >= 0)
                    {
                        finlist[i]['client'] = cnames[cids.indexOf(finlist[i]['client'])]
                    }
                }
                res.status(200).send(finlist);
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Some error occurred while retrieving Client info."
                });
            });
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
            var cname = data.cname
            Devices.find({"cid": data.cid})
            .then(function(data) {
                if(data)
                {
                    var finlist = [];

                    for(var i=0; i<data.length; i++)
                    {
                        var dict = {};
                        //dict['client'] = data[i].cid;
                        dict['client'] = cname
                        dict['hwid'] = data[i].hwid;
                        dict['deviceid'] = data[i].deviceid;
                        dict['devID'] = data[i].devID;
                        dict['devEUI'] = data[i].devEUI;
                        dict['mmname'] = data[i].mmname;
                        dict['fdname'] = data[i].fdname;
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
exports.mfdeviceList = (req, res) => {
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

            let Cdev
            try {
                Cdev = mongoose.model('devices'+clientid)
            }catch (error){
                Cdev = mongoose.model('devices'+clientid, getDevSchema(data))
            }

            Devices.find({"cid": clientid, "rdate": ''})
            .then(function(data) {
                if(data)
                {
                    if(data.length > 0)
                    {
                        var nhwids = []
                        var deviceids = []
                        var devIDs = []
                        var devEUIs = []
                        var dtime = []

                        for(var i=0; i<data.length; i++)
                        {
                            nhwids.push(data[i].hwid)
                            deviceids.push(data[i].deviceid)
                            devIDs.push(data[i].devID)
                            devEUIs.push(data[i].devEUI)
                            dtime.push(data[i].idate)
                        }
                        
                        var filter = {"rdate": ''};
                        Cdev.find(filter)
                        .then(function(ndata) {
                            if(ndata)
                            {
                                var devids = [];
                                var avail = [];
                                var results = {};
                                for(var i=0; i<ndata.length; i++)
                                {
                                    devids.push(ndata[i].hwid);
                                }
                                
                                for(var i=0; i<nhwids.length; i++)
                                {
                                    if(devids.indexOf(nhwids[i]) == -1)
                                    {
                                        var hwdict = {}
                                        hwdict['hwid'] = nhwids[i]
                                        hwdict['deviceid'] = deviceids[i]
                                        hwdict['devID'] = devIDs[i]
                                        hwdict['devEUI'] = devEUIs[i]
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

        var filter = {"cid": devdict.cid, "hwid": devdict.hwid, "rdate": ''}
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
       !req.body.mmname && !req.body.fdname &&
       !req.body.nhwid) || !req.body.datetime) {

        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var clientname = {"cname" : req.params.client};
    Clients.findOne(clientname)
    .then(async function(data) {
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
            
            var filter = {"cid": data.cid, "hwid": req.body.hwid, 
                          "rdate": ''}
            var update = {"cid": data.cid, "hwid": req.body.hwid,
                          "deviceid": deviceid, "devID": devID, "devEUI": devEUI,
                          "mmname": req.body.mmname, "fdname": req.body.fdname,
                          "idate": new Date(req.body.datetime)};
            
            var err_flg = false

            if(req.body.nclient)
            {
                await Clients.findOne({"cname" : req.body.nclient})
                .then(function(data) {
                    if(data)
                    {
                        update.cid = data.cid
                    }
                    else{
                        err_flg = true
                    }
                })
                .catch((err) => {
                    res.status(500).send({
                        message: err.message || "Error occurred while updating the device in record!"
                    });
                });
            }
            
            if(err_flg == true)
            {
                throw new Error('New Client doesnt exists');
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
                    res.status(400).send({
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
            var cname = data.cname
            Devices.findOneAndDelete({"cid": data.cid, "hwid": req.body.hwid, 
                            "rdate": ''})
            .then(function(data) {
                if(data)
                {
                    data["client"] = cname;
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