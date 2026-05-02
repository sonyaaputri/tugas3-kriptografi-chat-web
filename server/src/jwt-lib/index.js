/**
 * index.js
 * Entry point untuk JWT library
 * Export fungsi sign dan verify yang menjadi antarmuka utama library ini
 */

const { sign } = require("./sign");
const { verify } = require("./verify");

module.exports = { sign, verify };