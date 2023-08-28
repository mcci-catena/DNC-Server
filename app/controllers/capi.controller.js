/*############################################################################
# 
# Module: ds.controller.js
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

const Capi = require('../models/capi.model')

// List Data Source
exports.listapi = (req, res) => {

    console.log("Get API Config")

    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

	Capi.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
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

exports.listapilocal = () => {
    return new Promise( async function(resolve, reject) {
        Capi.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
        .then(data => {
            if(data) {
                resolve(data);
            }
            else {
                reject("No API config record found");
            }
        })
        .catch(err => {
            reject("Error while accessing API Config record");
        });
    })
}

exports.updateapi = async (req, res) => {

    console.log("Set API Config")
    
    if(req.user.user.level != "4"){
        return res.status(400).send({
            message: "User not authorized to update record"
        });
    }

    if(!req.body.adata.aurl || !req.body.adata.akey) {

        return res.status(400).send({
            message: "Provide required input fields"
        });
    }

    Capi.find().select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(data => {
		if(data.length <= 0) {
            console.log("Record does not Exists")
			// res.status(200).send(data);

            let ndict = {}
            ndict["sln"] = '1'
            ndict["aurl"] = req.body.adata.aurl
            ndict["akey"] = req.body.adata.akey
            ndict["apisf"] = req.body.adata.apisf ? req.body.adata.apisf: "/down/replace"
            ndict["nwidpf"] = req.body.adata.nwidpf ? req.body.adata.nwidpf: "eui-"

            const newsrc = new Capi(ndict);
            newsrc.save()
            .then(data => {
                console.log("Api Config added success")
                res.status(200).send({
                    message: "Api Config added success"
                });
            }).catch(err => {
                console.log("Api Config added failed", err)
                res.status(500).send({
                    message: err.message || "Error occurred while configuring Data Source."
                });
            });
		}
		else {
            console.log("Record exists")
            let filter = {sln: '1'}
            let update = {}
            update["aurl"] = req.body.adata.aurl
            update["akey"] = req.body.adata.akey
            update["apisf"] = req.body.adata.apisf ? req.body.adata.apisf: "/down/replace"
            update["nwidpf"] = req.body.adata.nwidpf ? req.body.adata.nwidpf: "eui-"

            Capi.findOneAndUpdate(filter, update, { new: true })
            .then(data=>{
                if(data != null){
                    console.log("Api Config Update Success")
                    res.status(200).send({message: "Api Config Update Success"})
                }
                else{
                    console.log("Api Config Update failed")
                    return res.status(200).send({message: "Api Config Update failed"})
                }
            })
            .catch(err=>{
                console.log("Error while update API Config record: ", err)
                return res.status(500).send({message: "Error while accessing Database"});
            })
      	}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing DB"});
	});
}

