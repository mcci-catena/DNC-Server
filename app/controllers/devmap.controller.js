/*############################################################################
# 
# Module: devmap.controller.js
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
const Client = require('../models/org.model.js');
const Devices = require('../models/stock.model.js');

const Dsrc = require('../models/ds.model')

const spotctrl = require('./spot.controller.js')
const devctrl = require('./device.controller.js')

exports.getDeviceList = (req, res) => {
    let mykey = Object.keys(req.body.dncd.tags)
    
    let mydnckey = {}
    for(let i=0; i<mykey.length; i++){
        mydnckey[mykey[i].toLowerCase()] = req.body.dncd.tags[mykey[i]]
    }

    let cfilter = {"name": req.body.dncd.orgname}

    Client.findOne(cfilter)
    .then(function(data){
        if(data){
            oname = data.name
            oid = data.id

            let taglist = []
            for(let i=0; i<data.tags.length; i++){
                taglist.push(data.tags[i].toLowerCase())
            }
            
            fmdate = req.body.dncd.time[0]
            todate = req.body.dncd.time[1]

            Cspot = spotctrl.getschema(data.id, taglist)
            Cspot.find(mydnckey)
            .then(function(data){
                if(data){
                    var devarray = [];
                    let sids = [];
                    let tagdict = {}
                    for(let i=0; i<data.length; i++){
                        var indict = {};

                        indict['spot'] = []
                        
                        indict.spot.push(data[i].latitude)
                        indict.spot.push(data[i].longitude)

                        let intagdict = {}

                        for(k=0; k<taglist.length;  k++)
                        {
                            indict.spot.push(data[i][taglist[k]])
                            intagdict[taglist[k]] = data[i][taglist[k]]
                        }

                        tagdict[data[i].sid] = intagdict

                        indict['sid'] = data[i].sid;
                        sids.push(data[i].sid)
                        indict['darr'] = []
                        devarray.push(indict);
                    }

                    var filter = {}

                    // console.log("Check DNC Tags are present:  ", Object.keys(req.body.dncd.tags), Object.keys(mydnckey))

                    if(Object.keys(req.body.dncd).includes("tags"))
                    {
                        var totf = []
                        var timef = {$or:[{"idate": {$gte: fmdate, $lte: todate}},
                        {"rdate": {$gte: fmdate, $lte: todate}},
                        {"idate":{$lte: fmdate},"rdate": null}]}
        
                        totf.push({sid: sids})
                        totf.push(timef)
        
                        filter["$and"] = totf

                    }
                    else
                    {
                        // console.log("DNCS - No DNC Tags selected")
                        var timef = [{"idate": {$gte: fmdate, $lte: todate}},
                        {"rdate": {$gte: fmdate, $lte: todate}},
                        {"idate":{$lte: fmdate},"rdate": null}]
        
                        filter["$or"] = timef
                    }

                    Cdev = devctrl.getschema(oid)
                    Cdev.find(filter).sort({"idate": 1}).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0, "user": 0, "remarks": 0})
                    .then(function(data){
                        if(data){
                            let devs = []
                            let dsrcs = []
                            
                            for(let i=0; i<data.length; i++){
                                devs.push(data[i])
                                dsrcs.push(data[i].dsid)
                            }

                            // console.log("Mapped Devices: ", devs)

                            let dsrc = {}
                            
                            Dsrc.find({"dsid": dsrcs}).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0, "user": 0})
                            .then(data => {
                                if(data) {
                                    for(let i=0; i<data.length; i++){
                                        dsrc[data[i].dsid] = data[i]
                                    }
                                    
                                    req.body.dncd["dsrc"] = dsrc
                                    req.body.dncd["dtags"] = tagdict
                                    req.body.dncd["devices"] = devs 
                                    
                                    res.status(200).send({
                                        message: req.body.dncd
                                    });
                                    
                                }
                                else {
                                    res.status(400).send({message: "No records found"});
                                }
                            })
                            .catch(err => {
                                res.status(500).send({message: "Error while accessing DB"});
                            });
                        }
                        else{
                            console.log("DNCS - No Device found")
                            res.status(201).send({
                                message: "Device Data Read Error"
                            });
                        }
                    })
                    .catch(err => {
                        console.log("DNC - Device Read Error: ", err)
                        res.status(201).send({
                            message: "Device Data Read Error"
                        });
                    });
        
                }
                else{
                    console.log("DNCS - No Spot found")
                    res.status(201).send({
                        message: "Device Spot not found"
                    });
                }
            })
            .catch(err => {
                console.log("DNC - Spot Read Error: ", err)
                res.status(201).send({
                    message: "Device Spot Read Error"
                });
            });
        }
        else
        {
            console.log("Org not found")
            res.status(401).send({
                message: "Invalid Org!"
            });
        }
    })
    .catch((err) => {
        console.log("Error while fetching Org info")
        res.status(500).send({
            message: err.message || "Error occurred while fetching the org info"
        });
    });
}
