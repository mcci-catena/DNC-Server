/*############################################################################
# 
# Module: hw.controller.js
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

const Hwmr = require('../models/hw.model')

const dbmodel = ["hwsl", "boardrev", "fwver", "tech", "network", "region", "remarks", 
                 "adate", "userid"]

exports.addhwlocal = async (hdata, user) => {
    return new Promise( async function(resolve, reject) {
        try{
            let insres = await inserthw(hdata, user)
            resolve(insres)
        }
        catch(err){
            reject("Error occurred while creating hw record")
        }
    })
}

async function inserthw(hdata, user){
    return new Promise(function(resolve, reject) {
        let nstock = {}

        let bkeys = Object.keys(hdata)

        for(item of dbmodel){
            if (bkeys.includes(item)){
                nstock[item] = hdata[item]     
            }
            else{
                nstock[item] = null
            }
        }

        nstock['remarks'] = hdata.remarks ? hdata.remarks : "Newly added"
        nstock["userid"] = user
    
        const ntstock = new Hwmr(nstock);
        ntstock.save()
        .then(data => {
            resolve(data)
        }).catch(err => {
            reject(err)
        });
    })
}

exports.getTrackHw = async (req, res) => {
    let filter = {hwsl: req.params.hwsl}
    Hwmr.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0}).sort({"adate": -1})
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

exports.updatehw = (req, res) => {

    console.log("Update HW --")
    
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }
    
    if(!req.body.edata || !req.body.ndata){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    let filter = req.body.edata
    let update = req.body.ndata

    update['userid'] = req.user.user.user

    Hwmr.findOneAndUpdate(filter, update, { new: true })
    .then(data=>{
        if(data != null){
            console.log("Update HW Success")
            console.log(data)
            res.status(200).send({message: "Device record update success"})
        }
        else{
            console.log("Update HW failed")
            res.status(200).send({message: "Device record update failed"})
        }
    })
    .catch(err=>{
        console.log("Update HW Error: ", err)
        res.status(500).send({message: "Error while accessing Device Records"});
    })
}

exports.appendhw = async(req, res) => {

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    console.log("Append HW:  ", req.body.hwdata)
    
    if(!req.body.hwdata){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    try{
        const eres = await checkhwmrexists(req.body.hwdata)
        if(eres){
            res.status(200).send({message: "Device exists in the record"})
        }
        else{
            try{
                let hwstat = inserthw(req.body.hwdata, req.user.user.user)
                console.log("Append HW local success")
                return res.status(200).send({
                    message: "Add request completed!"
                }); 
            }catch(err){
                console.log("Append HW local failed")
                res.status(500).send({
                    message: err
                }); 
            }
        }
    }catch(err){
        console.log("Append HW local failed")
        res.status(500).send({
            message: err
        }); 
    }
}

async function checkhwmrexists(hwdata){
    return new Promise(function(resolve, reject) {
        let filter = hwdata
        Hwmr.find(filter)
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
