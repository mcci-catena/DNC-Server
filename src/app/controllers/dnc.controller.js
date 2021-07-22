const mongoose = require('mongoose');
const Client = require('../models/client.model.js');

exports.alogin = (req, res) => {
    var filter = {"dbdata.user": req.body.influxd.uname, "dbdata.pwd": req.body.influxd.pwd, "dbdata.dbname": req.body.influxd.dbname}
    Client.findOne(filter)
    .then(function(data){
        if(data)
        {
            res.status(200).send(data)
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


exports.readtags = (req, res) => {
    //var filter = {"dbdata.user": req.body.influxd.uname, "dbdata.pwd": req.body.influxd.pwd, "dbdata.dbname": req.body.influxd.dbname}
    var filter = {"cname": req.body.influxd.uname}

    console.log("Read Tags: ", filter)
    
    Client.findOne(filter)
    .then(function(data){
        if(data)
        {
            res.status(200).send({
                message: data.taglist
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


exports.readtagval = (req, res) => {
    //var filter = {"dbdata.user": req.body.influxd.uname, "dbdata.pwd": req.body.influxd.pwd, "dbdata.dbname": req.body.influxd.dbname}
    var filter = {"cname": req.body.influxd.uname}
    Client.findOne(filter)
    .then(async function(data){
        if(data)
        {
            var tagname = null
            gettn = req.body.influxd.query.split("KEY")
            const rek = /"(.*?)"/g;
            inptag = (rek.exec(gettn[1])).pop()

            if(data.taglist.indexOf(inptag) > -1)
            {
                tagname = inptag
            
                var keydict = {}
                var filtdict = {}
                var tagval = []

                if(req.body.influxd.query.includes("WHERE"))
                {
                    var resstr = req.body.influxd.query.split("WHERE")
                    var nq = resstr[1].replace(new RegExp("AND", 'g'), "OR")
                    var ql = nq.split("OR")
        
                    var tagall = extractTags(ql)

                    keydict = tagall[0]
                }

                try{
                    var gval = await getDNCTagValues(data, tagname, keydict)
                    for(var j=0; j<gval.length; j++)
                    {
                        tagval.push(gval[j])
                    }
                    
                }catch(err){
                    console.log("DNC Val Read Err: ", err)
                }
                        
                var resdict = {}
                var dict = {}
                        
                if(req.body.influxd.query.includes("SHOW TAG VALUES FROM"))
                {
                    var measstr = req.body.influxd.query.split("FROM")
                    const rek = /"(.*?)"/g;
                    var measname = (rek.exec(measstr[1])).pop()
                    dict["name"] = measname
                }
                else
                {
                    dict["name"] = "MeasName"
                } 
                        
                dict["columns"] = ["key","value"]
                dict["values"] = tagval 
        
                var dictm = {}
                dictm["statement_id"] = 0
                dictm["series"] = [dict]
        
                resdict["results"] = [dictm]
                res.status(200).send(resdict)

            }
            else{
                res.status(401).send({
                    message: "Invalid Tag"
                }); 
            }
        }
        else
        {
            res.status(401).send({
                message: "Invalid User!"
            });
        }
    })
    .catch((err) => {
        console.log("Get Val Catch Error: ", err)
        res.status(500).send({
            message: err.message || "Error occurred while fetching the client info"
        });
    });
}


function getDevSchema(data)
{
    mschema = {} 
            
    mschema["latitude"] = {"type": "String"}
    mschema["longitude"] = {"type": "String"}
    var taglist = data.taglist
    for(i=0; i<taglist.length; i++)
    {
        mschema[taglist[i]] = {"type": "String"}
    }
    mschema["devEUI"] = {"type": "String"}
    mschema["idate"] = {"type": "String"}
    mschema["rdate"] = {"type": "String"}

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


function getDNCTagValues(data1, tagname, filtdict)
{
    return new Promise(function(resolve, reject) {
        var tagval = [];
        Cdev = getDevSchema(data1)
        Cdev.find(filtdict)
        .then(data => {
            if(data)
            {
                for(var j=0; j<data.length; j++)
                {
                    var indata = data[j][tagname]
                    tagval.push(indata);
                }
                resolve(tagval)
            }
            reject("Data Not Available")
        }).catch(err => {
            reject("Filter Error")
        });
    });
}


function extractTags(inq)
{
    var alltag = []
    var ntag = []
    var nval = []

    const rek = /"(.*?)"/g;
    const rev = /'(.*?)'/g;

    
    for(var i=0; i<inq.length; i++)
    {
        const rek = /"(.*?)"/g;
        const rev = /'(.*?)'/g;      
  
        ntag.push((rek.exec(inq[i])).pop())
        nval.push((rev.exec(inq[i])).pop())
    }

    var dictall = {}

    for(var i=0; i<ntag.length; i++)
    {
        if(dictall.hasOwnProperty(ntag[i]))
        {
            dictall[ntag[i]].push(nval[i])
        }
        else
        {
            dictall[ntag[i]] = [nval[i]] 
        }
    } 
    
    alltag.push(dictall)
    
    return alltag
}