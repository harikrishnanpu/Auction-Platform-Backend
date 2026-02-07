import { PrismaClient } from "@prisma/client";



const prisma = new PrismaClient();


async function main() {
    const condition = await prisma.auctionCondition.createMany({
        data: [
            {
                name: "New",
            },
            {
                name: "Used",
            },
            {
                name: "Refurbished",

            },
        ],
    });
    console.log(condition);
}

main();
