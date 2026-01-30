"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTP = exports.OtpStatus = exports.OtpChannel = exports.OtpPurpose = void 0;
const entity_1 = require("../shared/entity");
const result_1 = require("../shared/result");
var OtpPurpose;
(function (OtpPurpose) {
    OtpPurpose["REGISTER"] = "REGISTER";
    OtpPurpose["LOGIN"] = "LOGIN";
    OtpPurpose["VERIFY_PHONE"] = "VERIFY_PHONE";
    OtpPurpose["VERIFY_EMAIL"] = "VERIFY_EMAIL";
    OtpPurpose["RESET_PASSWORD"] = "RESET_PASSWORD";
})(OtpPurpose || (exports.OtpPurpose = OtpPurpose = {}));
var OtpChannel;
(function (OtpChannel) {
    OtpChannel["SMS"] = "SMS";
    OtpChannel["EMAIL"] = "EMAIL";
})(OtpChannel || (exports.OtpChannel = OtpChannel = {}));
var OtpStatus;
(function (OtpStatus) {
    OtpStatus["PENDING"] = "PENDING";
    OtpStatus["VERIFIED"] = "VERIFIED";
    OtpStatus["EXPIRED"] = "EXPIRED";
    OtpStatus["BLOCKED"] = "BLOCKED";
})(OtpStatus || (exports.OtpStatus = OtpStatus = {}));
class OTP extends entity_1.Entity {
    get user_id() { return this.props.user_id; }
    get identifier() { return this.props.identifier; }
    get otp_hash() { return this.props.otp_hash; }
    get purpose() { return this.props.purpose; }
    get channel() { return this.props.channel; }
    get expires_at() { return this.props.expires_at; }
    get attempts() { return this.props.attempts; }
    get max_attempts() { return this.props.max_attempts; }
    get status() { return this.props.status; }
    get created_at() { return this.props.created_at; }
    constructor(props, id) {
        super(props, id);
    }
    static create(props, id) {
        return result_1.Result.ok(new OTP({
            ...props,
            attempts: props.attempts ?? 0,
            max_attempts: props.max_attempts ?? 3,
            status: props.status ?? OtpStatus.PENDING,
            created_at: props.created_at ?? new Date(),
        }, id));
    }
    isExpired() {
        return new Date() > this.props.expires_at;
    }
    incrementAttempts() {
        this.props.attempts++;
    }
    isMaxAttemptsReached() {
        return this.props.attempts >= this.props.max_attempts;
    }
    verify(otpHash) {
        return this.props.otp_hash === otpHash;
    }
    markAsVerified() {
        this.props.status = OtpStatus.VERIFIED;
    }
    markAsExpired() {
        this.props.status = OtpStatus.EXPIRED;
    }
}
exports.OTP = OTP;
