/*############################################################################
# 
# Module: subscription.controller.js
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

const Subs = require('../models/subscription.model.js');
const Orgs = require('../models/org.model.js');
const Stock = require('../models/stock.model')

const dbmodel = ["orgid", "splan", "sdate", "edate"]

exports.addSubs = async (req, res) => {
    if(!req.body.orgid || !req.body.splan || !req.body.sdate || !req.body.edate){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    Orgs.findOne({"id": req.body.orgid})
    .then(async data=>{
        if(data != null){
            const eres = await checksubexists(req.body.orgid)
            if(eres){
                res.status(200).send({message: "Plan already added for the Organization"})
            }
            else{
                const nsub = new Subs({orgid: req.body.orgid, splan: req.body.splan, 
                                        sdate: req.body.sdate, edate: req.body.sdate});
                nsub.save()
                .then(data => {
                    res.status(200).send({message: "Subscription added successfully"})
                }).catch(err => {
                    console.log("Subscription add failed : ", err)
                    res.status(200).send({message: "Error occurred while creating subscription record"})
                });
            }
        }
        else{
            res.status(200).send({message: "Organization does not exist"})
        }
    })
    .catch(err =>{
        res.status(500).send({
            message: err.message || "Error occurred while reading the devices."
        });
    })
}

exports.listSubsAll = async (req, res) => {

    let role = parseInt(req.user.user.level)

    if(role < 3 ){
        return res.status(400).send({
            message: "User not authorized to view the record"
        });
    }

    let orgdict = await getOrgList()
    let stockdict = await getStockList()

    console.log("OrgDict: ", orgdict)
    console.log("StockDict: ", stockdict)

    Subs.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data) {
            for(let i=0; i<data.length; i++){
                if(data[i].orgid != null){
                    // data[i]["orgid"] = ""+data[i].orgid+","+orgdict[data[i].orgid]+","+stockdict[data[i].orgid]
                    let orgid = data[i].orgid
                    let orgname = orgdict[data[i].orgid]
                    let devices = stockdict[data[i].orgid] ? stockdict[data[i].orgid] : "0"
                    // data[i]["orgid"] = {orgid: data[i].orgid, orgname: orgdict[data[i].orgid], devices: stockdict[data[i].orgid]}
                    data[i]["orgid"] = ""+orgid+","+orgname+","+devices
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

exports.updtSubs = async (req, res) => {

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to delete the record"
        });
    }

    if(!req.body.sdata || !req.body.edata.orgid || !req.body.edata.splan || 
        !req.body.edata.sdate || !req.body.edata.edate){
        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    let update = {}
    let nkeys = Object.keys(req.body.sdata)

    for(items in nkeys){
        if(dbmodel.includes(nkeys[items])){
            update[nkeys[items]] = req.body.sdata[nkeys[items]]
        }
    }

    Subs.findOneAndUpdate(req.body.edata, update, { new: true })
    .then(data=>{
        if(data != null){
            console.log("Subscription update Success")
            res.status(200).send({message: "Subscription updated Successfully"})
        }
        else{
            console.log("Subscription update failed")
            return res.status(200).send({message: "Subscription update failed"})
        }
    })
    .catch(err=>{
        console.log("Error while update Subscription record: ", err)
        return res.status(500).send({message: "Error while accessing Database"});
    })
}

exports.deleteSubs = async (req, res) => {

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to delete the record"
        });
    }

    if(!req.body.sdata.orgid || !req.body.sdata.splan || 
        !req.body.sdata.sdate || !req.body.sdata.edate){
        return res.status(400).send({
            message: "Input field missing"
        });
    }
    
    Subs.findOne(req.body.sdata)
    .then(data=>{
        if(data != null){
            Subs.findOneAndDelete(req.body.sdata)
            .then(data=>{
                if(data != null){
                    res.status(200).send({message: "Subscription record delete success"})
                }
                else{
                    res.status(200).send({message: "Subscription record does not exist"})
                }
            })
            .catch(err=>{
                console.log("Error while removing Subs record: ", err)
                res.status(500).send({message: "Error while removing Subscription record"})
            })
        }
        else{
            res.status(200).send({message: "Subscription record does not exist"})
        }
    })
    .catch(err=>{
        return res.status(500).send({
            message: "Error while accessing subscription record " + err
        });
    })
}

async function checksubexists(orgid){
    return new Promise(function(resolve, reject) {
        const filter = {orgid: orgid}
        Subs.find(filter)
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

async function getStockList(){
    return new Promise(function(resolve, reject) {
        // {$and:[{"hwsl": hwsl}, {"orgid": orgid}, {"odate": null}, {"status": /^ready$/i}]}
        Stock.find({$and: [{status: [/^ready$/i, /^taken$/i]},{idate: {$ne: null}}, {odate: {$eq: null}}] }).select({"orgid": 1, "id": 1, "_id": 0})
        .then(data => {
            if(data.length > 0){
                // let orgdict = {}
                // for(let i=0; i<data.length; i++){
                //     orgdict[data[i].id] = data[i].name
                // }
                const countdict = {}
                for(const org of data){
                    const orgid = org.orgid
                    countdict[orgid] =  (countdict[orgid] || 0) + 1;
                }
                // console.log(countdict)
                resolve(countdict)
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