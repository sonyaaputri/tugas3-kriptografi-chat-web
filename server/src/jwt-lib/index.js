/**
 * index.js
 * Entry point untuk JWT library
 * Export fungsi sign dan verify yang menjadi antarmuka utama library ini
 */

import { sign } from "./sign.js";
import { verify } from "./verify.js";

export { sign, verify };