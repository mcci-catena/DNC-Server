/*############################################################################
# 
# Module: device.controller.js
#
# Description:
#     Controller for Manage Location module
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
#     V2.0.0 Tue April 24 2023 11:27:21 seenivasan
#       Module created
############################################################################*/

const stockctrl = require('./stock.controller')

const Stock = require('../models/stock.model')
const Orgs = require('../models/org.model.js');
const Dsrc = require('../models/ds.model')

const mongoose = require('mongoose');

exports.getschema = (orgid) => {
    let devsch
    try {
        devsch = mongoose.model('devices'+orgid)
        console.log("Device Schema exists: ", devsch)
    }catch (error){
        devsch = mongoose.model('devices'+orgid, getDevSchema())
        console.log("Spot Schema not exists: ", spotsch)
    }
    finally{
        return devsch
    }
}

function getschema(orgid){
    let devsch
    try {
        devsch = mongoose.model('devices'+orgid)
        console.log("Device Schema exists: ", devsch)
    }catch (error){
        devsch = mongoose.model('devices'+orgid, getDevSchema())
        console.log("Spot Schema not exists: ", spotsch)
    }
    finally{
        return devsch
    }
}

getDevSchema = () => {
    let mschema = {} 
    mschema["hwsl"] = {"type": "String"}
    mschema["dsid"] = {"type": "String"}
    mschema["devid"] = {"type": "String"}
    mschema["devtype"] = {"type": "String"}
    mschema["sid"] = {"type": "String"}
    mschema["idate"] = {"type": "Date"}
    mschema["rdate"] = {"type": "Date"}
    mschema["remarks"] = {"type": "String"}
    mschema["user"] = {"type": "String"}
       
    const devSchema = mongoose.Schema(mschema, {timestamps: true})
    return devSchema
}

// Org specific function - Assign a device(hwsl) to a spot
// Input - spotName, HwSl
// From stock need to get devID, devEUI and DataSource ID
// idate is optional

exports.getrtadevices = async (req, res) => {
    console.log("Get RTA devices: ", req.params.orgname)
    if(!req.params.orgname) {
        return res.status(400).send({
            message: "Provide required input fields to assign Device"
        });
    }

    Orgs.findOne({"name": req.params.orgname})
    .then(data=>{
        if(data != null){
            let orgid = data.id
            let filter = {"orgid": orgid, "odate": null, "status": /^ready$/i}
            
            Stock.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
            .then(data => {
                if(data) {
                    console.log("Device found: ", data)
                    res.status(200).send({message: data});
                }
                else {
                    console.log("No devices foundn for the Org.")
                    res.status(400).send({message: "No devices foundn for the Org."});
                }
            })
            .catch(err => {
                console.log("Error while access: ", err)
                res.status(500).send({message: "Error while accessing Stock info"});
            });
        }
        else{
            console.log("Org not exist")
            res.status(500).send({message: "Org does not exist"})
        }
    })
    .catch((err) => {
        console.log("Error while access-2: ", err)
        res.status(500).send({
            message: err.message || "Error occurred while fetching Device stock info"
        });
    });
}

