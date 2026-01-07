import { IDomainEvent } from "../shared/domain-event";
import { UserId } from "./user-id.vo";
import { Email } from "./email.vo";

export class UserRegisteredDomainEvent implements IDomainEvent {
    public dateTimeOccurred: Date;
    public userId: UserId;
    public email: Email;

    constructor(userId: UserId, email: Email) {
        this.dateTimeOccurred = new Date();
        this.userId = userId;
        this.email = email;
    }

    getAggregateId(): string {
        return this.userId.value.toString();
    }
}
