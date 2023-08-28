/*############################################################################
# 
# Module: mathutil.js
#
# Description:
#     Controller for Math Util functions
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
#     V2.0.0 Mon April 17 2023 11:15:21 seenivasan
#       Module created
############################################################################*/

// Utility functions - Generate 4 digit random numbers

exports.GenerateRandom = () =>
{
   var a = Math.floor((Math.random() * 9999) + 999);
   a = String(a);
   return a = a.substring(0, 4);
}