/*############################################################################
# 
# Module: dnlink.controller.js
#
# Description:
#     Controller for Grafana Query handling
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
#     V1.0.0 Fri July 7 2023 11:24:35 seenivasan
#       Module created
############################################################################*/

// const mandb = require('../models/manage.js');

const constants = require('../misc/constants.js');
const apictrl = require('../controllers/capi.controller')

var request = require('request');


exports.dnlinkquery = async function (req, res) {

    console.log("Downlink Request Received !!!")

    let intext = req.body.dndata
    let gnum = parseInt(intext)
    let devId = req.body.devId.toLowerCase()

    const myarr = [gnum & 0xff, (gnum >> 8) & 0xff] 
    const intarr = []
    intarr.push(parseInt(myarr[1]))
    intarr.push(parseInt(myarr[0]))
    // intarr.push(parseInt(myarr[2]))

    const buffer = Buffer.from(intarr);
    const bas64Str = buffer.toString('base64');


    try{
        let dlresp = await sendDnLink(bas64Str, devId)
        res.setHeader('Content-Type', 'application/json');
        res.status(200).send({message: "Downlink success!"})
    }
    catch(error){
        res.status(500).send({message: error})
    }
    
    return
}

function sendDnLink(dnDataStr, devId)
{
    return new Promise(async function(resolve, reject) {

        try{
            const arecord = await apictrl.listapilocal()

            var myHeaders = {};
            myHeaders["Authorization"] =  'Bearer ' + arecord[0].akey
            myHeaders["Content-Type"]= "application/json";

            var mydnlst = []
                    
            var mydndict = {}
            // mydndict["frm_payload"] = 'Aa4C'
            mydndict["frm_payload"] = dnDataStr
            mydndict["f_port"] = 2
            mydndict["confirmed"] = true

            mydnlst.push(mydndict)

            var mydnmsg = {}
            mydnmsg["downlinks"] = mydnlst

            let myurl = ""+arecord[0].aurl+"/"+arecord[0].nwidpf+devId+arecord[0].apisf
           
            var options = {
                url: myurl,
                method: 'POST',
                headers: myHeaders,
                // form: JSON.stringify({"downlinks":[{"frm_payload":"Aa4B","f_port":1,"confirmed":true}]})
                form: JSON.stringify(mydnmsg)
            };

            request(options, function (error, resp) {
                if (error) 
                {
                    console.log("Connection Error: ", error)
                    reject("Connction Error")
                }
                else 
                {
                    if (resp.statusCode == 200)
                    {
                        var data = JSON.parse(resp.body);
                        console.log("Downlink success")
                        resolve("success")
                    }
                    else 
                    {
                        console.log("Error-2: ", resp.statusCode)
                        var data = JSON.parse(resp.body)
                        reject(data.message)
                    }
                }
            });
        }catch(error){
            reject("Could not read API credentials")
        }
    });
}