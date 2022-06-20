/*############################################################################
# 
# Module: dnc.listdevice.js
#
# Description:
#     Endpoint implementation for providing list of devices from DNC record
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
const dschema = require('./dnc.schema.js');
const Devices = require('../models/devreg.model.js');

//function getDeviceList(countryid, dncq, dnckey)
exports.getDeviceList = (req, res) => {

    console.log("DNC Server: Get device list")

    var cfilter = {"cname": req.body.dncd.influxd.uname}

    Client.findOne(cfilter)
    .then(function(data){
        if(data)
        {
            Cdev = dschema.getDevSchema(data)
            clientname = data.cname
            clientid = data.cid

            fmdate = req.body.dncd.fdate
            todate = req.body.dncd.tdate

            
            var filter = {}

            if(Object.keys(req.body.dncd).includes("dnckey"))
            {
                var totf = []
                var timef = {$or:[{"idate": {$gte: fmdate, $lte: todate}},
                {"rdate": {$gte: fmdate, $lte: todate}},
                {"idate":{$lte: fmdate},"rdate": null}]}

                totf.push(req.body.dncd.dnckey)
                totf.push(timef)

                filter["$and"] = totf
            }
            else
            {
                console.log("DNCS - No DNC Tags selected")
                var timef = [{"idate": {$gte: fmdate, $lte: todate}},
                {"rdate": {$gte: fmdate, $lte: todate}},
                {"idate":{$lte: fmdate},"rdate": null}]

                filter["$or"] = timef
            }

           
            var findict = {}

            findict['dbdata'] = data.dbdata
            
            taglist = data.taglist

            Cdev.find(filter).sort({"idate": 1})
            .then(async function(data) {
                if(data)
                {
                    var devarray = [];
                    for(var i=0; i<data.length; i++)
                    {
                        var indict = {};

                        indict['location'] = []
                        indict.location.push(data[i].latitude)
                        indict.location.push(data[i].longitude)

                        for(k=0; k<taglist.length;  k++)
                        {
                            indict.location.push(data[i][taglist[k]])
                        }

                        indict['devid'] = data[i].hwid;
                        indict['idate'] = data[i].idate;
                        indict['rdate'] = data[i].rdate;
                        indict['darr'] = []
                        devarray.push(indict);

                    }
                    
                    findict['devices'] = devarray;
                    findict['taglist'] = taglist
                    resdict = await getTopMapping(clientid, findict)

                    res.status(200).send({
                        resdict
                    });
                }
                else
                {
                    console.log("DNCS - Resp rcvd: No devices")
                    res.status(201).send({
                        message: "Data Read Error"
                    });
                }
            })
            .catch(err => {
                console.log("DNCS - Resp DB Read Error")
                res.status(201).send({
                    message: "Data Read Error"
                });
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



// Get InfluxDB device tag ID from Device Registry
// Input - Client ID, HW ID, device install date and device remove date
// Output - deviceID/ devID/ devEUI

async function getTopMapping(clienid, devdict){
    var len = devdict.devices.length;
    for(var i=0; i<len; i++)
    {
        data = await GetDeviceID(clienid, devdict.devices[i])
        if(data)
        {
            devdict.devices[i].deviceid = data.deviceid
            devdict.devices[i].devID = data.devID
            devdict.devices[i].devEUI = data.devEUI
        }
        else
        {
            devdict.devices[i] = {}
        }
    }
    return devdict
}


// Get InfluxDB device tag ID from Device Registry
// Input - Client ID, HW ID, device install date and device remove date
// Output - deviceID/ devID/ devEUI

function GetDeviceID(clientid, devdict)
{
    return new Promise(function(resolve, reject) {

       var filter = {"cid": clientid, "hwid": devdict.devid, "idate": devdict.idate, "rdate": devdict.rdate}
       Devices.findOne(filter ,function(err, data){
           if(err)
           {
               data = []
               reject(data);
           }
           else
           {
               resolve(data)
           }
        });
    });
}

function GetdevEUIdevID(cid, hwid)
{
    return new Promise(function(resolve, reject) {

       var filter = {"cid": cid, "hwid": hwid}
       Devices.findOne(filter ,function(err, data){
           if(err)
           {
               data = []
               reject(data);
           }
           else
           {
               resolve(data)
           }
        });
    });
}

exports.getDevMaps = (req, res) => {
    var filter = {"cname": req.body.cname}
    var dbname, measname;
    Client.findOne(filter)
    .then(async function(data) {
        if(data)
        {
            let cid = data.cid
            taglist = data.taglist
            dbname = data.dbdata.dbname
            measname = data.dbdata.mmtname
            const tagv = req.body.tagval.split(",")
            const tagval = []
            for(let i=0; i<tagv.length; i++){
                tagval.push(tagv[i].trim())
            }

            dncdict = {}
            
            for(let i=0; i<taglist.length; i++){
                dncdict[taglist[i]] = tagval[i]
            }

            Cdev = dschema.getDevSchema(data)
            Cdev.find(dncdict)
            .then(async function(data){
                var devarray = [];
                for(var i=0; i<data.length; i++)
                {
                    devdict = {}
                    devdata = await GetdevEUIdevID(cid, data[i]["hwid"])
                    if(devdata){
                        devdict["devEUI"] = devdata.devEUI
                        devdict["devID"] = devdata.devID
                        devdict["deviceid"] = devdata.deviceid
                    }
                    devarray.push(devdict)
                }
                let findict = {}
                findict['devices'] = devarray;
                findict['dbname'] = dbname;
                findict['measname'] = measname;

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
}