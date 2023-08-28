/*############################################################################
# 
# Module: dmd.controller.js
#
# Description:
#     Controller for Managing Org module
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
#     V2.0.0 Mon July 29 2023 11:15:21 seenivasan
#       Module created
############################################################################*/

const Dmd = require('../models/dmd.model')

const dbmodel = ["hwsl", "boardrev", "fwver", "technology", "network", "region", "remarks", 
                 "adate", "userid"]


exports.createDmd = async (sdata, user) => {
    try{
        const eres = await checkdmdexists(sdata.hwsl)
        if(eres){
            return({result: "OK", msg: "record exist for the device"})
        }
        else{
            try{
                let insres = await insertdmd(sdata, user)
                return({result: "OK", msg: "master record created"})

            }
            catch(err){
                return({result: "FAIL", msg: "could not create master record"})
            }
            
        }

    }catch(err){
        console.log("Error: ", err)
        return ({result: "FAIL", msg: "Error while accessing the DB"})
    }
}

exports.updateDmd = async (req, res) => {
    
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to delete the record"
        });
    }

    if(!req.body.edata || !req.body.mdata){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    let update = {}
    let nkeys = Object.keys(req.body.mdata)
    
    for(items in nkeys){
        if(dbmodel.includes(nkeys[items])){
            update[nkeys[items]] = req.body.mdata[nkeys[items]]
        }
    }
    update['userid'] = req.user.user.user

    Dmd.findOneAndUpdate(req.body.edata, update, { new: true })
    .then(data=>{
        if(data != null){
            return res.status(200).send({message: "Device Master record edit success"})
        }
        else{
            return res.status(200).send({message: "Device Master record edit failed"})
        }
    })
    .catch(err=>{
        console.log("Error while update Device Master record: ", err)
        return res.status(500).send({message: "Error while accessing Database"});
    })
}

exports.listDmdAll = async (req, res) => {
    Dmd.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data) {
			return res.status(200).send(data);
		}
		else {
			return res.status(400).send({message: "No records found"});
		}
	})
	.catch(err => {
		return res.status(500).send({message: "Error while accessing Database"});
	});
}

exports.listDmdOne = async (req, res) => {
    let filter = {hwsl: req.params.hwsl}
    Dmd.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data) {
            res.status(200).send(data[0]);
		}
		else {
			res.status(400).send({message: "No records found"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing Database"});
	}); 
}

exports.appendDmd = async (req, res) => {
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to delete the record"
        });
    }

    if(!req.body.mdata){
        return res.status(400).send({
            message: "Input field missing"
        });
    }

    Dmd.findOne(req.body.mdata).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
    .then( async (data) => {
        if(data) {
            res.status(200).send({message: "Record already exists"});
		}
		else {
			try{
                let insres = await insertdmd(req.body.mdata, req.user.user.user)
                return res.status(200).send({message: "master record append success"})

            }
            catch(err){
                console.log("could not append mastervrecord: ", err)
                return res.status(200).send({message: "could not append master record"})
            }
		}
	})
	.catch(err => {
        console.log("Err while accessing db: ", err)
		res.status(500).send({message: "Error while accessing Database"});
	}); 
}

exports.getOneDmdAfm = async (req, res) => {
    if(!req.body.mdata){
        return res.status(400).send({
            message: "Input field missing"
        });
    }
    Dmd.findOne(req.body.mdata).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data) {
            res.status(200).send(data);
		}
		else {
			res.status(400).send({message: "No records found"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing Database"});
	}); 
}


exports.getTrackDmd = async (req, res) => {
    let filter = {hwsl: req.params.hwsl}
    Dmd.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data) {
        	res.status(200).send(data);
		}
		else {
			res.status(400).send({message: "No records found"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing Database"});
	}); 
}

exports.deleteDmd = async (req, res) => {
    if(!req.body.mdata){
        return res.status(400).send({
            message: "Input field missing"
        });
    }
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to delete the record"
        });
    }
    
    Dmd.findOne(req.body.mdata)
    .then(data=>{
        if(data != null){
            Dmd.findOneAndDelete(req.body.mdata)
            .then(data=>{
                if(data != null){
                    res.status(200).send({message: "Device Master record delete success"})
                }
                else{
                    res.status(200).send({message: "Device Master record does not exist-02"})
                }
            })
            .catch(err=>{
                console.log("Error while removing Device Master record: ", err)
                res.status(500).send({message: "Error while removing Device Master record"})
            })
        }
        else{
            res.status(200).send({message: "Device Master record does not exist-01"})
        }
    })
    .catch(err=>{
         return res.status(500).send({
            message: "Error when accessing DB: " + err
        });
    })
}


exports.listDmdOnePerHw = async (req, res) => {
    Dmd.aggregate([{$group: {_id: "$hwsl", doa: {$max: "$doa"}}}])
    .then(async(data) => {
        if(data){
            try{
                let dresp = await getOneDmdForAllHw(data)
                res.status(200).send(dresp)
            }catch(err){
                res.status(500).send({message: "Error while accessing Database"});
            }
        }
        else{
            res.status(200).send({message: "Error while reading group by"})
        }
        
    })
    .catch(err => {
		res.status(500).send({message: "Error while accessing Database"});
	}); 
}


async function getOneDmdForAllHw(datarec){
    return new Promise(function(resolve, reject) {
        let orary = []
        for(let i=0; i<datarec.length; i++){
            let andary = []
            andary.push({hwsl: datarec[i]["_id"]})
            andary.push({doa: datarec[i]["doa"]})
            let mydict = {$and: andary}
            orary.push({$and: andary})
        }
        let filter = {$or: orary}

        Dmd.find(filter)
        .then(data => {
            resolve(data)
        })
        .catch(err => {
            reject(err)
        }); 
          
    })
}

async function insertdmd(sdata, user){
    return new Promise(function(resolve, reject) {
        let ndmd = {}
        
        let bkeys = Object.keys(sdata)

        for(item of dbmodel){
            if (bkeys.includes(item)){
                ndmd[item] = sdata[item]     
            }
            else{
                ndmd[item] = null
            }
        }

        ndmd["userid"] = user
    
        const ntdmd = new Dmd(ndmd);
        ntdmd.save()
        .then(data => {
            resolve(data)
        }).catch(err => {
            reject(err)
        });
    })
}

async function checkdmdexists(hwsl){
    return new Promise(function(resolve, reject) {
        const filter = {$and:[{"hwsl": hwsl},{"adate": null}]}
        Dmd.find(filter)
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