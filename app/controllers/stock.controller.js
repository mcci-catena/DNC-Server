/*############################################################################
# 
# Module: stock.controller.js
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
#     V2.0.0 Fri Feb 24 2023 14:56:21 seenivasan
#       Module created
############################################################################*/

const Orgs = require('../models/org.model.js');
const Users = require('../models/user.model.js');
const Dsrc = require('../models/ds.model')

const Tstock = require('../models/stock.model')

const Stock = require('../models/stock.model')

const dmdfn = require('./dmd.controller');

const dbmodel = ["hwsl", "dsid", "nwIdV", "nwIdK", "idate", "odate", "orgid", 
                 "status", "remarks"]


exports.addstocklocal = async (sdata, user) => {
    return new Promise( async function(resolve, reject) {
        try{
            const eres = await checkstockexists(sdata.hwsl)
            if(eres){
                reject("Device exists in the record")
            }
            else{
                try{
                    let insres = await insertstocklocal(sdata, user)
                    resolve(insres)
                }
                catch(err){
                    reject("Error occurred while creating stock record")
                }
            }
    
        }catch(err){
            res.status(500).send({
                message: err.message || "Error occurred while accessing the devices in stock."
            });
        }
    })
}


async function insertstocklocal(sdata, user){
    return new Promise(function(resolve, reject) {
        let nstock = {}

        let bkeys = Object.keys(sdata)

        for(item of dbmodel){
            if (bkeys.includes(item)){
                nstock[item] = sdata[item]     
            }
            else{
                nstock[item] = null
            }
        }

        nstock['status'] = sdata.status ? sdata.status : "Config"
        nstock["userid"] = user
    
        const ntstock = new Stock(nstock);
        ntstock.save()
        .then(data => {
            resolve(data)
        }).catch(err => {
            reject(err)
        });
    })
}



