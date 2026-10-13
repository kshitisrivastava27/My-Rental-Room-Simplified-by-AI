
require("dotenv").config();

const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
    image: { type: String, default: "" }
});

const Property = mongoose.model("Property", propertySchema);

const sampleProperties = [
    {
        title: "Modern 1 BHK Apartment",
        location: "Kalyanpur, Kanpur",
        price: 8500,
        type: "1 BHK",
        image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80"
    },
    {
        title: "Fully Furnished Room",
        location: "Swaroop Nagar, Kanpur",
        price: 7000,
        type: "Single Room",
        image: "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=80"
    },
    {
        title: "Affordable PG",
        location: "Kakadeo, Kanpur",
        price: 6000,
        type: "PG",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80"
    },
    {
        title: "Spacious 2 BHK",
        location: "Civil Lines, Kanpur",
        price: 12000,
        type: "2 BHK",
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80"
    }
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB Atlas.");

        // Insert only if the collection is empty.
        const existingCount = await Property.countDocuments();

        if (existingCount > 0) {
            console.log(
                `Database already contains ${existingCount} properties. No records inserted.`
            );
            return;
        }

        await Property.insertMany(sampleProperties);

        console.log("Successfully inserted 4 sample properties.");
    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

seedDatabase();
