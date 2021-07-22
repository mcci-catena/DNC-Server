
const mongoose = require('mongoose');
const Client = require('../models/client.model.js');
const dschema = require('./dnc.schema.js');
const Devices = require('../models/devreg.model.js');

//function getDeviceList(countryid, dncq, dnckey)
exports.getDeviceList = (req, res) => {

    //var cfilter = {"dbdata.user": req.body.dncd.influxd.uname, "dbdata.pwd": req.body.dncd.influxd.pwd, "dbdata.dbname": req.body.dncd.influxd.dbname}
    var cfilter = {"cname": req.body.dncd.influxd.uname}

    Client.findOne(cfilter)
    .then(function(data){
        if(data)
        {
            Cdev = dschema.getDevSchema(data)
            clientname = data.cname

            fmdate = req.body.dncd.fdate
            todate = req.body.dncd.tdate

            var timef = {$or:[{"idate": {$gte: fmdate, $lte: todate}},
                              {"rdate": {$gte: fmdate, $lte: todate}},
                              {"idate":{$lte: fmdate},"rdate": null}]}
            var totf = []
            totf.push(req.body.dncd.dnckey)
            totf.push(timef)
    
            var filter = {}
            filter["$and"] = totf
            var findict = {}

            findict['dbdata'] = data.dbdata
            
            taglist = data.taglist

            Cdev.find(filter).sort({"idate": 1})
            .then(async function(data) {
                if(data)
                {
                    var devarray = [];
                    for(var i=0; i<data.length; i++)
                    {
                        var indict = {};

                        indict['location'] = []
                        indict.location.push(data[i].latitude)
                        indict.location.push(data[i].longitude)

                        for(k=0; k<taglist.length;  k++)
                        {
                            indict.location.push(data[i][taglist[k]])
                        }

                        indict['devid'] = data[i].hwid;
                        indict['idate'] = data[i].idate;
                        indict['rdate'] = data[i].rdate;
                        indict['darr'] = []
                        devarray.push(indict);

                    }
                    
                    findict['devices'] = devarray;
                    findict['taglist'] = taglist
                    console.log("Befor Top Mapping: ", clientname, findict)
                    resdict = await getTopMapping(clientname, findict)
                    console.log("ResDict: ", resdict )
                    res.status(200).send({
                        resdict
                    });
                }
                else
                {
                    res.status(201).send({
                        message: "Data Read Error"
                    });
                }
            })
            .catch(err => {
                res.status(201).send({
                    message: "Data Read Error"
                });
            });
        }
        else
        {
            res.status(401).send({
                message: "Invalid User!"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}


async function getTopMapping(clientname, devdict){
    var len = devdict.devices.length;
    console.log("Length: ", len)
    for(var i=0; i<len; i++)
    {
        console.log("Inside Floop: ", devdict.devices[i])
        data = await GetDeviceID(clientname, devdict.devices[i])
        console.log("After GetDeviceID: ",data)
        if(data)
        {
            devdict.devices[i].deviceid = data.deviceid
            devdict.devices[i].devID = data.devID
            devdict.devices[i].devEUI = data.devEUI
            devdict.devices[i].mmname = data.mmname
            devdict.devices[i].fdname = data.fdname
        }
        else
        {
            devdict.devices[i] = {}
        }
    }
    return devdict
}



function GetDeviceID(clientname, devdict)
{
    console.log("Inside GetDevID: ", clientname, devdict.devid)
    return new Promise(function(resolve, reject) {

       var filter = {"client": clientname, "hwid": devdict.devid, "idate": devdict.idate, "rdate": devdict.rdate}
       //var filter = {"client": clientname}
       console.log("Rdev Filter: ", filter)
       Devices.findOne(filter ,function(err, data){
           if(err)
           {
               console.log("Error: ", err)
               data = []
               reject(data);
           }
           else
           {
               console.log("Dev Details: ", data)
               resolve(data)
           }
           /*else
           if(data)
           {
                console.log("Dev Details: ", data)
                resolve(data)
           }
           else{
                console.log("Dev Details12: ", data)
                resolve(data);
           } */
        });

    });
}