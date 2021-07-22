const Clients = require('../models/client.model.js');

const validfn = require('../misc/validators.js');

const rdev = require('../controllers/devreg.controller.js');

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

    /*let Cdev
    try {
        Cdev = mongoose.model('devices'+clientid)

        }catch (error){
        const devSchema = mongoose.Schema(mschema, {timestamps: true})
        Cdev = mongoose.model('devices'+clientid, devSchema)
    }*/

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

    /*var [resb, rest] = validfn.inputvalidation(req.body.id)

    if(!Boolean(resb))
    {
        return res.status(400).send({message: "Device ID "+rest}); 
    }*/

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
            var clientid = data.cid;
            var taglist = data.taglist
            
            let Cdev
            try {
                Cdev = mongoose.model('devices'+clientid)
            }catch (error){
                Cdev = mongoose.model('devices'+clientid, getDevSchema(data))
            }

            filtdict = {}
            indict = {}
            indict["latitude"] = req.body.lat
            indict["longitude"] = req.body.long
            indict["hwid"] = req.body.id                 // previously devEUI, in WeRadiate devid
            
            for(i=0; i<taglist.length; i++)
            {
                indict[taglist[i]] = null
            }
            
            var klist = Object.keys(req.body)
            var vlist = Object.values(req.body)

            console.log("Keys: ", klist)
            console.log("Values: ", vlist)

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

            indict["idate"] = req.body.datetime
            indict["rdate"] = ''


            console.log("Findict: ", indict)

            filtdict["rdate"] = ''

            devfilt = {}
            devfilt["hwid"] = req.body.id
            devfilt["rdate"] = ''

            console.log("DevFilt: ", devfilt)

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

    /*console.log("Keys Length: ", Object.keys(req.body).length)
    var klen = Object.keys(req.body).length
    console.log("Key: ", Object.keys(req.body))

    for(var i=0; i<klen; i++)
    {
        console.log("Key: ", Object.keys(req.body)[i])
    } */
     
    var klist = Object.keys(req.body)
    console.log("Keys: ", klist)

    var filter = {};
    for(var i=0; i<klist.length; i++)
    {
        if(klist[i] != 'datatime')
        {
            filter[klist[i]] = req.body[klist[i]]
        }
    }
    filter["rdate"] = ''
    
    //console.log("Filter: ", filter)

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
            var clientname = data.cname
            
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
                                    res.status(201).send(data)
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
                                message: err.message || "Error occurred while updating device info."
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
                        message: err.message || "Requested device not found in the record"
                    });
                }
            })
            .catch(err => {
                res.status(500).send({
                    message: err.message || "Error occurred while finding the device info."
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
            message: err.message || "Error occurred while fetching the client info"
        });
    });

}



// List all devices under a location
exports.findAll = (req, res) => {
    if(!req.body.client || !req.body.site || !req.body.pile || !req.body.location) {
        return res.status(400).send({
            message: "mandatory field missing"
        });
    }
    
    var clientname = {"cname" : req.body.client};
    Clients.findOne(clientname)
    .then(function(data) {
        if(data)
        {
            var clientid = data.cid;
            var Cdev = mongoose.model('device'+clientid, DevSchema);
            var filter = {"site" : req.body.site, "pile" : req.body.pile, 
                          "lname" : req.body.location};
            Cdev.find(filter)
            .then(function(data) {
                if(data)
                {
                    res.status(200).send(data);
                }
                else
                {
                    res.status(400).send({
                        message: "No Devices under the site, pile and location!"
                    });
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message || "Error occurred while fetching the device info"
                });
            });
        }
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}