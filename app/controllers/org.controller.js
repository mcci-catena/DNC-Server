/*############################################################################
# 
# Module: orgcontroller.js
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

const Orgs = require('../models/org.model.js');
const Users = require('../models/user.model.js');
const Gws = require('../models/gateway.model.js')

const gwctrl = require('./gateway.controller')
const spctrl = require('./spot.controller')

const mathfn = require('../misc/mathutil.js');


exports.listorgs = (req, res) => {
    Orgs.find()
	.then(async data => {
		if(data) {
            let onlist = []
            for(let i=0; i<data.length; i++){
                let odict = {}
                odict["name"] = data[i].name
                odict["id"] = data[i].id
                odict["tags"] = data[i].tags
                odict["tspots"] = 0
                onlist.push(odict)
            }
            let gwlist = await gwctrl.listOnePerGwmrLocal()
            let splist = await spctrl.getAllSpotCounts(onlist)
            for(let i=0; i<data.length; i++){
                data[i]["gateways"] = gwlist[data[i]["name"]] ? gwlist[data[i]["name"]] : []
                data[i]["locations"] = splist[data[i]["name"]]
            }
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


exports.listUserOrg = (req, res) => {
    
    var username = {"name" : req.params.userid};
    
	Users.findOne(username)
    .then(async function(data) {
        if(data != null){
            var uid = data.uid

            const filter = {}

            if(data.role != "4"){
                filter.users = {$in: uid}
            }
            
            Orgs.find(filter)
            .then(function(data){
                if(data != null){
                    olist = []
                    for(let i=0; i<data.length; i++){
                        olist.push(data[i].name)
                    }
                    res.status(200).send({
                        message: olist
                    });
                }
                else{
                    res.status(400).send({
                        message: "User not found in any org"
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Error occurred while accessing Org data"
                });
            });
        }
        else{
            res.status(400).send({
                message: "User not exists"
            });
        }
    })
    .catch(err => {
		res.status(500).send({
            message: err.message || "Error occurred while accessing DB."
        });
	});
}


exports.listOrgTags = (req, res) => {
    console.log("List Tags of Org: ", req.params.orgname)

    if(!req.params.orgname) {
        return res.status(400).send({
            message: "Provide required input fields to get Org Users"
        });
    }

    Orgs.findOne({"name": req.params.orgname})
    .then(data=>{
        if(data != null){
            // console.log("Result: ", data)
            res.status(200).send({message: data["tags"]})
        }
        else{
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while accessing Org: ", err)
    })
}


exports.checkOrg = async (orgid) => {
    return new Promise(function(resolve, reject) {
        const filter = {"id": orgid}
        Orgs.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
        .then(data => {
            if(data.length > 0){
                resolve(data[0].tags)
            }
            else {
                resolve([])
            }

        })
        .catch(err => {
            resolve([])
        });
    })
}


exports.addneworg = (req, res) => {
    console.log("Req for Add new Org: ", req.body)

    if(!req.body.name) {
        return res.status(400).send({
            message: "Provide required input fields to create Organization"
        });
    }

    Orgs.find({"name": req.body.name})
    .then(data => {
        if(data.length > 0)
        {
            res.status(400).send({
                message: "Organization already exists!"
            });
        }
        else
        {
            let orgdict = {}
            orgdict['id'] = mathfn.GenerateRandom();
            orgdict['name'] = req.body.name;
            if(req.body.tags.length > 0){
                orgdict['tags'] = req.body.tags;
            }
            const org = new Orgs(orgdict)

            org.save()
            .then(data => {
                res.status(200).send({message: "Organization created successfully"});
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Organization creation failed!"
                });
            });
        }

    }).catch(err => {
        console.log(err)
		res.status(500).send({message: "Error occured while accessing DB"});
	})

}

exports.deleteOrg = (req, res) => {
    
    if(!req.params.orgname) {
        return res.status(400).send({
            message: "Provide required input fields to delete Organization"
        });
    }

    if(req.body.level != "4"){
        return res.status(400).send({
            message: "This action not allowed for your role"
        });
    }

    Orgs.findOne({"name": req.params.orgname})
    .then(data=>{
        if(data != null){
            if(data.users.length > 0 || data.gateways.length > 0 || data.locations.length > 0){
                res.status(200).send({message: "Clear the dependent records to delete the Org"})
            }
            else{
                Orgs.findOneAndDelete({"name": req.params.orgname})
                .then(data=>{
                    if(data != null){
                        res.status(200).send({message: "Org delete success"})
                    }
                    else{
                        res.status(200).send({message: "Org does not exist"})
                    }
                })
                .catch(err=>{
                    console.log("Error while remove Org: ", err)
                })
            }
        }
        else{
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        console.log("Error while remove Org: ", err)
    })
}

// Update Org Names and Tags
exports.updateOrg = (req, res) => {
    
    if(!req.body.odata){
        return res.status(400).send({
            message: "Input field missing"
        });
    }

    if(req.body.level != "4"){
        return res.status(400).send({
            message: "This User not allowed to update Org"
        });
    }

    Orgs.findOne({"name": req.params.orgname})
    .then(data=>{
        if(data != null){
            let filter = {"name": req.params.orgname}

            let update = {}
            update['name'] = req.body.odata.name ? req.body.odata.name : data.name
            update['tags'] = req.body.odata.tags ? req.body.odata.tags : data.tags

            Orgs.findOneAndUpdate(filter, update, { new: true })
            .then(data=>{
                if(data != null){
                    res.status(200).send({message: "Org update success"})
                }
                else{
                    res.status(200).send({message: "Org does not exist"})
                }
            })
            .catch(err=>{
                console.log("Error while update Org: ", err)
            })
        }
        else{
            res.status(200).send({message: "Org does not exist"})
        }
    })
    .catch(err=>{
        return res.status(500).send({
            message: "Error when accessing DB: " + err
        });
    })
}

// Update organization
// add user(s), device(s), gateway(s), tag(s), location(s)
// fncode = adduser, rmuser, addloc, rmloc, addgw, rmgw, adddev, rmdev
// 
exports.updtorg = (req, res) => {
    
    if(!req.body.data || !req.body.fncode || !req.body.org) {
        return res.status(400).send({
            message: "Provide required input fields to update Organization"
        });
    }

    let fncode = req.body.fncode

    switch(fncode){
        case 'adduser':
            AddUser(req, res)
            break;
        case 'rmuser':
            RemoveUser(req, res)
            break;
        case 'addloc':
            AddLocation()
            break;
        case 'rmloc':
            RemoveLocation()
            break;
        case 'addgw':
            AddGw(req, res)
            break;
        case 'rmgw':
            RemoveGw(req, res)
            break;
    }
}

async function AddUser(req, res){
    // Admin can add single or many users under organization
    
    if(!req.body.data.users){
        return res.status(400).send({
            message: "Provide required input fields to add users under Organization"
        });
    }

    const myres = await Users.find({name: req.body.data.users}).select({"_id": 0, "uid": 1, "name": 1})
    const ulist = []
    for(let i=0; i<myres.length; i++){
        ulist.push(myres[i].uid)
    }
    const fresp = await AppendUser(req, res, ulist)

}    

async function AppendUser(req, res, ulist){
    const myorg = await Orgs.findOne({"name": req.body.org}).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
    if(myorg == null){
        return res.status(400).send({
            message: "The given Organization is not found in the record"
        }); 
    }
    
    const existusers = myorg.users
    const allusers = existusers.concat(ulist)
    const updtusers = Array.from(new Set(allusers))

    const myupdt = await Orgs.updateOne({"name": req.body.org}, {"users": updtusers})
    if(myupdt.nModified == 1){
        return res.status(200).send({
            message: "Organization update success"
        }); 
    }
    else{
        return res.status(400).send({
            message: "Organization update failed"
        });
    }
}

async function RemoveUserList(req, res, ulist){
    const myorg = await Orgs.findOne({"name": req.body.org}).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
    if(myorg == null){
        return res.status(400).send({
            message: "The given Organization is not found in the record"
        }); 
    }
    
    const existusers = myorg.users
    const updtusers = existusers.filter( ( el ) => !ulist.includes( el ) );
    
    const myupdt = await Orgs.updateOne({"name": req.body.org}, {"users": updtusers})
    if(myupdt.nModified == 1){
        return res.status(200).send({
            message: "Organization update success"
        }); 
    }
    else{
        return res.status(400).send({
            message: "Organization update failed"
        });
    }
  
}


async function RemoveUser(req, res){
    if(!req.body.data.users){
        return res.status(400).send({
            message: "Provide required input fields to remove users under Organization"
        });
    }

    const myres = await Users.find({name: req.body.data.users}).select({"_id": 0, "uid": 1, "name": 1})
    const ulist = []
    for(let i=0; i<myres.length; i++){
        ulist.push(myres[i].uid)
    }
    const fresp = await RemoveUserList(req, res, ulist)
}


async function AddGw(req, res){
    
    if(!req.body.data.gws){
        return res.status(400).send({
            message: "Provide required input fields to add gateways under Organization"
        });
    }

    // const myfilt = ["gw1", "gw2", "gw3", "gw4"]
    const myres = await Gws.find({"name": req.body.data.gws})//.select({"_id": 0, "gwid": 1, "name": 1})
    
    const gwlist = []
    for(let i=0; i<myres.length; i++){
        gwlist.push(myres[i].gwid)
    }
    const fresp = await AppendGw(req, res, gwlist)

}    

async function AppendGw(req, res, gwlist){
    
    const myorg = await Orgs.findOne({"name": req.body.org}).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
    if(myorg == null){
        return res.status(400).send({
            message: "The given Organization is not found in the record"
        }); 
    }
    
    const orgid = myorg.id
    const existgws = myorg.gateways
    const allgws = existgws.concat(gwlist)
    const updtgws = Array.from(new Set(allgws))

    const myupdt = await Orgs.updateOne({"name": req.body.org}, {"gateways": updtgws})
    if(myupdt.nModified == 1){

        // In feature we need to update Org info in the list of gateways
        // Present only update for first element
        const filter = {name: req.body.data.gws, orgid: null}
        const update = {orgid: orgid}
        const myresp = await Gws.updateOne(filter, update)
        if(myresp.nModified == 1){
            return res.status(200).send({
                message: "Organization update success"
            }); 
        }
        else{
            return res.status(400).send({
                message: "Organization update success, but failed to update in Gateway record"
            }); 
        }
    }
    else{
        return res.status(400).send({
            message: "Organization update failed"
        });
    }
}


async function RemoveGw(req, res){
    
    if(!req.body.data.gws){
        return res.status(400).send({
            message: "Provide required input fields to remove Gateway under Organization"
        });
    }

    const myres = await Gws.find({name: req.body.data.gws}).select({"_id": 0, "gwid": 1, "name": 1})
    const gwlist = []
    for(let i=0; i<myres.length; i++){
        gwlist.push(myres[i].gwid)
    }
    const fresp = await RemoveGwList(req, res, gwlist)
}

async function RemoveGwList(req, res, gwlist){
    const myorg = await Orgs.findOne({"name": req.body.org}).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
    if(myorg == null){
        return res.status(400).send({
            message: "The given Organization is not found in the record"
        }); 
    }
    const existgws = myorg.gateways
    const orgid = myorg.id
    const updtgws = existgws.filter( ( el ) => !gwlist.includes( el ) );
    // const updtusers = Array.from(new Set(allusers))

    const myupdt = await Orgs.updateOne({"name": req.body.org}, {"gateways": updtgws})
    if(myupdt.nModified == 1){

        // Need to update the Gateway removal in Gateway Record
        const filter = {name: req.body.data.gws, orgid: orgid}
        const update = {orgid: null}
        const myresp = await Gws.updateOne(filter, update)
        if(myresp.nModified == 1){
            return res.status(200).send({
                message: "Organization update success"
            }); 
        }
        else{
            return res.status(400).send({
                message: "Organization update success, but failed to update in Gateway record"
            }); 
        }

    }
    else{
        return res.status(400).send({
            message: "Organization update failed"
        });
    }
  
}


function AddLocation(){
    console.log("Add Location")
}

function RemoveLocation(){
    console.log("Remove Location")
}