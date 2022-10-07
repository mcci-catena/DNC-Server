/*############################################################################
# 
# Module: htmldata.js
#
# Description:
#     Create html format message for error data
#
# Copyright notice:
#     This file copyright (c) 2022 by
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
#     V1.3.0 Thu Oct 06 2022 11:24:35 seenivasan
#       Module created
############################################################################*/

const emailconst = require('../../config/envdata')

const {DNC_UI_URL} = {... emailconst.envobj}

exports.constructHtml = (cname, email) => {

    //let dynurl = `${DNC_UI_URL}/signup?cname=${cname}&email=${email}`
    let dynurl = `${DNC_UI_URL}`
    let client = `${cname}`
    let cemail = `${email}`
     
    let hmsg = (
        '<h2>DNC User SignUp</h2>' +
        '<h3>Please enter the below credentials while Signup</h3>'+
        '<p><b>Client Name: </b>'+client+'</p>'+
        '<p><b>Email ID: </b>'+cemail+'</p>'+
        '<p style="line-height:20px">Please click on the below link to reach <b>DNC UI Home Page</b> and then click on <b>Signup</b></p>'+
        '<a href='+dynurl+'>DNC UI Home Page</a>'
    )
    return hmsg
}