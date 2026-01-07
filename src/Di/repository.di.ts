import { MongoUserRepository } from "@infrastructure/database/mongo/user.repository.impl";



export const userRepository = new MongoUserRepository();
