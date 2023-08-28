/*############################################################################
# 
# Module: gateway.controller.js
#
# Description:
#     Controller for Manage Gateway module
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
#     V2.0.0 Tue April 11 2023 11:15:21 seenivasan
#       Module created
############################################################################*/
const Gateway = require('../models/gateway.model')
const Gwmr = require('../models/gateway.model')
const Orgs = require('../models/org.model.js');

const mathfn = require('../misc/mathutil.js');

const dbmodel = ["name", "hwid", "simmk", "orgid", "location", "ssusc", "tech", "network", "model", "status",
                "lactive", "remarks", "adate", "userid"]

// List gateways
exports.listgws = async (req, res) => {
    
    let filter = {}
    if(req.params.orgid){
        filter = {"orgid": req.params.orgid}
    }
    
	Gateway.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
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


exports.addnewgw = (req, res) => {
    
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    console.log("Add New GW: ", req.body)

    if(!req.body.name || !req.body.hwid ) {

        return res.status(400).send({
            message: "Provide required input fields to add Gateway"
        });
    }

    let gdata = {}
    let bkeys = Object.keys(req.body)

    for(item of dbmodel){
        if (bkeys.includes(item)){
            gdata[item] = req.body[item]     
        }
        else{
            gdata[item] = null
        }
    }

    gdata["userid"] = req.user.user.user

    Gwmr.findOne({$or: [{name: req.body.name}, {hwid: req.body.hwid}]})
    .then(function(data){
        if(data){
            res.status(200).send({message: "Gateway exists in the record"})
        }
        else{
            gdata["gwid"] = mathfn.GenerateRandom()
            const gateway = new Gwmr(gdata);
            gateway.save()
            .then(data => {
                res.status(200).send({message: "Gateway added success"});
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Error occurred while configuring Gateway."
                });
            }); 
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while reading the Gateways."
        });
    });  
}

exports.updtgw = (req, res) => {

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

    Gwmr.findOne(filter)
    .then(function(data){
        if(data){
            let update = {}
            let nkeys = Object.keys(req.body.ndata)
            
            for(items in nkeys){
                if(dbmodel.includes(nkeys[items])){
                    update[nkeys[items]] = req.body.ndata[nkeys[items]]
                }
            }

            update["user"] = req.user.user.user
            
            Gwmr.findOneAndUpdate(filter, update, { new: true })
            .then(data=>{
                if(data != null){
                    res.status(200).send({message: "Gateway record edit success"})
                }
                else{
                    res.status(200).send({message: "Gateway record edit failed"})
                }
            })
            .catch(err=>{
                console.log("Error while update Gateway: ", err)
            })

        }
        else{
            res.status(200).send({message: "Gateway does not exist in the record"})
        }
    })
    .catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while reading the devices."
        });
    });  
}


exports.appendgw = (req, res) => {
    console.log("Append GW:  ", req.body)
 
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    if(!req.body.gdata){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    // gdata["gwid"] = mathfn.GenerateRandom()
    
    const gateway = new Gwmr(gdata);
    gateway.save()
    .then(data => {
        res.status(200).send({message: "Append Gateway success"});
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error while appending Gateway"
        });
    }); 
    

    try{
        let ssustat = insertssu(req.body.ssdata, req.user.user.user)
        console.log("Append SSU local success")
        return res.status(200).send({
            message: "Add request completed!"
        }); 

    }catch(err){
        console.log("Append SSU local failed")
        res.status(500).send({
            message: err
        }); 
    }

}


exports.removegw = (req, res) => {
    if(!req.body.data || !req.body.removedOn){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    let olddict = req.body.data

    if(!olddict.gwid || !olddict.location || !olddict.technology ||
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
        res.status(400).send({message: "Error while removing Gateway"})
    })
}

