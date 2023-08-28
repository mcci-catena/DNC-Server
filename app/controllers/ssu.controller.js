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

const Ssumr = require('../models/ssu.model')

const dmdfn = require('./dmd.controller');
const stockctrl = require('./stock.controller');
const hwctrl = require('./hw.controller');

const dbmodel = ["batch", "ssuid", "ssutype", "ssuver", "ssustatus", "client", "location", 
                 "adate", "remarks", "userid"]

exports.addssu = async (req, res) => {

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    if(!req.body.sdata || !req.body.ssdata || !req.body.hdata) {
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    if(!req.body.ssdata.ssuid || !req.body.hdata.hwsl) {
        return res.status(400).send({
            message: "Provide required hw/ssu id"
        });
    }

    if(!req.body.sdata.dsid || !req.body.sdata.nwIdV || !req.body.sdata.nwIdK){
        return res.status(400).send({
            message: "Provide required config fields"
        }); 
    }

    // 1. Add the hwsl, device id, dsid, cid in stock record
    // 2. Add the hw data in hw master record   (DMR - HW)
    // 3. Add the ssu data in ssu master record (DMR - SSU)
    // Then finally send the response to the client

    try{
        let stockstat = stockctrl.addstocklocal(req.body.sdata, req.user.user.user)
        console.log("Add Stock local success")
        try{
            let hwstat = hwctrl.addhwlocal(req.body.hdata, req.user.user.user)
            console.log("Add Hw local success")
            try{
                let ssustat = insertssu(req.body.ssdata, req.user.user.user)
                console.log("Add SSU local success")
                return res.status(200).send({
                    message: "Add request completed!"
                }); 

            }catch(err){
                res.status(500).send({
                    message: err
                }); 
            }
        }catch(err){
            res.status(500).send({
                message: err
            }); 
        }
        
    }catch(err){
        res.status(500).send({
            // message: err.message || "Error occurred while accessing the devices in stock."
            message: err
        });
    }
}


async function insertssu(ssdata, user){
    return new Promise(function(resolve, reject) {
        let nstock = {}

        let bkeys = Object.keys(ssdata)

        for(item of dbmodel){
            if (bkeys.includes(item)){
                nstock[item] = ssdata[item]     
            }
            else{
                nstock[item] = null
            }
        }

        nstock['status'] = ssdata.remarks ? ssdata.remarks : "Newly added"
        nstock["userid"] = user
    
        const ntstock = new Ssumr(nstock);
        ntstock.save()
        .then(data => {
            resolve(data)
        }).catch(err => {
            reject(err)
        });
    })
}

async function checkssuexists(hwsl){
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

// async function insertssu(req){
//     return new Promise(function(resolve, reject) {
//         let nstock = {}

//         let bkeys = Object.keys(req.body.sdata)

//         for(item of dbmodel){
//             if (bkeys.includes(item)){
//                 nstock[item] = req.body.sdata[item]     
//             }
//             else{
//                 nstock[item] = null
//             }
//         }

//         nstock['status'] = req.body.sdata.status ? req.body.sdata.status : "Config"
//         nstock["userid"] = req.user.user.user
    
//         const ntstock = new Dssu(nstock);
//         ntstock.save()
//         .then(data => {
//             resolve(data)
//         }).catch(err => {
//             reject(err)
//         });
//     })
// }

exports.showallssu = async (req, res) => {
    Ssumr.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0}).sort({"adate": -1})
    .then(data => {
        if(data){
            res.status(200).send(data);
        }
        else{
            res.status(400).send({message: "No records found"});
        }
    })
    .catch(err => {
		res.status(500).send({message: "Error while accessing Device Records"});
	});
}

exports.updatessu = (req, res) => {

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

    Ssumr.findOneAndUpdate(filter, update, { new: true })
    .then(data=>{
        if(data != null){
            console.log("Update SSU Success")
            console.log(data)
            res.status(200).send({message: "Device record update success"})
        }
        else{
            console.log("Update SSU failed")
            res.status(200).send({message: "Device record update failed"})
        }
    })
    .catch(err=>{
        console.log("Update SSU Error: ", err)
        res.status(500).send({message: "Error while accessing Device Records"});
    })
}


exports.appendssu = (req, res) => {
    console.log("Append SSU:  ", req.body.ssdata)
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    if(!req.body.ssdata){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }
    
    try{
        let ssustat = insertssu(req.body.ssdata, req.user.user.user)
        // console.log("Append SSU local success")
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

exports.listDmdOnePerSsu = async (req, res) => {
    Ssumr.aggregate([{$group: {_id: "$ssuid", adate: {$max: "$adate"}}}])
    .then(async(data) => {
        if(data){
            try{
                let dresp = await getOneDmdForAllSsu(data)
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

async function getOneDmdForAllSsu(datarec){
    return new Promise(function(resolve, reject) {
        let orary = []
        for(let i=0; i<datarec.length; i++){
            let andary = []
            andary.push({ssuid: datarec[i]["_id"]})
            andary.push({adate: datarec[i]["adate"]})
            let mydict = {$and: andary}
            orary.push({$and: andary})
        }
        let filter = {$or: orary}

        Ssumr.find(filter).sort({"adate": -1})
        .then(data => {
            resolve(data)
        })
        .catch(err => {
            reject(err)
        }); 
          
    })
}

exports.getTrackDmd = async (req, res) => {
    let filter = {ssuid: req.params.ssuid}
    Ssumr.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0}).sort({"adate": -1})
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