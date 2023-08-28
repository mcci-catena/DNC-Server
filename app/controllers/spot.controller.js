/*############################################################################
# 
# Module: location.controller.js
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

const Orgs = require('../models/org.model.js');

const orgctrl = require('./org.controller')

const devctrl = require('./device.controller')

const dbmodel = ["latitude","longitude", "sid", "sname", "status"]

const mathfn = require('../misc/mathutil.js');

const mongoose = require('mongoose');

exports.getschema = (orgid, tags) => {

    let spotsch
    try {
        spotsch = mongoose.model('spots'+orgid)
        console.log("Spot Schema exists: ", spotsch)
    }catch (error){
        spotsch = mongoose.model('spots'+orgid, getSpotSchema(tags))
        console.log("Spot Schema not exists: ", spotsch)
    }
    finally{
        return spotsch
    }
    // return mongoose.model('spots'+orgid, getSpotSchema(tags))
}

function getschema(orgid, tags){
    let spotsch
    try {
        spotsch = mongoose.model('spots'+orgid)
        console.log("Spot Schema exists: ", spotsch)
    }catch (error){
        spotsch = mongoose.model('spots'+orgid, getSpotSchema(tags))
        console.log("Spot Schema not exists: ", spotsch)
    }
    finally{
        return spotsch
    }
    // return mongoose.model('spots'+orgid, getSpotSchema(tags))
}

getSpotSchema = (tags) => {
    let mschema = {} 
    mschema["latitude"] = {"type": "String"}
    mschema["longitude"] = {"type": "String"}
    mschema["sid"] = {"type": "String"}
    mschema["sname"] = {"type": "String"}
    
    // Add all tags related to the Org
    for(i=0; i<tags.length; i++)
    {
        mschema[tags[i].toLowerCase()] = {"type": "String"}
    }

    mschema["status"] = {"type": "String"}
    mschema["user"] = {"type": "String"}

    console.log("Spot Schema: ", tags, mschema)
            
    const spotSchema = mongoose.Schema(mschema, {timestamps: true})
    return spotSchema
}

exports.addnewspot = async (req, res) => {
    console.log("Add New Spot begin: ", req.params.orgname, req.body);

    if(!req.body.sname || !req.params.orgname) {
        return res.status(400).send({
            message: "Provide required input fields to create Location"
        });
    }

    Orgs.findOne({"name": req.params.orgname})
    .then(data=>{
        if(data != null){
            let orgid = data.id
            let tags = data.tags

            let spotsch = getschema(orgid, tags)

            spotsch.findOne({"sname": req.body.sname})
            .then(function(data){
                if(data == null){
                    console.log("start to insert spot")
                    insertspot(req, res, spotsch, tags)
                }
                else{
                    console.log("Spot exist in the record")
                    res.status(403).send({message: "Spot exists in the record"})
                }
            })
            .catch((err) => {
                console.log("Error occurred while fetching Spot info: ", err)
                res.status(500).send({
                    message: err.message || "Error occurred while fetching Spot info"
                });
            });
        }
        else{
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org Info - ", err)
    })
}

function insertspot(req, res, spotsch, tags){
    let bkeys = Object.keys(req.body)
    
    let nspot = {}

    for(item of dbmodel){
        if (bkeys.includes(item)){
            nspot[item] = req.body[item]     
        }
        else{

            nspot[item] = ''
        }
    }
    
    for(nitem of tags){
        let item = nitem.toLowerCase()
        if (bkeys.includes(item)){
            nspot[item] = req.body[item]     
        }
        else{
            nspot[item] = ''
        }
    }

    nspot["user"] = req.user.user.user
    nspot["sid"] = mathfn.GenerateRandom()

    const ntspot = new spotsch(nspot);
    ntspot.save()
    .then(data => {
        res.status(200).send({message: data});
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while configuring Spot."
        });
    });
}

exports.listspots = (req, res) => {

    if(!req.params.orgname) {
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    Orgs.findOne({"name": req.params.orgname})
    .then(data=>{
        if(data != null){
            let orgid = data.id
            let tags = data.tags

            let spotsch = getschema(orgid, tags)

            spotsch.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
            .then(data => {
                if(data) {
                    res.status(200).send(data);
                }
                else {
                    console.log("Stocks not found: ", data);
                    res.status(400).send({message: "No records found"});
                }
            })
            .catch(err => {
                res.status(500).send({message: "Error while accessing DB"});
            });
        }
        else{
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org: ", err)
    })
}


async function listspotlocal (orgname){
    return new Promise( async function(resolve, reject) {
        Orgs.findOne({"name": orgname})
        .then(data=>{
            if(data != null){
                let orgid = data.id
                let tags = data.tags
                let spotsch = getschema(orgid, tags)
                spotsch.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
                .then(data => {
                    if(data) {
                        resolve(data);
                    }
                    else {
                        reject("no records found");
                    }
                })
                .catch(err => {
                    reject("Error while accessing DB");
                });
            }
            else{
                reject("Org does not exist")
            }
        })
        .catch(err=>{
            console.log("Error while accessing Org: ", err)
            reject("Error while accessing Org")
        })
    })
}


exports.getspot = async (sname, orgid, tags) => {
    return new Promise(function(resolve, reject) {
        const Spot = getschema(orgid, tags)
        const filter = {"sname": sname}
        Spot.findOne(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
        .then(data => {
            resolve(data.sid)
            if(data.hasOwnProperty("sid")){
                resolve(data.sid)
            }
            else {
                resolve(null)
            }
        })
        .catch(err => {
            resolve(null)
        });
    })
}


exports.updtspot = (req, res) => {
    console.log("Update Spot Begin")

    if(!req.body.data || !req.body.new || !req.params.sname || !req.body.orgname){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    if(req.params.sname !== req.body.data.sname){
        return res.status(400).send({
            message: "Spot name mismatch, check input data"
        });
    }
    
    Orgs.findOne({"name": req.body.orgname})
    .then(data=>{
        if(data != null){
            let orgid = data.id
            let tags = data.tags
            let spotsch = getschema(orgid, tags)

            let filter = {sid: req.body.data.sid, sname: req.body.data.sname}
            let update = req.body.new

            spotsch.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
            .then(data=>{
                if(data != null){
                    console.log("Spot record update success: ", data)
                    return res.status(200).send({message: "Spot record update success"})
                }
                else{
                    console.log("Spot record update failed")
                    return res.status(403).send({message: "Spot record update failed"})
                }
            })
            .catch(err=>{
                console.log("Error while update Spot: ", err)
                return res.status(403).send({message: "Error while updating Spot record"})
            })
        }
    })
    .catch(err=>{
        console.log("Error while update Spot record: ", err)
        return res.status(500).send({message: "Error while accessing Database"});
    })
}


exports.removespot = (req, res) => {
    if(!req.body.data || !req.body.removedOn){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    let olddict = req.body.data

    if(!olddict.locid || !olddict.location || !olddict.technology ||
        !olddict.network || !olddict.model || !olddict.installedOn ||  
        !olddict.lastUpdtOn || !olddict.status) {
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    let filter = {}

    for(items in dbmodel){
        filter[dbmodel[items]] = req.body.data[dbmodel[items]] 
    }

    let update = {removedOn: req.body.removedOn}
                
    Gateway.findOneAndUpdate(filter, update, { new: true })

    .then(data=>{
        if(data != null){
            res.status(200).send({message: "Gateway remove success"})
        }
        else{
            res.status(200).send({message: "Gateway does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while remove Gateway: ", err)
    })
}

exports.deleteSpot= (req, res) => {
    console.log("Delete Spot Begin: ", req.params.sname, req.body)
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to delete the record"
        });
    }

    Orgs.findOne({"name": req.body.org})
    .then(data=>{
        if(data != null){
            let orgid = data.id
            let tags = data.tags

            let spotsch = getschema(orgid, tags)

            spotsch.findOneAndDelete({"sname": req.body.sname, "sid": req.body.sid})
            .then(data=>{
                if(data != null){
                    console.log("Spot record delete success")
                    res.status(200).send({message: "Spot record delete success"})
                }
                else{
                    console.log("Spot record does not exist")
                    res.status(200).send({message: "Spot record does not exist"})
                }
            })
            .catch(err=>{
                console.log("Error while removing Stock record: ", err)
                res.status(500).send({message: "Error while removing stock record"})
            })

        }
        else{
            res.status(400).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org: ", err)
        res.status(400).send({
            message: "Error while accessing Org"
        });
    })
}

exports.listspotmaps = async(req, res) => {

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    try{
        let spotresp = await listspotlocal(req.params.orgname)
        let filtspot = {}
        for(let i=0; i<spotresp.length; i++){
            filtspot[spotresp[i].sid] = spotresp[i].sname
        }
        console.log("For the Org: ", req.params.orgname)
        console.log("Response: ", filtspot)
        try{
            let devresp = await devctrl.getorgdevlocal(req.params.orgname)
            let filtdev = []
            for(let i=0; i<devresp.length; i++){
                let mydict = {}
                mydict["sname"] = filtspot[devresp[i].sid]
                mydict["devtype"] = devresp[i].devtype
                mydict["devid"] = devresp[i].devid
                filtdev.push(mydict)
            }
            console.log("Devices: ", filtdev)
            res.status(200).send(filtdev);
        }catch(err){
            res.status(500).send({ message: "Error while Spot Info: "+err });
        }
        
    }catch(err){
        res.status(500).send({ message: "Error while Spot Info: "+err });
    }
}

exports.getAllSpotCounts = async(onlist) => {
    return new Promise(async function(resolve, reject) {
        // console.log("Get All Spot Counts: ", onlist)
        let spdict = {}
        for(let i=0; i<onlist.length; i++){
            spdict[onlist[i]["name"]] = 0
            try{
                let spotsch = getschema(onlist[i].id, onlist[i].tags)
                await spotsch.countDocuments({}, function(err, cnt){
                    if(cnt != null){
                        spdict[onlist[i]["name"]] = cnt
                    }
                    // else{
                    //     console.log(err)
                    //     onlist[i]["tspots"] = 0
                    // }
                })
            }
            catch(error){
                console.log("Schema Error: ", error)
            }
            
        }
        resolve(spdict)
    })
}