exports.deleteGw = (req, res) => {

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    if(!req.body.gwid){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    Gateway.findOneAndDelete({name: req.params.name, gwid: req.body.gwid, orgid: {$eq: null}})
    .then(data => {
        if(data != null){
            res.status(200).send({message: "Gateway delete success"})
        }
        else{
            res.status(200).send({message: "Gateway does not exist or assigned to an Org"})
        }
    })
    .catch(err=>{
        console.log("Error while deleting Gateway: ", err)
        res.status(400).send({message: "Error while deleting Gateway"})
    })

}

exports.listOrgGw = (req, res) => {
    
    if(!req.params.orgname) {
        return res.status(400).send({
            message: "Provide required input fields to get Org Users"
        });
    }

    Orgs.findOne({"name": req.params.orgname})
    .then(data=>{
        if(data != null){
            let gwlist = data.gateways
    
            Gateway.find({"gwid": {$in: gwlist}})
            .then(data=>{
                if(data != null){
                    res.status(200).send({message: data})
                }
                else{
                    res.status(200).send({message: "Users not in the record"})
                }
            })
            .catch(err=>{
                console.log("Error while accessing Users: ", err)
            })
        }
        else{
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org: ", err)
    })
}

exports.updategw = (req, res) => {

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

    Gwmr.findOneAndUpdate(filter, update, { new: true })
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

exports.appendgw = async(req, res) => {

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    console.log("Append HW:  ", req.body.gwdata)
    
    if(!req.body.gwdata){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    try{
        const eres = await checkgwmrexists(req.body.gwdata)
        if(eres){
            res.status(200).send({message: "Device exists in the record"})
        }
        else{
            try{
                let hwstat = insertgw(req.body.gwdata, req.user.user.user)
                console.log("Append HW local success")
                return res.status(200).send({
                    message: "Add request completed!"
                }); 
            }catch(err){
                console.log("Append GW local failed: ", err)
                res.status(500).send({
                    message: err
                }); 
            }
        }
    }catch(err){
        console.log("Append GW local failed: ", err)
        res.status(500).send({
            message: err
        }); 
    }
}

async function checkgwmrexists(hwdata){
    return new Promise(function(resolve, reject) {
        let filter = hwdata
        Gwmr.find(filter)
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

async function insertgw(hdata, user){
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
    
        const ntstock = new Gwmr(nstock);
        ntstock.save()
        .then(data => {
            resolve(data)
        }).catch(err => {
            reject(err)
        });
    })
}

exports.listOnePerGwmr = async (req, res) => {
    Gwmr.aggregate([{$group: {_id: "$hwid", adate: {$max: "$adate"}}}])
    .then(async(data) => {
        if(data){
            try{
                let dresp = await getOneMrForAllGw(data)
                console.log("GW Resp OK: ", dresp)
                res.status(200).send(dresp)
            }catch(err){
                console.log("Error while reading group by GW: ", err)
                res.status(500).send({message: "Error while accessing Database"});
            }
        }
        else{
            console.log("Error while reading group by GW")
            res.status(200).send({message: "Error while reading group by"})
        }
        
    })
    .catch(err => {
        console.log("GW Error-1: ", err)
		res.status(500).send({message: "Error while accessing Database"});
	}); 
}


// exports.listOnePerGwmr = async (req, res) => {
//     Gwmr.aggregate([{$group: {_id: "$hwid", adate: {$max: "$adate"}}}])
//     .then(async(data) => {
//         if(data){
//             try{
//                 let dresp = await getOneMrForAllGw(data)
//                 console.log("GW Resp OK: ", dresp)
//                 res.status(200).send(dresp)
//             }catch(err){
//                 console.log("Error while reading group by GW: ", err)
//                 res.status(500).send({message: "Error while accessing Database"});
//             }
//         }
//         else{
//             console.log("Error while reading group by GW")
//             res.status(200).send({message: "Error while reading group by"})
//         }
        
//     })
//     .catch(err => {
//         console.log("GW Error-1: ", err)
// 		res.status(500).send({message: "Error while accessing Database"});
// 	}); 
// }


exports.listOnePerGwmrLocal = async () => {
    return new Promise( async function(resolve, reject) {
        console.log("GW Local: ")
        Gwmr.aggregate([{$group: {_id: "$hwid", adate: {$max: "$adate"}}}])
        .then(async(data) => {
            if(data){
                try{
                    let dresp = await getOneMrForAllGwLocal(data)
                    // console.log("GW Resp OK: ", dresp)
                    resolve(dresp)
                }catch(err){
                    console.log("Error while reading group by GW: ", err)
                    reject("Error while accessing Database");
                }
            }
            else{
                reject("Error while reading group by")
            }
        })
    })
    .catch(err => {
        console.log("GW Error-1: ", err)
		reject("Error while accessing Database")
	}); 
}


async function getOneMrForAllGwLocal(datarec){
    return new Promise(function(resolve, reject) {
        let orary = []
        for(let i=0; i<datarec.length; i++){
            let andary = []
            andary.push({hwid: datarec[i]["_id"]})
            andary.push({adate: datarec[i]["adate"]})
            let mydict = {$and: andary}
            orary.push({$and: andary})
        }
        let filter = {$or: orary}

        Gwmr.find(filter).sort({"adate": -1}).select({"_id": 0, "name": 1, "orgid": 1})
        .then(data => {
            mygwdict = {}
            // console.log(data)
            
            for(let i=0; i<data.length; i++){
                mygwdict[data[i]["orgid"]] = mygwdict[data[i]["orgid"]] ? mygwdict[data[i]["orgid"]]: []
                mygwdict[data[i]["orgid"]].push(data[i]["name"])
            }
 
            console.log(mygwdict)
            resolve(mygwdict)
        })
        .catch(err => {
            console.log("GW Error: ", err)
            reject(err)
        }); 
          
    })
}


async function getOneMrForAllGw(datarec){
    return new Promise(function(resolve, reject) {
        let orary = []
        for(let i=0; i<datarec.length; i++){
            let andary = []
            andary.push({hwid: datarec[i]["_id"]})
            andary.push({adate: datarec[i]["adate"]})
            let mydict = {$and: andary}
            orary.push({$and: andary})
        }
        let filter = {$or: orary}

        Gwmr.find(filter).sort({"adate": -1})
        .then(data => {
            resolve(data)
        })
        .catch(err => {
            console.log("GW Error: ", err)
            reject(err)
        }); 
          
    })
}

exports.getTrackGw = async (req, res) => {
    console.log("Get Track Gw: ", req.params.gwname)
    let filter = {name: req.params.gwname}
    Gwmr.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0}).sort({"adate": -1})
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
