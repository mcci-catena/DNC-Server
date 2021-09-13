const Clients = require('../models/client.model.js');
const Devices = require('../models/devreg.model.js');
const validfn = require('../misc/validators.js');
const regdev = require('../controllers/devreg.controller.js');
const mongoose = require('mongoose');


getDevSchema = (client) => {
    mschema = {} 
    mschema["latitude"] = {"type": "String"}
    mschema["longitude"] = {"type": "String"}
    mschema["hwid"] = {"type": "String"}        // previously devEUI, in WeRadiate devid
            
    var taglist = client.taglist
    for(i=0; i<taglist.length; i++)
    {
        mschema[taglist[i]] = {"type": "String"}
    }
            
    mschema["idate"] = {"type": "Date"}
    mschema["rdate"] = {"type": "Date"}

    const devSchema = mongoose.Schema(mschema, {timestamps: true})
    return devSchema
}

// create a location under a pile 

exports.create = (req, res) => {
    if(!req.body.cname || !req.body.lat || !req.body.long || 
        !req.body.id || !req.body.datetime) {

        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var dttmstr = req.body.datetime.split(",")
    var dtstr = dttmstr[0].trim();
    var tmstr = dttmstr[1].trim();

    if(!validfn.validatedate(dtstr) || !validfn.validatetime(tmstr))
    {
        return res.status(400).send({
            message: "Invalid date and time!"
        });
    }

    var gdate = new Date(req.body.datetime)
    var cdate = new Date();
    
    if(cdate < gdate)
    {
        return res.status(200).send({message: 
                "Add date should not be recent to the"+ 
                " current date" });
    }

    var clientname = {"cname" : req.body.cname};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            mschema = {} 
            mschema["latitude"] = {"type": "String"}
            mschema["longitude"] = {"type": "String"}
            var taglist = data.taglist
            for(i=0; i<taglist.length; i++)
            {
                mschema[taglist[i]] = {"type": "String"}
            }
            mschema["hwid"] = {"type": "String"}        // previously devEUI, in WeRadiate devid
            mschema["idate"] = {"type": "String"}
            mschema["rdate"] = {"type": "String"}

            var clientid = data.cid;

            let Cdev
            try {
                Cdev = mongoose.model('devices'+clientid)

            }catch (error){
                const devSchema = mongoose.Schema(mschema, {timestamps: true})
                Cdev = mongoose.model('devices'+clientid, devSchema)
            }

            filtdict = {}
            indict = {}
            indict["latitude"] = req.body.lat
            indict["longitude"] = req.body.long
           
            for(i=0; i<taglist.length; i++)
            {
                indict[taglist[i]] = null
            }
            
            var klist = Object.keys(req.body)
            var vlist = Object.values(req.body)

            tagdict = {}
            for(i=0; i<klist.length; i++)
            {
                tagdict[klist[i]] = vlist[i]
            }
            
            for(i=0; i<taglist.length; i++)
            {
                if(klist.includes(taglist[i]))
                {
                    indict[taglist[i]] = tagdict[taglist[i]]
                    filtdict[taglist[i]] = tagdict[taglist[i]]
                }
            }

            indict["hwid"] = req.body.id                  // previously devEUI, in WeRadiate devid
            indict["idate"] = req.body.datetime
            indict["rdate"] = ''

            //filtdict["devEUI"] = req.body.id
            filtdict["rdate"] = ''

            devfilt = {}
            devfilt["hwid"] = req.body.id
            devfilt["rdate"] = ''

            Cdev.findOne(devfilt)
            .then(function(data){
                if(!data)
                {
                    Cdev.findOne(filtdict)
                    .then(function(data){
                        if(!data)
                        {
                            const ndev = new Cdev(indict)
                            ndev.save()
                            .then(data => {
                                res.send(data);
                            })
                            .catch(err => { 
                                res.status(500).send({
                                    message: err.message || "Error occurred while adding the Device."
                                });
                            });
                        }
                        else
                        {
                            return res.status(400).send({
                                message: "A device is already assigned to this location, remove then add a device!!!"
                            });
                        }
                    })
                    .catch((err) => {
                        res.status(500).send({
                            message: err.message || "Error occurred while fetching Device info"
                        });
                    }); 
                }
                else
                {
                    return res.status(400).send({
                        message: "The Device is already assigned, try with different!!!"
                    });
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error occurred while fetching Device info"
                });
            }); 
        }
        else
        {
            res.status(200).send({
                message: "Client not exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}

// List the all devices assigned for all clients
exports.adevClient = (req, res) => {
    if(!req.params.client) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var clientname = {"cname" : req.params.client};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var clientid = data.cid;
            var taglist = data.taglist
            
            let Cdev
            try {
                Cdev = mongoose.model('devices'+clientid)
            }catch (error){
                Cdev = mongoose.model('devices'+clientid, getDevSchema(data))
            }
            Cdev.find()
            .then(function(data){
                if(data)
                {
                    res.status(200).send(data);
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error occurred while fetching the device info"
                });
            });
        }
        else
        {
            res.status(400).send({
                message: "Client doesn't exists"
            });
        }

    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}

exports.showRmDevice = (req, res) => {
    if(!req.params.client) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var clientname = {"cname" : req.params.client};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var clientid = data.cid;
            var taglist = data.taglist
            
            let Cdev
            try {
                Cdev = mongoose.model('devices'+clientid)
            }catch (error){
                Cdev = mongoose.model('devices'+clientid, getDevSchema(data))
            }

            var filter = {"rdate" : ''};

            Cdev.find(filter)
            .then(function(data){
                if(data)
                {
                    res.status(200).send(data);
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error occurred while fetching the device info"
                });
            });
        }
        else
        {
            res.status(400).send({
                message: "Client doesn't exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}


exports.removeDevice = (req, res) => {
    if(!req.params.cname && !req.body.hwid && !req.body.datatime) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var klist = Object.keys(req.body)
    
    var filter = {};
    for(var i=0; i<klist.length; i++)
    {
        if(klist[i] != 'datetime')
        {
            filter[klist[i]] = req.body[klist[i]]
        }
    }
    filter["rdate"] = ''
    
    var dttmstr = req.body.datetime.split(",")
    var dtstr = dttmstr[0].trim();
    var tmstr = dttmstr[1].trim();

    if(!validfn.validatedate(dtstr) || !validfn.validatetime(tmstr))
    {
        return res.status(400).send({
            message: "Invalid date and time!"
        });
    }

    var gdate = new Date(req.body.datetime)
    var cdate = new Date();
    
    if(cdate < gdate)
    {
        return res.status(400).send({message: 
                "Remove date should not be recent to the"+ 
                " current date" });
    }

    var clientname = {"cname" : req.params.cname};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var clientid = data.cid;
            clientname = data.cname
            
            let Cdev
            try {
                Cdev = mongoose.model('devices'+clientid)
            }catch (error){
                Cdev = mongoose.model('devices'+clientid, getDevSchema(data))
            }

            var update = {"rdate": new Date(req.body.datetime)};

            Cdev.findOne(filter)
            .then(function(data) {
                if(data)
                {
                    var idate = data.idate;
                    var rdate = new Date(req.body.datetime)   
                    if(rdate > idate)
                    {
                        Cdev.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
                        .then(async function(data){
                            if(data)
                            {
                                var devdict = {}
                                devdict.cid = clientid
                                devdict.hwid = data.hwid
                                devdict.idate = data.idate
                                devdict.rdate = data.rdate
                                stat = await regdev.removemdevice(devdict)
                                if(stat)
                                {
                                    res.status(200).send(data)
                                }
                                else
                                {
                                    res.status(201).send({message: "Device removed in Client record but failed to remove in Admin record,"+
                                                    "contact Admin to solve the issue and add the new device again"});
                                }
                            }
                            else
                            {
                                return res.status(400).send({
                                    message: "Device info not matched!"
                                });
                            } 
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: "Error occurred while updating device info."
                            });
                        });
                    }
                    else
                    {
                        res.status(400).send({message: "Remove date should be"+ 
                                              " recent to the installation date"});
                    }
                }
                else
                {
                    res.status(400).send({
                        message: "Requested device not found in the record"
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error occurred while finding the device info."
                });
            });

        }
        else
        {
            res.status(400).send({
                message: "Client not exists"
            });
        }

    })
    .catch((err) => {
        res.status(500).send({
            message: "Error occurred while fetching the client info"
        });
    });
}


