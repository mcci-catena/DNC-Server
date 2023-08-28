/*############################################################################
# 
# Module: email.js
#
# Description:
#     Email sending module
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


const nodemailer = require('nodemailer');

const mailconst = require('../config/envdata')

const {SENDER_EMAIL_ID} = {... mailconst.envobj}

const transporter = nodemailer.createTransport({
    host: 'postfix',
    port: 25,
    secure: false,
    tls: {rejectUnauthorized: false},
});

exports.sendEmail = (emailId, htmld) => {
    return new Promise(async function(resolve, reject){

        var mailOptions = {
            from: SENDER_EMAIL_ID,
            to: emailId,
            subject: 'DNC Signup Link',
            html: htmld
        };
        
        try{
            transporter.sendMail(mailOptions, function(err, data) {
                if(err) {
                    // console.log(err);
                    reject(err)
                } else {
                    console.log('Email sent successfully: ', SENDER_EMAIL_ID);
                    resolve("Email Sent Success")
                }
            });
        }
        catch(err) {
            console.log("Email sent failed")
            reject("Email Sent failed")
        }
    })
}

// To send OTP mail
exports.sendOTPmail = (otpNum, req, res) => {
    
    var mailOptions = {
        from: SENDER_EMAIL_ID,
        to: req.body.email,
        subject: 'Test mail from DNC Server',
        text: 'Your OTP from DNC is '+ otpNum
    };
    
	try{
		transporter.sendMail(mailOptions, function(err, data) {
            if(err) {
                console.log(err);
            } else {
                console.log('Email sent successfully');
			}
        });
		return true;
	}
	catch(err) {
		return res.status(400).send({message: "Send OTP failed"}); 
	}
	
}