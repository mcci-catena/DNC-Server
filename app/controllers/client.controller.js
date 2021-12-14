/*############################################################################
# 
# Module: client.controller.js
#
# Description:
#     Endpoint implementation for Client managememt
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

const Client = require('../models/client.model.js');
const validfn = require('../misc/validators.js');
const allctrl = require('../controllers/rmall.controller.js');
const fetch = require('node-fetch');

const mongoose = require('mongoose');
const e = require('express');

// Utility functions
function GenerateRandom()
{
   var a = Math.floor((Math.random() * 9999) + 999);
   a = String(a);
   return a = a.substring(0, 4);
}

function CheckForClientExistance(reqFilter, res, dataId)
{
    return new Promise(function(resolve, reject) {

        Client.countDocuments(reqFilter,function(err, count){
            if(err)
            {
                reject(2);
                return res.status(400).send({
                    message: "connection error!!!"
                });
            }
            if(count > 0)
            {
                resolve(1)
                return res.status(400).send({
                    message: ""+dataId+" already exists, try with another!!!"
                }); 
            }
            else{
                resolve(0);
            }
        });
    });
}

// API functions
// Create and Save a new Client
exports.create = (req, res) => {
    
    if(!req.body.cname) {
        return res.status(400).send({
            message: "Client name can not be empty"
        });
    }
    
    const [resb, rest] = validfn.clientvalidation(req.body.cname)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Client name "+rest}); 
    }
	
	if(!req.body.url || !req.body.user || !req.body.pwd || !req.body.dbname 
        || !req.body.mmtname || !req.body.tlist)
    {
        return res.status(400).send({message: "Field can't be empty"})
    }
			
	if(typeof req.body.tlist != "object" || req.body.tlist.length == 0)
    {
        return res.status(400).send({message: "Invalid or empty tag list"})
    }
        
    var filter = {"cname": {$regex: new RegExp(req.body.cname, "ig")}}
    Client.findOne(filter)
    .then(function(data) {
        if(data)
        {
            return res.status(400).send({message: "Client already exists!"})
        }
        else
        {
            var rstr = GenerateRandom();
            var clientid = {"cid": rstr}
            CheckForClientExistance(clientid , res, "ClientID")
            .then(function(data) {
                if(data == 0)
                {
                    dbdata = {}
                    dbdata["url"] = req.body.url
                    dbdata["user"] = req.body.user
                    dbdata["pwd"] = req.body.pwd
                    dbdata["dbname"] = req.body.dbname
                    dbdata["mmtname"] = req.body.mmtname

                    cdict = {}
                    cdict["cname"] = req.body.cname
                    cdict["cid"] = rstr
                    cdict["dbdata"] = dbdata
                    cdict["taglist"] = req.body.tlist

                    const client = new Client(cdict);    
                    client.save()
                    .then(data => {
                        res.status(200).send(data);
                    }).catch(err => {
                        res.status(500).send({
                            message: err.message || "Error occurred while creating the Client."
                        });
                    });      
                }
            });
        }
    });
};
    

// Find a single country by countryName
exports.find_client = (req, res) => {
    var filter = {"cname": req.params.clientId};
    Client.findOne(filter)
    .then(data => {
        if(!data) {
            return res.status(400).send({
                message: "Client not found with name " + req.params.clientId
            });            
        }
        else{
			res.status(200).send(data);   
        }
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(400).send({
                message: "Client not found with name: " + req.params.clientId
            });                
        }
        else{
            return res.status(500).send({
                message: "Error while retrieving the Client: " + req.params.clientId
            });
        }
    });
};


// Retrieve and return all Clients.
exports.find_clients = (req, res) => {
    Users.find({"uname": req.user.user})
    .then(data => {
        if(data.length > 0) {
			//res.status(200).send({message: data[0].uname});
            if(data[0].level == 2)
            {
                Client.find()
                .then(data => {
                    return res.status(200).send(data);
                })
                .catch(err => {
                    return res.status(400).send({message: err.message || "Error occurred while retrieving clients."});
                });
            }
            else
            {
                var filter = {"cid": data[0].cid};
                Client.findOne(filter)
                .then(data => {
                    if(!data) {
                        return res.status(400).send({
                            message: "Client not found with name " + req.params.clientId
                        });            
                    }
                    else{
                        datan = []
                        datan.push(data)
                        res.status(200).send(datan);   
                    }
                }).catch(err => {
                    if(err.kind === 'ObjectId') {
                        return res.status(400).send({
                            message: "Client not found with name: " + req.params.clientId
                        });                
                    }
                    else{
                        return res.status(500).send({
                            message: "Error while retrieving the Client: " + req.params.clientId
                        });
                    }
                });
    
            }
		}
        else
        {
            res.status(400).send({message: "Invalid User"});
        }
		
    })
    .catch(err => {
		res.status(500).send({message: "Error occured while accessing DB"});
	});
	
}


// Update a user identified by the userId in the request
exports.update = (req, res) => {
    if(!req.body.cname) {
        return res.status(400).send({
            message: "Client name can not be empty"
        });
    }
	
	if(!req.body.url || !req.body.user || !req.body.pwd || !req.body.dbname || !req.body.tlist)
    {
        return res.status(400).send({message: "Field can't be empty"})
    }
			
	if(typeof req.body.tlist != "object" || req.body.tlist.length == 0)
    {
        return res.status(400).send({message: "Invalid or empty tag list"})
    }

    const filter = {"cid": req.params.clientId}
    const update = {
		"cname": req.body.cname,
		"dbdata": {
			"url": req.body.url,
			"user": req.body.user,
		    "pwd": req.body.pwd,
		    "dbname": req.body.dbname,
            "mmtname": req.body.mmtname
		},
		"taglist": req.body.tlist
		}
	
    // Find note and update it with the request body
    Client.findOneAndUpdate(filter, update, { new: true })
    .then(data => {
        if(data) {
			return res.status(200).send(data);
		} 
		else {
            return res.status(400).send({
                message: "Client not found: " + req.params.clientId
            });
        }
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(400).send({
                message: "Client not found with ID " + req.params.clientId
            });                
        }
        return res.status(500).send({
            message: "Error updating Client: " + req.params.clientId
        });
    });
};


exports.fetch_db_names = (req, res) => {
	var influxUrl = req.body.url;
	var influxUser = req.body.user;
	var influxPwd = req.body.pwd;
	
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


exports.fetch_mmt_names = (req, res) => {
	var influxUrl = req.body.url;
	var influxUser = req.body.user;
	var influxPwd = req.body.pwd;
        var influxDbn = req.body.dbn;
	
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
		getDbArrList = json.results[0].series[0].values;
		
		for (var i=0; i<getDbArrList.length; i++) {
			mmtNames[i] = getDbArrList[i][0];
		}
		
		result.mmt_list = mmtNames;
		
		return res.status(200).send(result);
	})
	.catch(err => {
		return res.status(500).send({
            message: "Error fetching db names: " + err
        });
	});
}

exports.find_device_register_status = (req, res) => {
	var clientDevice = "devices" + String(req.params.clientId);
	
	getCollectionsList()
	.then(data => {
		if(data.length > 0){
			var flag = 0;
			
			for (i=0; i<data.length; i++) {
				if(data[i].name == clientDevice) {
					flag = 1;
				}
			}
			
			if(flag == 1){
				return res.status(200).send({"devices_registered": true});
			}
			else {
				return res.status(200).send({"devices_registered": false});
			}
		}
		else {
			return res.status(400).send({
                message: "DB collection not exists"
            });
		}
	})
	.catch(err => {
		return res.status(400).send({
                message: "Error verifying device status for client - " + req.params.clientId
            }); 
	});
};


// Delete a client with the specified clientId in the request

exports.delete = (req, res) => {
    const filter = {"cname": {$regex: new RegExp(req.params.clientId, "ig")}}
    Client.findOneAndRemove(filter, {useFindAndModify: false})
   .then(data => {
       if(!data) {
           return res.status(400).send({
               message: "Client not found with name " + req.params.clientId
           });
       }
       allctrl.removeClient(data.cid);
       res.status(200).send({message: "Client "+req.params.clientId+" deleted successfully!"});
   }).catch(err => {
       if(err.kind === 'ObjectId' || err.name === 'NotFound') {
           return res.status(400).send({
               message: "Client not found with name " + req.params.clientId
           });                
       }
       return res.status(500).send({
           message: "Could not delete client with name " + req.params.clientId
       });
   });
};


async function getCollectionsList(req, res) {
	const collections = await mongoose.connection.db.listCollections().toArray();
	return collections;
}
