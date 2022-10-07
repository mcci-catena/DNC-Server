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
#     V1.3.0 Thu Oct 06 2022 11:24:35 seenivasan
#       Module created
############################################################################*/

exports.envobj = {
    DB_DNC_USER : process.env.MONGO_DNC_USERNAME,
    DB_DNC_PWD : encodeURIComponent(process.env.MONGO_DNC_PASSWD),
    DB_DNC_NAME : process.env.MONGO_DNC_DBNAME,

    DB_ROOT_USER : process.env.MONGO_INITDB_ROOT_USERNAME,
    DB_ROOT_PWD : encodeURIComponent(process.env.MONGO_INITDB_ROOT_PASSWORD),

    FROM_EMAIL_ID : process.env.DNC_MAIL_ID,
    DNC_UI_URL : process.env.DNC_UI_URL
} 