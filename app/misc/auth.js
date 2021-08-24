/*############################################################################
# 
# Module: auth.js
#
# Description:
#     Authenticate the user
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
#     V1.1.1 Wed Feb 17 2021 11:24:35 seenivasan
#       Module created
############################################################################*/

const jwt = require('jsonwebtoken');
const constants = require('./constants');

exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if(authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, constants.KEY_SECRET, (err, user) => {
            if(err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });        
    }
    else
    {
        res.sendStatus(401);
    }
};