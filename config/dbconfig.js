/*############################################################################
# 
# Module: dbconfig.js
#
# Description:
#     MongoDB Configuration
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
mongoose.set('useCreateIndex', true);

var MongoClient = require('mongodb').MongoClient
const Config = require('../app/models/config.model.js')
var errLog = require('../app/misc/errlogs.js')

const DB_DNC_USER = process.env.MONGO_DNC_USERNAME;
const DB_DNC_PWD = encodeURIComponent(process.env.MONGO_DNC_PASSWD);
const DB_DNC_NAME = process.env.MONGO_DNC_DBNAME;

const DB_ROOT_USER = process.env.MONGO_INITDB_ROOT_USERNAME;
const DB_ROOT_PWD = encodeURIComponent(process.env.MONGO_INITDB_ROOT_PASSWORD);

mongoose.Promise = global.Promise;


// Get the list of users for the given database
// Check it includes the required user
// If the user is not available then add the required user
// If the user is available check the config collection status

exports.dbInit = () => {
    const DB_URL = `mongodb://${DB_ROOT_USER}:${DB_ROOT_PWD}@mongodb:27017`;
    
	MongoClient.connect(DB_URL, {useUnifiedTopology: true,
        useNewUrlParser: true}, function(err, client) {
        
            if(err) {
                errLog.errLog.setDbErr("DNC DB is not responding")
            }
            else
            {
                const adminDb = client.db(DB_DNC_NAME);

                var cmd = {usersInfo: 1};
                adminDb.command(cmd)
                .then((data) => {
                    client.close()
                    var userlist = []
                    for(var i=0; i<data.users.length; i++)
                    {
                        userlist.push(data.users[i].user)
                    }
                    if(userlist.length > 0) {
                        if(userlist.includes(DB_DNC_USER)) {
                            openDNCDB()
                        }
                        else {
                            addNewUser()
                        }
                    }
                    else
                    {
                        addNewUser()
                    }
                })
                .catch(err => {
                    client.close()
                    errLog.errLog.setDbErr("DB List Access Error")
                })
            }
	    })
}


// Add new user, read input parameter from environment
// if success - then check config collection status
// if fail - Throw an Error and update the status in global variable

function addNewUser() {
	const DB_URL = `mongodb://${DB_ROOT_USER}:${DB_ROOT_PWD}@mongodb:27017`;
    
	MongoClient.connect(DB_URL, {useUnifiedTopology: true,
        useNewUrlParser: true}, function(err, client) {

        if(err){
            errLog.errLog.setDbErr("DNC DB is not responding-2")
        }
        else{
            const adminDb = client.db(DB_DNC_NAME);

            adminDb.addUser(DB_DNC_USER, DB_DNC_PWD, {roles: [{role: "readWrite", db: DB_DNC_NAME}]}, 
            function(err, result) {
                if(err) {
                    // Do error log as can't add database user
                    errLog.errLog.setDbErr("Can't add DB user")
                }
                else {
                    openDNCDB()
                }
            })

        }
	})
}

// Open the DNC DB with credentials
// if success Check Config collection status
// if fail Log the DB Open Error in global

function openDNCDB() {

	const DB_URL = `mongodb://mongodb:27017/${DB_DNC_NAME}`;
    
    mongoose.connect(DB_URL, { user: DB_DNC_USER, pass: DB_DNC_PWD, 
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then((data) => {
        if(data) {
            checkConfigStatus()
        }
        else
        {
            errLog.errLog.setDbErr("DNC DB connect failed!")
        }
        
    })
    .catch(err => {
        errLog.errLog.setDbErr("Could not connect to the DNC database")
    }); 
}


// Purpose - Check Config Collection status
// If collection available - do DB success log
// If no collection available - Invoke InitConfig

function checkConfigStatus () {
	Config.findOne()
	.then(data => {
		if(data) {
			errLog.errLog.setDbErr("DataBase Init Success")
        }
		else {
			initConfig()
        }
	})
	.catch(err => {
        errLog.errLog.setDbErr("Error while accessing Config collection")
	});
}


// Purpose - Initialize the Config collection (required for admin config)
// If Config Collection created - Do success log
// If fail - Do error log as config creation failed

function initConfig() {
	const config = new Config({
		email: 'admin@email.com',
		org: 'myorgna',
		status: '1'
	});
	
	config.save()
	.then(data => {
		errLog.errLog.setDbErr("DataBase Init Success")
	})
	.catch(err => {
		errLog.errLog.setDbErr("Error while creating config collection")
	});
}


exports.getConfig = (req, res) => {
       let dbstat = errLog.errLog.getDbErr()
       res.status(200).json(dbstat);
}