/*############################################################################
# 
# Module: htmllink.js
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

const emailconst = require('../config/envdata')

const {DNC_UI_URL} = {... emailconst.envobj}

exports.constructHtml = (turl, email, fncode) => {
    if(fncode == "nusu"){
        return signupBody(email, turl)
    }
    else{
        return forgotPwdBody(email, turl)
    }
    
}

function signupBody(email, turl){
    let dynurl = `${DNC_UI_URL}/signup?user=${turl}`
    // let dynurl = `${DNC_UI_URL}`
    // let client = `${cname}`
    let cemail = `${email}`

    let hmsg = (
        '<h2>DNC New User Sign Up</h2>' +
        '<p><b>Email ID: </b>'+cemail+'</p>'+
        '<p style="line-height:20px">Please click on the below link to reach DNC UI SignUp Page</p>'+
        '<a href='+dynurl+'>DNC UI SignUp Page</a>'
    )
    return hmsg
}

function forgotPwdBody(email, turl){
    let dynurl = `${DNC_UI_URL}/fgpwd?user=${turl}`
    // let dynurl = `${DNC_UI_URL}`
    // let client = `${cname}`
    let cemail = `${email}`

    let hmsg = (
        '<h2>DNC Forgot Password</h2>' +
        '<p><b>Email ID: </b>'+cemail+'</p>'+
        '<p style="line-height:20px">Please click on the below link to reach DNC UI Forgot Password Page</p>'+
        '<a href='+dynurl+'>DNC UI Forgot Page</a>'
    )
    return hmsg
}