// Assign device to a spot
exports.addnewdev = async (req, res) => {

    console.log("Add New Device: ", req.body, req.body.device)

    if(!req.body.orgname || !req.body.device|| !req.params.sname) {
        console.log("Field required")
        return res.status(400).send({
            message: "Provide required input fields to assign Device"
        });
    }

    Orgs.findOne({"name": req.body.orgname})
    .then(data=>{
        if(data != null){
            let orgid = data.id
            let devsch = getschema(orgid)

            devsch.findOne({"hwsl": req.body.device.hwsl, "rdate": null})
            .then(data => {
                if(data == null){
                    console.log("Device ready to assign")
                    insertdevice(req, res, devsch, orgid)
                }
                else{
                    console.log("Device already exists")
                    res.status(400).send({message: "Device already exists in the record"})
                }
            })
            .catch(err=>{
                console.log("Error while accessing Device Info - ", err)
            })
        }
        else{
            console.log("Org dows not exists")
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org Info - ", err)
    })
}

async function getDsList(){
    return new Promise(function(resolve, reject) {
        Dsrc.find().select({"dsname": 1, "dsid": 1, "_id": 0})
        .then(data => {
            if(data.length > 0){
                let dsdict = {}
                for(let i=0; i<data.length; i++){
                    dsdict[data[i].dsid] = data[i].dsname
                }
                resolve(dsdict)
            }
            else {
                resolve({})
            }

        })
        .catch(err => {
            resolve({})
        });
    })
}

exports.getspotdevices = async(req, res) => {
    console.log("Body: ", req.query)

    if(!req.query.org || !req.query.sid) {
        console.log("Field required")
        return res.status(400).send({
            message: "Provide required input fields to assign Device"
        });
    }

    Orgs.findOne({"name": req.query.org})
    .then(async (data)=>{
        if(data != null){
            let orgid = data.id

            let dsdict = await getDsList()

            let devsch = getschema(orgid)

            devsch.find({ "sid": req.query.sid })
            .then(data => {
                if(data) {
                    for(let i=0; i<data.length; i++){
                        if(data[i].dsid != null){
                            data[i]["dsid"] = ""+data[i].dsid+","+dsdict[data[i].dsid]
                        }
                    }
                    res.status(200).send(data);
                }
                else {
                    console.log("No devices found under the spot.")
                    res.status(200).send({message: []});
                }
            })
            .catch(err=>{
                console.log("Error while accessing Device Info - ", err)
            })
        }
        else{
            console.log("Org dows not exists")
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org Info - ", err)
    })

}

function insertdevice(req, res, devsch, orgid){
    let ndev = req.body.device
    ndev['rdate'] = null
    ndev['user'] = req.user.user.user

    const ntdev = new devsch(ndev);
    ntdev.save()
    .then(data => {
        //console.log("Assign Device success: ", data)
        res.status(200).send({message: data});
        // once device assigned, then update the Stock record status as Taken
        stockctrl.updtdevicetaken(orgid, req.body.device.hwsl)
    }).catch(err => {
        console.log("Assign Device  failed: ", err)
        res.status(500).send({
            message: err.message || "Error occurred while Assigning Device"
        });
    });
}

exports.removedevice = (req, res) => {
    console.log("Remove Device: ", req.body)

    if(!req.body.sid || !req.body.hwsl || !req.body.rdate){
        return res.status(400).send({
            message: "Provide required input fields to remove the device"
        });
    }

    Orgs.findOne({"name": req.body.orgname})
    .then(data=>{
        if(data != null){
            let orgid = data.id
            let devsch = getschema(orgid)

            let filter = {}
            filter["hwsl"] = req.body.hwsl
            filter["sid"] = req.body.sid
            filter["rdate"] = null  

            let update = {}
            update["rdate"] = req.body.rdate

            devsch.findOneAndUpdate(filter, update, { new: true })
            .then(data=>{
                if(data != null){
                    console.log("Device Removal Success")
                    res.status(200).send({message: "Device removal success"})
                    stockctrl.updtdeviceready(orgid, req.body.hwsl)
                }
                else{
                    console.log("Device Removal failed")
                    return res.status(200).send({message: "Device removal failed"})
                }
            })
            .catch(err=>{
                console.log("Error while update Device record: ", err)
                return res.status(500).send({message: "Error while accessing Database"});
            })

        }
        else{
            console.log("Org dows not exists")
            res.status(400).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org Info - ", err)
        res.status(500).send({
            message: err.message || "Error occurred while accessing Org Info"
        });
    })
}

exports.getorgdevlocal = async (orgname) => {
    return new Promise( async function(resolve, reject) {
        
        Orgs.findOne({"name": orgname})
        .then(data=>{
            if(data != null){
                let orgid = data.id
                let devsch = getschema(orgid)

                let filter = {}
                filter["rdate"] = null  

                devsch.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
                .then(data=>{
                    if(data.length > 0){
                        resolve(data)
                    }
                    else{
                        reject("No devices found")
                    }
                })
                .catch(err=>{
                    console.log("Error while update Device record: ", err)
                    reject("Error while accessing database")
                })

            }
            else{
                console.log("Org dows not exists")
                reject("Org does not exist")
            }
        })
        .catch(err=>{
            console.log("Error while accessing Org Info - ", err)
            reject("Error while accessing Org DB")
        })
    })
}