exports.replaceDevice = (req, res) => {
    if(!req.params.cname || !req.body.hwid || !req.body.nhwid ||
        !req.body.datetime) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }

    var klist = Object.keys(req.body)
    
    var filter = {};
    for(var i=0; i<klist.length; i++)
    {
        if(klist[i] != 'datetime' && klist[i] != 'nhwid')
        {
            filter[klist[i]] = req.body[klist[i]]
        }
    }
    filter["rdate"] = ''
    
    var dttmstr = req.body.datetime.split(",")
    var dtstr = dttmstr[0].trim();
    var tmstr = dttmstr[1].trim();

    if(!validfn.validatedate(dtstr) || !validfn.validatetime(tmstr))
    {
        return res.status(400).send({
            message: "Invalid date and time!"
        });
    }

    var gdate = new Date(req.body.datetime)
    var cdate = new Date();
    
    if(cdate < gdate)
    {
        return res.status(400).send({message: 
                "Remove date should not be recent to the"+ 
                " current date" });
    }

    var clientname = {"cname" : req.params.cname};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var clientid = data.cid;
            clientname = data.cname
            var tags = data.taglist
            
            let Cdev
            try {
                Cdev = mongoose.model('devices'+clientid)
            }catch (error){
                Cdev = mongoose.model('devices'+clientid, getDevSchema(data))
            }

            var update = {"rdate": new Date(req.body.datetime)};

            Cdev.findOne(filter)
            .then(function(data) {
                if(data)
                {
                    var idate = data.idate
                    var rdate = new Date(req.body.datetime)

                    if(rdate > idate)
                    {
                        var indict = {}
                        for(var i=0; i<tags.length; i++)
                        {
                            indict[tags[i]] = data[tags[i]]
                        }
                        indict["latitude"] = data.latitude
                        indict["longitude"] = data.longitude
                        indict["idate"] = new Date(req.body.datetime)
                        indict["rdate"] = ''
                        indict["hwid"] = req.body.nhwid
                    
                                            
                        nfilt = {}
                        nfilt["hwid"] = req.body.nhwid
                        nfilt["rdate"] = ''

                        Cdev.findOne(nfilt)
                        .then(function(data) {
                            if(!data)
                            {
                                Cdev.findOneAndUpdate(filter, update, {useFindAndModify: false, new: true})
                                .then(async function(data){
                                    if(data)
                                    {
                                        var devdict = {}
                                        devdict.cid = clientid
                                        devdict.hwid = data.hwid
                                        devdict.idate = data.idate
                                        devdict.rdate = data.rdate
                                        stat = await regdev.removemdevice(devdict)
                                        if(stat)
                                        {
                                            const ndev = new Cdev(indict)
                                            ndev.save()
                                            .then(data => {
                                                res.send(data);
                                            })
                                            .catch(err => { 
                                                res.status(500).send({
                                                    message: err.message || "Error occurred while adding the Device."
                                                });
                                            });
                                        }
                                        else
                                        {
                                            res.status(201).send({message: "Device removed in Client record but failed to remove in Admin record,"+
                                                    "contact Admin to solve the issue and add the new device again"});
                                        }
                                    }
                                    else
                                    {
                                        return res.status(400).send({
                                            message: "Device info not matched!"
                                        });
                                    } 
                                })
                                .catch(err => {
                                    res.status(500).send({
                                        message: "Error occurred while updating device info."
                                    });
                                });
                            }
                            else
                            {
                                res.status(400).send({message: "The replace"+ 
                                " device is exists in record"});
                            }
                        })
                        .catch(err => {
                            res.status(500).send({
                                message: "Error occurred while updating device info."
                            });
                        });
                    }
                    else
                    {
                        res.status(400).send({message: "Replace date should be"+ 
                                " recent to the installation date"});
                    }  
                }
                else
                {
                    res.status(400).send({
                        message: "Requested device not found in the record"
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: "Error occurred while finding the device info."
                });
            });
        }
        else
        {
            res.status(400).send({
                message: "Client not exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: "Error occurred while fetching the client info"
        });
    });
}


// Delete a device with the specified site locatione in the request

exports.delete = (req, res) => {
    if(!req.params.cname || !req.body.hwid) {
         return res.status(400).send({
             message: "mandatory field missing"
         });
    }

    var klist = Object.keys(req.body)
    
    var filter = {};
    for(var i=0; i<klist.length; i++)
    {
        filter[klist[i]] = req.body[klist[i]]
    }
    
    var clientname = {"cname" : req.params.cname};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var clientid = data.cid
            
            let Cdev
            
            try {
                Cdev = mongoose.model('devices'+clientid)
            }catch (error){
                Cdev = mongoose.model('devices'+clientid, getDevSchema(data))
            }

            Cdev.deleteMany(filter)
            .then(function(data) {
                if(!data)
                {
                    return res.status(400).send({
                        message: "Device not found with the given details "
                    });
                }
                res.send({message: "Device "+req.body.hwid+" deleted successfully!"});
            })
            .catch((err) => {
                res.status(500).send({ 
                    message: err.message || "Error occurred while fetching device details"
                });
            });
        }
        else
        {
            res.status(400).send({
                message: "Client not exists"
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client."
        });
    });
};