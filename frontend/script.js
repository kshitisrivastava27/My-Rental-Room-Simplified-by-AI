
const API_URL = "http://localhost:5000/api/properties";

const properties = [];
const favorites = new Set();

// --------------------------------------------------
// 1. GET USER PREFERENCES
// --------------------------------------------------

function getPreferences() {
    const location = document
        .getElementById("location")
        .value.trim()
        .toLowerCase();

    const budgetValue = document.getElementById("budget").value.trim();
    const budget = budgetValue === "" ? null : Number(budgetValue);
    const roomType = document.getElementById("roomType").value;

    return { location, budget, roomType };
}

// --------------------------------------------------
// 2. CALCULATE RECOMMENDATION SCORE
// --------------------------------------------------

function getRecommendationScore(property, preferences) {
    let score = 0;
    let totalWeight = 0;
    const reasons = [];

    if (preferences.location !== "") {
        totalWeight += 40;

        if (
            property.location.toLowerCase().includes(preferences.location)
        ) {
            score += 40;
            reasons.push("Location match");
        }
    }

    if (preferences.budget !== null) {
        totalWeight += 35;

        if (property.price <= preferences.budget) {
            score += 35;
            reasons.push("Within budget");
        } else {
            reasons.push("Above budget");
        }
    }

    if (preferences.roomType !== "") {
        totalWeight += 25;

        if (property.type === preferences.roomType) {
            score += 25;
            reasons.push("Room type match");
        }
    }

    if (totalWeight === 0) {
        return {
            score: 0,
            percentage: null,
            reasons: ["Enter preferences to see your match score"]
        };
    }

    return {
        score,
        percentage: Math.round((score / totalWeight) * 100),
        reasons
    };
}

// --------------------------------------------------
// 3. DISPLAY PROPERTY CARDS
// --------------------------------------------------

function displayProperties(data) {
    const container = document.getElementById("property-container");
    const preferences = getPreferences();

    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No rooms found</h3>
                <p>No property listings are available yet.</p>
                <button class="details-btn" id="empty-reset-btn">
                    Show All Rooms
                </button>
            </div>
        `;

        document.getElementById("empty-reset-btn")
            .addEventListener("click", resetSearch);
        return;
    }

    data.forEach(property => {
        const recommendation = getRecommendationScore(property, preferences);
        const isFavorite = favorites.has(String(property.id));

        const card = document.createElement("article");
        card.className = "property-card";

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "image-wrapper";

        const image = document.createElement("img");
        image.className = "property-image";
        image.src = property.image || "";
        image.alt = property.title;
        image.loading = "lazy";

        image.addEventListener("error", function () {
            this.style.display = "none";
            imageWrapper.classList.add("image-unavailable");
        });

        const badge = document.createElement("span");
        badge.className = "image-badge";
        badge.textContent = recommendation.percentage === null
            ? "Add preferences"
            : `Match: ${recommendation.percentage}%`;

        const favoriteButton = document.createElement("button");
        favoriteButton.className = `favorite-btn ${isFavorite ? "saved" : ""}`;
        favoriteButton.textContent = isFavorite ? "♥" : "♡";
        favoriteButton.setAttribute("aria-label", "Toggle favorite");
        favoriteButton.setAttribute("aria-pressed", String(isFavorite));
        favoriteButton.title = isFavorite ? "Remove favorite" : "Save property";
        favoriteButton.addEventListener("click", () => toggleFavorite(property.id));

        imageWrapper.append(image, badge, favoriteButton);

        const content = document.createElement("div");
        content.className = "property-content";

        const type = document.createElement("span");
        type.className = "property-type";
        type.textContent = property.type;

        const title = document.createElement("h3");
        title.textContent = property.title;

        const location = document.createElement("p");
        location.className = "location";
        location.textContent = `📍 ${property.location}`;

        const reasons = document.createElement("p");
        reasons.className = "match-reasons";
        reasons.textContent = recommendation.reasons.join(" · ");

        const info = document.createElement("div");
        info.className = "property-info";

        const price = document.createElement("span");
        price.className = "price";
        price.textContent = `₹${Number(property.price).toLocaleString("en-IN")} `;

        const monthly = document.createElement("small");
        monthly.textContent = "/ month";
        price.appendChild(monthly);
        info.appendChild(price);

        const detailsButton = document.createElement("button");
        detailsButton.className = "details-btn";
        detailsButton.textContent = "View Details →";
        detailsButton.addEventListener("click", () => viewDetails(property.id));

        content.append(type, title, location, reasons, info, detailsButton);
        card.append(imageWrapper, content);
        container.appendChild(card);
    });
}

// --------------------------------------------------
// 4. SEARCH AND RANK PROPERTIES
// --------------------------------------------------

function searchProperties() {
    const preferences = getPreferences();

    if (
        preferences.budget !== null &&
        (!Number.isFinite(preferences.budget) || preferences.budget <= 0)
    ) {
        alert("Please enter a budget greater than zero.");
        return;
    }

    const rankedProperties = properties
        .map(property => ({
            property,
            recommendation: getRecommendationScore(property, preferences)
        }))
        .sort((a, b) => {
            if (b.recommendation.score !== a.recommendation.score) {
                return b.recommendation.score - a.recommendation.score;
            }

            return a.property.price - b.property.price;
        })
        .map(item => item.property);

    displayProperties(rankedProperties);

    // Bring the updated results into view.
    document.getElementById("properties").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// --------------------------------------------------
// 5. VIEW PROPERTY DETAILS
// --------------------------------------------------

function viewDetails(id) {
    const property = properties.find(
        item => String(item.id) === String(id)
    );

    if (!property) {
        alert("Property not found.");
        return;
    }

    alert(
        `${property.title}\n\n` +
        `Location: ${property.location}\n` +
        `Monthly Rent: ₹${Number(property.price).toLocaleString("en-IN")}\n` +
        `Room Type: ${property.type}\n\n` +
        "Contact and booking features can be added next."
    );
}

// --------------------------------------------------
// 6. FAVORITES
// --------------------------------------------------

function toggleFavorite(id) {
    const propertyId = String(id);

    if (favorites.has(propertyId)) {
        favorites.delete(propertyId);
    } else {
        favorites.add(propertyId);
    }

    searchPropertiesWithoutScrolling();
}

function searchPropertiesWithoutScrolling() {
    const preferences = getPreferences();

    const rankedProperties = [...properties].sort((a, b) => {
        const scoreA = getRecommendationScore(a, preferences).score;
        const scoreB = getRecommendationScore(b, preferences).score;

        return scoreB - scoreA || a.price - b.price;
    });

    displayProperties(rankedProperties);
}

// --------------------------------------------------
// 7. RESET SEARCH / VIEW ALL
// --------------------------------------------------

function resetSearch() {
    document.getElementById("location").value = "";
    document.getElementById("budget").value = "";
    document.getElementById("roomType").value = "";

    searchPropertiesWithoutScrolling();
}

// --------------------------------------------------
// 8. LOAD PROPERTIES FROM BACKEND
// --------------------------------------------------

async function loadProperties() {
    const container = document.getElementById("property-container");

    container.innerHTML = "<p>Loading properties...</p>";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.properties)) {
            throw new Error("Invalid property data received.");
        }

        properties.length = 0;
        properties.push(...data.properties);

        searchPropertiesWithoutScrolling();
    } catch (error) {
        console.error("Unable to load properties:", error);

        container.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load properties</h3>
                <p>Check your backend connection and try again.</p>
                <button class="details-btn" id="retry-load-btn">
                    Try Again
                </button>
            </div>
        `;

        document.getElementById("retry-load-btn")
            .addEventListener("click", loadProperties);
    }
}

