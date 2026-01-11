"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRegisteredDomainEvent = void 0;
class UserRegisteredDomainEvent {
    constructor(userId, email) {
        this.dateTimeOccurred = new Date();
        this.userId = userId;
        this.email = email;
    }
    getAggregateId() {
        return this.userId.value.toString();
    }
}
exports.UserRegisteredDomainEvent = UserRegisteredDomainEvent;
