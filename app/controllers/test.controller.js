/*############################################################################
# 
# Module: test.orgcontroller.js
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
#     V2.0.0 Mon April 17 2023 11:15:21 seenivasan
#       Module created
############################################################################*/

const Tstock = require('../models/stock.model')
const dbmodel = ["hwsl", "devID", "devEUI", "idate", "odate", "remarks", "dsid", "org", "user", "status", "boardRev", "fwver", "fwupdtdon", "technology", "region"]

exports.addstock = async (req, res) => {
    if(!req.body.hwsl || !req.body.idate) {

        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    try{
        const eres = await checkstockexists(req)
        console.log(eres)
        if(eres){
            res.status(200).send({message: "Device exists in the record"})
        }
        else{
            console.log("Insert Stock")
            insertstock(req, res)
        }

    }catch(err){
        res.status(500).send({
            message: err.message || "Error occurred while reading the devices."
        });
    }
}


function insertstock(req, res){
    let nstock = {}

    let bkeys = Object.keys(req.body)
    console.log("Bkeys: ", bkeys)
   
    for(item of dbmodel){
        if (bkeys.includes(item)){
            nstock[item] = req.body[item]     
        }
        else{
            nstock[item] = null
        }
    }

    // nstock["status"] = req.body.status ? req.body.status : null
    // nstock["org"] = req.body.org ? req.body.org : null
    // nstock["user"] = req.user.user ? req.user.user : "srini"
    nstock["user"] = "srini"
    
    console.log("Before Save: ", nstock)

    const ntstock = new Tstock(nstock);
    ntstock.save()
    .then(data => {
        res.status(200).send(data);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while configuring Device."
        });
    });
}


async function checkstockexists(req){
    return new Promise(function(resolve, reject) {
        
        const filter = {$and:[{"hwsl": req.body.hwsl},{"odate": null}]}
        Tstock.find(filter)
        .then(data => {
            console.log("Check hwstock data: ", data)
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


exports.liststock = async (req, res) => {
    console.log("List Stock")
    let filter = {}
    if(req.params.orgid){
        filter = {$and:[{"org": req.params.orgid}, {"odate": null}, {"status": "ready"}]}
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