// --------------------------------------------------
// 9. LIST YOUR ROOM MODAL
// --------------------------------------------------

function initializeListingModal() {
    const modal = document.getElementById("listing-modal");
    const openButton = document.getElementById("open-listing-btn");
    const closeButton = document.getElementById("close-listing-btn");
    const form = document.getElementById("listing-form");

    if (!modal || !openButton || !closeButton || !form) {
        console.error(
            "Listing form elements are missing. Check index.html IDs."
        );
        return;
    }

    function openModal() {
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        document.getElementById("listing-title-input").focus();
    }

    function closeModal() {
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        openButton.focus();
    }

    openButton.addEventListener("click", openModal);
    closeButton.addEventListener("click", closeModal);

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    // --------------------------------------------------
    // 10. SUBMIT A NEW PROPERTY
    // --------------------------------------------------

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const message = document.getElementById("listing-message");
        const submitButton = document.getElementById("submit-listing-btn");

        message.textContent = "";
        message.className = "form-message";

        const title = document.getElementById("listing-title-input").value.trim();
        const location = document.getElementById("listing-location").value.trim();
        const price = Number(document.getElementById("listing-price").value);
        const type = document.getElementById("listing-type").value;
        const image = document.getElementById("listing-image").value.trim();

        if (!title || !location || !type || !Number.isFinite(price) || price <= 0) {
            message.textContent = "Please enter valid details in all required fields.";
            message.classList.add("error");
            return;
        }

        const payload = { title, location, price, type, image };

        submitButton.disabled = true;
        submitButton.textContent = "Adding Property...";

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Unable to add property.");
            }

            message.textContent = "Property added successfully!";
            message.classList.add("success");

            form.reset();

            // Fetch the latest list from MongoDB.
            await loadProperties();

            // Show the updated listings.
            document.getElementById("properties").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            // Close the modal after a short pause so success is visible.
            window.setTimeout(() => {
                if (!modal.hidden) {
                    modal.hidden = true;
                    modal.setAttribute("aria-hidden", "true");
                    document.body.classList.remove("modal-open");
                }
            }, 1000);
        } catch (error) {
            console.error("Unable to add property:", error);
            message.textContent = error.message || "Something went wrong. Please try again.";
            message.classList.add("error");
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Add Property";
        }
    });
}

// --------------------------------------------------
// 11. CONNECT PAGE BUTTONS
// --------------------------------------------------

document.getElementById("search-btn")
    ?.addEventListener("click", searchProperties);

document.getElementById("view-all-btn")
    ?.addEventListener("click", resetSearch);

// Pressing Enter in a search field runs the search.
["location", "budget", "roomType"].forEach(id => {
    document.getElementById(id)?.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchProperties();
        }
    });
});

// Initialize and load data.
initializeListingModal();
loadProperties();
