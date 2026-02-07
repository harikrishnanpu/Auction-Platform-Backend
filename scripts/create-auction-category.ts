import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

async function main() {
    const category = await prisma.auctionCategory.createMany({
        data: [
            {
                name: "Electronics",
                slug: "electronics",
            },
            {
                name: "Furniture",
                slug: "furniture",
            },
            {
                name: "Vehicles",
                slug: "vehicles",
            },
            {
                name: "Real Estate",
                slug: "real-estate",
            },
            {
                name: "Jewelry",
                slug: "jewelry",
            },
            {
                name: "Art",
                slug: "art",
            },
            {
                name: "Collectibles",
                slug: "collectibles",
            },
            {
                name: "Fashion",
                slug: "fashion",
            },
            {
                name: "Home Decor",
                slug: "home-decor",
            },
            {
                name: "Sports Equipment",
                slug: "sports-equipment",
            },
        ],
    });
    console.log(category);
}

main();