/*############################################################################
# 
# Module: envdata.js
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
#     V2.0.0 Fri Feb 24 2023 15:17:35 seenivasan
#       Module created
############################################################################*/

const dotenv = require('dotenv').config()

exports.envobj = {
    DB_HOST : process.env.DB_HOST,
    DB_PORT : process.env.DB_PORT || 27017,

    DB_ROOT_USER : process.env.DB_ROOT_USER,
    DB_ROOT_PWD : encodeURIComponent(process.env.DB_ROOT_PWD),

    DB_DNC_USER : process.env.DB_DNC_USER,
    DB_DNC_PWD : encodeURIComponent(process.env.DB_DNC_PWD),
    DB_DNC_NAME : process.env.DB_DNC_NAME,

    APP_PORT : process.env.DNC_SERVER_PORT || 7795,

    SENDER_EMAIL_ID : process.env.SENDER_EMAIL_ID,
    DNC_UI_URL : process.env.DNC_UI_URL,

    FIRST_ADMIN_CODE : process.env.FIRST_ADMIN_CODE,

    SESSION_TIMEOUT : process.env.SESSION_TIMEOUT,

    FIRST_CUSTOM_CODE : process.env.FIRST_CUSTOM_CODE
} 