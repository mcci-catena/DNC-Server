/*############################################################################
# 
# Module: rmall.controller.js
#
# Description:
#     Endpoint implementation for removing collections which are related 
#     to the Client
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
#     V1.0.0 Fri Oct 22 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const Users = require('../models/user.model.js');
const Devices = require('../models/devreg.model.js');

const mongoose = require('mongoose');

// Once client removed, need to remove all traces of the client
// from the below list of collections
// 1. rdevices - Remove required documents
// 2. devicesxxxx - Remove complete collection 
// 3. users - Remove required documents

exports.removeClient = async(clientid)=>{

    const colleclist = await mongoose.connection.db.collections();

    for(let collexion of colleclist)
    {
        if(collexion.collectionName == "devices"+clientid)
        {
            try{
                collexion.drop();
            }catch(err){
                console.log("Error while fetching devices")
            }
        }    
    }

    var filter = {"cid": clientid}
    Users.deleteMany(filter)
    .then(function(data){
        console.log("User accounts related to the client deleted")
        //return
    })
    .catch((err) => {
        console.log("Error while fetching user info")
    });

    filter = {"cid": clientid}
    Devices.deleteMany(filter)
    .then(function(data){
        console.log("Devices Registered under the client were deleted")
        //return
    })
    .catch((err) => {
        console.log("Error while fetching the Device Registry info")
    });
}