exports.addstock = async (req, res) => {
    if(!req.body.sdata){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    try{
        const eres = await checkstockexists(req.body.sdata.hwsl)
        if(eres){
            res.status(200).send({message: "Device exists in the record"})
        }
        else{
            try{
                let insres = await insertstock(req)
                try{
                    let dmdres = await dmdfn.createDmd(req.body.sdata, req.user.user.user)
                    if(dmdres.result == "OK"){
                        res.status(200).send({message: "stock created success"})
                    }
                    else{
                        res.status(200).send({message: "Stock created but master record creation failed"})
                    }
                }
                catch(err){
                    res.status(200).send({message: "Stock created but master record creation failed"})
                }
            }
            catch(err){
                res.status(200).send({message: "Error occurred while creating stock record"})
            }
            
        }

    }catch(err){
        res.status(500).send({
            message: err.message || "Error occurred while reading the devices."
        });
    }
}

async function checkstockexists(hwsl){
    return new Promise(function(resolve, reject) {
        const filter = {$and:[{"hwsl": hwsl},{"odate": null}]}
        Stock.find(filter)
        .then(data => {
            if(data.length > 0){
                resolve(true)
            }
            else {
                resolve(false)
            }

        })
        .catch(err => {
            reject(err)
        });
    })
}

async function insertstock(req){
    return new Promise(function(resolve, reject) {
        let nstock = {}

        let bkeys = Object.keys(req.body.sdata)

        for(item of dbmodel){
            if (bkeys.includes(item)){
                nstock[item] = req.body.sdata[item]     
            }
            else{
                nstock[item] = null
            }
        }

        nstock['status'] = req.body.sdata.status ? req.body.sdata.status : "Config"
        nstock["userid"] = req.user.user.user
    
        const ntstock = new Stock(nstock);
        ntstock.save()
        .then(data => {
            resolve(data)
        }).catch(err => {
            reject(err)
        });
    })
}

exports.listStockAll= async (req, res) => {
    
    let dsdict = await getDsList()
    let orgdict = await getOrgList()

    Tstock.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data) {
            for(let i=0; i<data.length; i++){
                if(data[i].dsid != null){
                    data[i]["dsid"] = ""+data[i].dsid+","+dsdict[data[i].dsid]
                }
                if(data[i].orgid != null){
                    data[i]["orgid"] = ""+data[i].orgid+","+orgdict[data[i].orgid]
                }
            }
			res.status(200).send(data);
		}
		else {
			res.status(400).send({message: "No records found"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing DB"});
	});
    
}


exports.listAssigned = async (req, res) => {
    
    let dsdict = await getDsList()
    let orgdict = await getOrgList()

    const filter = {$or:[{"status": /^ready$/i}, {"status": /^taken$/i}]}

    Tstock.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data) {
            for(let i=0; i<data.length; i++){
                if(data[i].dsid != null){
                    data[i]["dsid"] = ""+data[i].dsid+","+dsdict[data[i].dsid]
                }
                if(data[i].orgid != null){
                    data[i]["orgid"] = ""+data[i].orgid+","+orgdict[data[i].orgid]
                }
            }
			res.status(200).send(data);
		}
		else {
			res.status(400).send({message: "No records found"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing DB"});
	});
    
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

async function getOrgList(){
    return new Promise(function(resolve, reject) {
        Orgs.find().select({"name": 1, "id": 1, "_id": 0})
        .then(data => {
            if(data.length > 0){
                let orgdict = {}
                for(let i=0; i<data.length; i++){
                    orgdict[data[i].id] = data[i].name
                }
                resolve(orgdict)
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

async function checkstockexists(hwsl){
    return new Promise(function(resolve, reject) {
        const filter = {$and:[{"hwsl": hwsl},{"odate": null}]}
        Tstock.find(filter)
        .then(data => {
            if(data.length > 0){
                resolve(true)
            }
            else {
                resolve(false)
            }

        })
        .catch(err => {
            reject(err)
        });
    })
}


exports.listStockOrg = async (req, res) => {
    let filter = {}
    if(req.params.orgid){
        filter = {$and:[{"orgid": req.params.orgid}, {"odate": null}, {"status": "ready"}]}
    }
    
	Tstock.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data) {
			res.status(200).send(data);
		}
		else {
			res.status(400).send({message: "No records found"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing DB"});
	});
}


// Input - hwsl
// output - devID, devEUI, dsid
exports.gethwconfig = async (hwsl, orgid) => {
    return new Promise(function(resolve, reject) {
        const filter = {$and:[{"hwsl": hwsl}, {"orgid": orgid}, {"odate": null}, {"status": "ready"}]}
        Tstock.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0 })
        .then(data => {
            if(data.length > 0){
                resolve(data[0])
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

exports.updtdevicetaken = async(orgid, hwsl) => {
    return new Promise(function(resolve, reject) {
        
        const filter = {$and:[{"hwsl": hwsl}, {"orgid": orgid}, {"odate": null}, {"status": /^ready$/i}]}
        const update = {"status": "Taken"}
        Tstock.findOneAndUpdate(filter, update, { new: true })
        .then(data=>{
            if(data != null){
                resolve("Stock record edit success")
            }
            else{
                resolve("Stock record edit failed")
            }
        })
        .catch(err=>{
            console.log("Error while update Gateway: ", err)
            reject("Stock update failed")
        })
    })
}

exports.updtdeviceready = async(orgid, hwsl) => {
    return new Promise(function(resolve, reject) {
        
        const filter = {$and:[{"hwsl": hwsl}, {"orgid": orgid}, {"odate": null}, {"status": /^taken$/i}]}
        const update = {"status": "Ready"}
        Tstock.findOneAndUpdate(filter, update, { new: true })
        .then(data=>{
            if(data != null){
                resolve("Stock record edit success")
            }
            else{
                resolve("Stock record edit failed")
            }
        })
        .catch(err=>{
            console.log("Error while update Gateway: ", err)
            reject("Stock update failed")
        })
    })
}

exports.updtstock = (req, res) => {
    
    if(!req.body.sdata){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    let filter = {hwsl: req.body.sdata.hwsl}

    let update = {}
    let nkeys = Object.keys(req.body.sdata)
    
    for(items in nkeys){
        if(dbmodel.includes(nkeys[items])){
            update[nkeys[items]] = req.body.sdata[nkeys[items]]
        }
    }

    update['userid'] = req.user.user.user

    Stock.findOneAndUpdate(filter, update, { new: true })
    .then(data=>{
        if(data != null){
            res.status(200).send({message: "Stock record edit success"})
        }
        else{
            res.status(200).send({message: "Stock record edit failed"})
        }
    })
    .catch(err=>{
        console.log("Error while update Stock: ", err)
    })
}

exports.deleteStock = (req, res) => {
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to delete the record"
        });
    }

    Stock.findOne({"hwsl": req.params.hwsl})
    .then(data=>{
        if(data != null){
            Stock.findOneAndDelete({"hwsl": req.params.hwsl})
            .then(data=>{
                if(data != null){
                    res.status(200).send({message: "Stock record delete success"})
                }
                else{
                    res.status(200).send({message: "Stock record does not exist"})
                }
            })
            .catch(err=>{
                console.log("Error while removing Stock record: ", err)
                res.status(500).send({message: "Error while removing stock record"})
            })
        }
        else{
            res.status(200).send({message: "Stock record does not exist"})
        }
    })
    .catch(err=>{
         return res.status(500).send({
            message: "Error when accessing DB: " + err
        });
    })
}