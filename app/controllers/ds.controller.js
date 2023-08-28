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

const Dsrc = require('../models/ds.model')

const dbmodel = ["dsname", "dsid", "dburl", "dbname", "mmtname", "uname", "pwd", "user"]
const mathfn = require('../misc/mathutil.js');
const { update } = require('mongodb-core/lib/wireprotocol');

// const fetch = require('node-fetch')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// List Data Source
exports.listsrc = (req, res) => {
    let filter = {}
    if(req.params.dsid){
        filter = {"orgid": req.params.dsid}
    }
    
	Dsrc.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
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

exports.addnewdsrc = async (req, res) => {
    if(!req.body.dsname || !req.body.dburl || !req.body.dbname ||
        !req.body.mmtname || !req.body.uname || !req.body.pwd) {

        return res.status(400).send({
            message: "Provide required input fields", error: true
        });
    }

    try{
        const eres = await checksrcexists(req)
        if(eres){
            res.status(200).send({message: "Data source exists in the record", error: true})
        }
        else{
            console.log("Insert Stock")
            insertsource(req, res)
        }

    }catch(err){
        res.status(500).send({
            message: err.message || "Error occurred while reading the devices.", error: true
        });
    }
}

async function checksrcexists(req){
    return new Promise(function(resolve, reject) {
        
        const filter = {"dsname": req.body.dsname}
        Dsrc.find(filter)
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

function insertsource(req, res){
    let nsrc = {}

    let bkeys = Object.keys(req.body)
    
    for(item of bkeys){
        nsrc[item] = req.body[item]     
    }

    nsrc["dsid"] = mathfn.GenerateRandom()
    nsrc["user"] = req.user.user.user
    
    const newsrc = new Dsrc(nsrc);
    newsrc.save()
    .then(data => {
        res.status(200).send({
            message: "Data source added success", error: false
        });
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Error occurred while configuring Data Source.",
            error: true
        });
    });
}

exports.getdsrc = async (dsname) => {
    return new Promise(function(resolve, reject) {
        const filter = {"dsname": dsname}
        Dsrc.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
        .then(data => {
            if(data.length > 0){
                resolve(data[0].dsid)
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


exports.updatedsrc = (req, res) => {
    
    if(! req.body.dbdata){
        return res.status(400).send({
            message: "Input field missing"
        });
    }

    if(req.body.level != "4"){
        return res.status(400).send({
            message: "This User not allowed to update DataSource"
        });
    }

    const filter = {"dsname": req.params.dsname}
    Dsrc.findOne(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
    .then(data => {
        if(data != null){
            let update = {}
            update['dsname'] = req.body.dbdata.dsname ? req.body.dbdata.dsname : data.dsname
            update['dburl'] = req.body.dbdata.dsurl ? req.body.dbdata.dsurl : data.dburl
            update['dbname'] = req.body.dbdata.dbname ? req.body.dbdata.dbname : data.dbname
            update['mmtname'] = req.body.dbdata.mmtname ? req.body.dbdata.mmtname : data.mmtname
            update['uname'] = req.body.dbdata.uname ? req.body.dbdata.uname : data.uname
            update['pwd'] = req.body.dbdata.pwd ? req.body.dbdata.pwd : data.pwd
            update['user'] = req.body.user

            Dsrc.findOneAndUpdate(filter, update, { new: true })
            .then(data => {
                return res.status(200).send({
                    message: "Data Source Updated Successfully"
                });
                
            }).catch(err => {
                res.status(500).send({
                    message: err.message || "Error occurred while retrieving DS record"
                });
            });
        }
        else{
            res.status(400).send({
                message: "Data Source not exists"
            });
        }
    })
    .catch(err => {
		res.status(500).send({
            message: err.message || "Error occurred while accessing DB."
        });
	});

}

exports.getdblist = async (req, res) => {
    var influxUrl = req.body.dburl;
	var influxUser = req.body.dbuname ? req.body.dbuname : "admin";
	var influxPwd = req.body.dbpwd ? req.body.dbpwd : "admin";
	
	var url = influxUrl + "/query?pretty=true&q=SHOW DATABASES";
    
    var authPwd = influxUser + ":" + influxPwd;
	var b64Pwd = Buffer.from(authPwd).toString('base64');
	
	const headers = {
		"Authorization": "Basic " + b64Pwd
	}
	
	fetch(url, {method:'GET',
        headers: headers,
       })
    .then(response => {
		return response.json();
	})
    .then(json => {
		var result = {};
		var dbNames = [];
		getDbArrList = json.results[0].series[0].values;
		
		for (var i=0; i<getDbArrList.length; i++) {
			dbNames[i] = getDbArrList[i][0];
		}
		
		result.db_list = dbNames;

        return res.status(200).send(result);
	})
	.catch(err => {
        return res.status(500).send({
            message: "Error fetching db names: " + err
        });
	});

}

exports.getmmtlist = async (req, res) => {
    var influxUrl = req.body.dburl;
	var influxUser = req.body.dbuname ? req.body.dbuname : "admin";
	var influxPwd = req.body.dbpwd ? req.body.dbpwd : "admin";
    var influxDbn = req.body.dbname;
	
	var url = influxUrl + "/query?db="+influxDbn+"&q=SHOW MEASUREMENTS LIMIT 100";
	var authPwd = influxUser + ":" + influxPwd;
	var b64Pwd = Buffer.from(authPwd).toString('base64');

    const headers = {
		"Authorization": "Basic " + b64Pwd
	}
	
	fetch(url, {method:'GET',
        headers: headers,
       })
    .then(response => {
        return response.json();
	})
    .then(json => {
		var result = {};
		var mmtNames = [];
		
        try{
            getDbArrList = json.results[0].series[0].values;

            for (var i=0; i<getDbArrList.length; i++) {
                mmtNames[i] = getDbArrList[i][0];
            }
        }catch{
            
        }
		
		result.mmt_list = mmtNames;

        return res.status(200).send(result);
	})
	.catch(err => {
        console.log("Read MMT Error: ", err)
		return res.status(500).send({
            message: "Error fetching db names: " + err
        });
	});

}


exports.deleteDs = (req, res) => {
    if(!req.params.dsname) {
        return res.status(400).send({
            message: "Provide required input fields to delete a data source"
        });
    }

    if(req.body.level != "4"){
        return res.status(400).send({
            message: "This action not allowed for your role"
        });
    }

    Dsrc.findOne({"dsname": req.params.dsname})
    .then(data=>{
        if(data != null){
            Dsrc.findOneAndDelete({"dsname": req.params.dsname})
            .then(data=>{
                if(data != null){
                    res.status(200).send({message: "Data Source Deleted Successfully"})
                }
                else{
                    res.status(200).send({message: "Data Source does not exist"})
                }
            })
            .catch(err=>{
                console.log("Error while removing Data Source: ", err)
            })
        }
        else{
            res.status(200).send({message: "Data Source does not exist"})
        }
    })
    .catch(err=>{
         return res.status(500).send({
            message: "Error when accessing DB: " + err
        });
    })
}

// List Data Source
exports.getDevList = async (req, res) => {
    
    if(!req.body.dsn || !req.body.dtype){
        return res.status(400).send({
            message: "Input field missing"
        });
    }

    let filter = {}
    filter = {"dsname": req.body.dsn}

    Dsrc.find(filter).select({"_id": 0, "createdAt": 0, "updatedAt": 0, "__v": 0})
	.then(async (data) => {
		if(data.length > 0) {
    
            let devices = await getDevices(data[0], req.body.dtype);

            res.status(200).send({message: devices});
		}
		else {
			res.status(400).send({message: "Data source not found"});
		}
	})
	.catch(err => {
		res.status(500).send({message: "Error while accessing DB"});
	});
}

async function getDevices(dbdict, dtype){
    return new Promise(function(resolve, reject) {
        // dburl, dbname, mmtname, uname, pwd
        var influxUrl = dbdict.dburl;
        var influxDbn = dbdict.dbname;
        var influxMmn = dbdict.mmtname;
	    var influxUser = dbdict.uname ? dbdict.uname : "admin";
	    var influxPwd = dbdict.pwd ? dbdict.pwd : "admin";

        var url = influxUrl + "/query?db="+influxDbn+"&q=SHOW Tag values from "+"\""+influxMmn+"\""+" with key="+dtype;
	    var authPwd = influxUser + ":" + influxPwd;
	    var b64Pwd = Buffer.from(authPwd).toString('base64');

        const headers = {
		    "Authorization": "Basic " + b64Pwd
	    }
	
	    fetch(url, {method:'GET',
            headers: headers,
        })
        .then(response => {
		    return response.json();
	    })
        .then(json => {
		    var result = {};
		    var devlist = [];
		    let infdevlist = json.results[0].series[0].values;
		
		    for (var i=0; i<infdevlist.length; i++) {
    		    devlist[i] = infdevlist[i][1];
		    }
		
            resolve(devlist)
        })
        .catch(err => {
            console.log("DB catch: ", err)
            resolve([])
        });
    })
}