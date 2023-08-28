/*############################################################################
# 
# Module: auth.js
#
# Description:
#     JSON Web Token validation
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
#     V1.0.0 Mon April 03 2023 19:20:35 seenivasan
#       Module created
############################################################################*/

const jwt = require('jsonwebtoken');
const constants = require('../misc/constants');

exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, constants.KEY_SECRET, (err, user) => {
            if(err) {
                return res.sendStatus(403);
            }
            req.user = user;
            // console.log("Token valid done: ", user)
            next();
        });        
    }
    else
    {
        res.sendStatus(401);
    }
};