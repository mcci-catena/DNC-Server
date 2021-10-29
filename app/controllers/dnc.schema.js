/*############################################################################
# 
# Module: dnc.schema.js
#
# Description:
#     Dynamic Schema for Device Configuration Collection
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

const mongoose = require('mongoose');

exports.getDevSchema = (data) => {
    mschema = {} 
            
    mschema["latitude"] = {"type": "String"}
    mschema["longitude"] = {"type": "String"}
    var taglist = data.taglist
    for(i=0; i<taglist.length; i++)
    {
        mschema[taglist[i]] = {"type": "String"}
    }
    mschema["hwid"] = {"type": "String"}
    mschema["idate"] = {"type": "Date"}
    mschema["rdate"] = {"type": "Date"}

    cid = data.cid

    let Cdev
    try {
        Cdev = mongoose.model('devices'+cid)

    }catch (error){
        const devSchema = mongoose.Schema(mschema, {timestamps: true})
        Cdev = mongoose.model('devices'+cid, devSchema)
    }

    return Cdev
}