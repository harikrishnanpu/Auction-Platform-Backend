"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KYCType = exports.KYCStatus = void 0;
var KYCStatus;
(function (KYCStatus) {
    KYCStatus["PENDING"] = "PENDING";
    KYCStatus["VERIFIED"] = "VERIFIED";
    KYCStatus["REJECTED"] = "REJECTED";
})(KYCStatus || (exports.KYCStatus = KYCStatus = {}));
var KYCType;
(function (KYCType) {
    KYCType["SELLER"] = "SELLER";
    KYCType["MODERATOR"] = "MODERATOR";
})(KYCType || (exports.KYCType = KYCType = {}));
