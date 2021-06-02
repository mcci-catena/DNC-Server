const Clients = require('../models/client.model.js');

const validfn = require('../misc/validators.js');

const mongoose = require('mongoose');

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
            mschema = {} 
            mschema["latitude"] = {"type": "String"}
            mschema["longitude"] = {"type": "String"}
            var taglist = data.taglist
            console.log("TagList: ", taglist, taglist.length)
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

            indict["hwid"] = req.body.id                  // previously devEUI, in WeRadiate devid
            indict["idate"] = req.body.datetime
            indict["rdate"] = ''


            console.log("Findict: ", indict)

            //filtdict["devEUI"] = req.body.id
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