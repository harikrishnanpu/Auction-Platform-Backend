import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding auction categories and conditions...');

    // Seed categories
    const categories = [
        { name: 'Electronics', slug: 'electronics' },
        { name: 'Vehicles', slug: 'vehicles' },
        { name: 'Art & Collectibles', slug: 'art-collectibles' },
        { name: 'Fashion & Accessories', slug: 'fashion-accessories' },
        { name: 'Home & Garden', slug: 'home-garden' },
        { name: 'Sports & Outdoors', slug: 'sports-outdoors' },
        { name: 'Jewelry & Watches', slug: 'jewelry-watches' },
        { name: 'Books & Media', slug: 'books-media' },
    ];

    for (const category of categories) {
        await prisma.auctionCategory.upsert({
            where: { slug: category.slug },
            update: {},
            create: category,
        });
    }

    console.log(`Created ${categories.length} categories`);

    // Seed conditions
    const conditions = [
        { name: 'New', description: 'Brand new, unused item in original packaging' },
        { name: 'Like New', description: 'Gently used, in excellent condition' },
        { name: 'Very Good', description: 'Previously used, well maintained' },
        { name: 'Good', description: 'Used with normal wear and tear' },
        { name: 'Fair', description: 'Heavily used, may have cosmetic damage' },
        { name: 'For Parts', description: 'Not fully functional, sold for parts' },
        { name: 'Refurbished', description: 'Professionally restored to working condition' },
    ];

    for (const condition of conditions) {
        await prisma.auctionCondition.upsert({
            where: { name: condition.name },
            update: {},
            create: condition,
        });
    }

    console.log(`Created ${conditions.length} conditions`);
    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
