/*############################################################################
# 
# Module: brix.controller.js
#
# Description:
#     Route for Cornell Sap Endpoints (To add Sugar(Brix) value manually)
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
#     Seenivasan V, MCCI Corporation February 2022
#
# Revision history:
#     V1.0.x Thu Feb 24 2022 17:45:35 seenivasan
#       Module created
############################################################################*/

const mongoose = require('mongoose');
const Brixs = require('../models/brix.model.js');
const validfn = require('../misc/validators.js');

exports.updatebrix = (req, res) => {

    if(!req.body.data1 || !req.body.data2 || !req.body.data3 
        || !req.body.rdate) {
        return res.status(400).send({
            message: "Provide all Brix Data"
        });
    }

    let dttmstr = req.body.rdate.split(",")
    let dtstr = dttmstr[0].trim();
    let tmstr = dttmstr[1].trim();

    if(!validfn.validatedate(dtstr) || !validfn.validatetime(tmstr))
    {
        return res.status(400).send({
            message: "Invalid date and time!"
        });
    }

    let gdate = new Date(req.body.rdate)
    let cdate = new Date();

    if(cdate < gdate)
    {
        return res.status(400).send({message: 
                "Add date should not be recent to the"+ 
                " current date" });
    }

    Brixs.find()
    .then(data => {
        let datearr = []
        for(let i=0; i<data.length; i++) {
            datearr.push(data[i]["rdate"].toISOString().split("T")[0])
        }
        
        let gndate = gdate.toISOString().split("T")[0]

        if(datearr.includes(gndate)){
            return res.status(200).send({message: 
                "Data already exists for the given date"});
        }
        else {
            const brix = new Brixs({
                Arnot: req.body.data1,
                Uihlein: req.body.data2,
                UVM: req.body.data3,
                rdate: req.body.rdate
            });

            brix.save()
            .then(data => {
                    return res.status(200).send("Brix data updated successfully");
            })
            .catch(err => {
                return res.status(500).send({
                    message: err.message || "Brix data update failed!"
                });
            });
        }
    })
    .catch(err => {
        return res.status(400).send({message: err.message || "Error occurred while retrieving brix data"});
    });
}


exports.readbrix = (req, res) => {
    Brixs.find()
    .then(data => {
        return res.status(200).send(data);
    })
    .catch(err => {
        return res.status(400).send({message: err.message || "Error occurred while retrieving clients."});
    });
}