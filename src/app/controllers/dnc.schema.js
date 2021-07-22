const mongoose = require('mongoose');

exports.getDevSchema = (data) => {
    mschema = {} 
            
    mschema["latitude"] = {"type": "String"}
    mschema["longitude"] = {"type": "String"}
    var taglist = data.taglist
    for(i=0; i<taglist.length; i++)
    {
        mschema[taglist[i]] = {"type": "String"}
    }
    mschema["hwid"] = {"type": "String"}
    mschema["idate"] = {"type": "Date"}
    mschema["rdate"] = {"type": "Date"}

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
