
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5000;

// ------------------------------------------
// 1. MIDDLEWARE
// ------------------------------------------

app.use(cors());
app.use(express.json({ limit: "10kb" }));

// ------------------------------------------
// 2. VALIDATE ENVIRONMENT CONFIGURATION
// ------------------------------------------

if (!process.env.MONGODB_URI) {
    console.error(
        "Error: MONGODB_URI is missing. Check your backend .env file."
    );
    process.exit(1);
}

// ------------------------------------------
// 3. PROPERTY SCHEMA
// ------------------------------------------

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        location: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150
        },

        price: {
            type: Number,
            required: true,
            min: 1
        },

        type: {
            type: String,
            required: true,
            trim: true,
            enum: ["1 BHK", "2 BHK", "Single Room", "PG"]
        },

        image: {
            type: String,
            default: "",
            trim: true,
            maxlength: 2048
        }
    },
    {
        timestamps: true
    }
);

const Property = mongoose.model("Property", propertySchema);

// ------------------------------------------
// 4. HOME ROUTE
// ------------------------------------------

app.get("/", (req, res) => {
    res.send("My Rental Room backend is running!");
});

// ------------------------------------------
// 5. GET ALL PROPERTIES
// GET /api/properties
// ------------------------------------------

app.get("/api/properties", async (req, res) => {
    try {
        const properties = await Property.find()
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            count: properties.length,

            properties: properties.map(property => ({
                id: property._id.toString(),
                title: property.title,
                location: property.location,
                price: property.price,
                type: property.type,
                image: property.image
            }))
        });
    } catch (error) {
        console.error("Error fetching properties:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to retrieve properties."
        });
    }
});

// ------------------------------------------
// 6. ADD A NEW PROPERTY
// POST /api/properties
// ------------------------------------------

app.post("/api/properties", async (req, res) => {
    try {
        const { title, location, price, type, image } = req.body;

        // Validate required text fields.
        if (
            typeof title !== "string" ||
            !title.trim() ||
            typeof location !== "string" ||
            !location.trim() ||
            typeof type !== "string" ||
            !type.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, location, and room type are required."
            });
        }

        // Validate the monthly rent.
        if (
            price === undefined ||
            price === null ||
            price === "" ||
            !Number.isFinite(Number(price)) ||
            Number(price) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid positive number."
            });
        }

        // Validate the optional image URL.
        let imageUrl = "";

        if (image !== undefined && image !== "") {
            if (typeof image !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Image must be a valid URL string."
                });
            }

            try {
                const parsedUrl = new URL(image);

                if (
                    !["http:", "https:"].includes(parsedUrl.protocol)
                ) {
                    throw new Error("Unsupported URL protocol");
                }

                imageUrl = parsedUrl.href;
            } catch {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid HTTP or HTTPS image URL."
                });
            }
        }

        // Create and save the property in MongoDB.
        const newProperty = await Property.create({
            title: title.trim(),
            location: location.trim(),
            price: Number(price),
            type: type.trim(),
            image: imageUrl
        });

        res.status(201).json({
            success: true,
            message: "Property added successfully!",

            property: {
                id: newProperty._id.toString(),
                title: newProperty.title,
                location: newProperty.location,
                price: newProperty.price,
                type: newProperty.type,
                image: newProperty.image
            }
        });
    } catch (error) {
        // Handle schema validation errors.
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        console.error("Error adding property:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to add the property."
        });
    }
});

// ------------------------------------------
// 7. HANDLE UNKNOWN API ROUTES
// ------------------------------------------

app.use("/api", (req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found."
    });
});

// ------------------------------------------
// 8. CONNECT TO MONGODB AND START SERVER
// ------------------------------------------

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected to MongoDB Atlas successfully.");

        app.listen(PORT, () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    }
}

startServer();
