"use strict";

const promotionSlides = [
    { title: "pizzaPromotion", caption: "pizzaPromotionText", image: "images/restaurants/pizza-corner.webp", restaurant: "pizza" },
    { title: "heroTitle", caption: "demoNotice", image: "images/hero.webp" },
    { title: "freshPromotion", caption: "freshPromotionText", image: "images/restaurants/green-bite.webp", restaurant: "green" }
];

const catalogText = {
    lt: {
        promotions: "Pasiūlymai",
        previousPromotion: "Ankstesnis pasiūlymas",
        nextPromotion: "Kitas pasiūlymas",
        pausePromotions: "Pristabdyti pasiūlymus",
        playPromotions: "Tęsti pasiūlymų slinkimą",
        promotionPage: "Rodyti pasiūlymų puslapį",
        pizzaPromotion: "Laikas picai!",
        pizzaPromotionText: "Atrask „Pizza Corner“ meniu",
        freshPromotion: "Švieži skoniai",
        freshPromotionText: "Atrask „Green Bite“ meniu",
        nearbyOffers: "Pasiūlymai netoliese",
        showAll: "Rodyti viską",
        showLess: "Rodyti mažiau",
        previousRestaurants: "Ankstesni restoranai",
        nextRestaurants: "Kiti restoranai",
        cuisineCategories: "Restoranų kategorijos",
        lithuanianChip: "Lietuviška",
        pizzaChip: "Picos",
        burgerChip: "Mėsainiai",
        sushiChip: "Sušiai",
        greenChip: "Salotos",
        allRestaurants: "Visi restoranai",
        noFavourites: "Dar neturi mėgstamiausių restoranų.",
        restaurantInformation: "Restorano informacija",
        chooseLocation: "Pasirinkti vietą",
        vilnius: "Vilnius",
        locationAddress: "Adresas Vilniuje",
        locationHelp: "Jei adreso neįvesi, rodysime Vilnių.",
        saveLocation: "Išsaugoti vietą",
        searchMenu: "Ieškoti meniu",
        searchRestaurant: "Ieškoti",
        menuSections: "Meniu skiltys",
        discover: "Atrask",
        featuredDishes: "Rekomenduojame",
        restaurantOffers: "Pasiūlymai ir privalumai",
        orderRewards: "Kaupk XP už užsakymus",
        showDetails: "Rodyti detales",
        noDishes: "Pagal šią paiešką patiekalų nerasta.",
        dishCount: "patiekalai",
        addedDish: "Pridėta į krepšelį",
        addDishToCart: "Į krepšelį",
        dishQuantity: "Kiekis",
        decreaseDishQuantity: "Sumažinti kiekį",
        increaseDishQuantity: "Padidinti kiekį",
        ratingLabel: "Įvertinimas",
        deliveryFee: "Demonstracinis pristatymo mokestis",
        deliveryTime: "Numatomas pristatymo laikas",
        close: "Uždaryti"
    },
    en: {
        promotions: "Offers",
        previousPromotion: "Previous offer",
        nextPromotion: "Next offer",
        pausePromotions: "Pause offers",
        playPromotions: "Resume offers",
        promotionPage: "Show offers page",
        pizzaPromotion: "Pizza time!",
        pizzaPromotionText: "Explore the Pizza Corner menu",
        freshPromotion: "Fresh flavours",
        freshPromotionText: "Explore the Green Bite menu",
        nearbyOffers: "Nearby picks",
        showAll: "See all",
        showLess: "See less",
        previousRestaurants: "Previous restaurants",
        nextRestaurants: "Next restaurants",
        cuisineCategories: "Restaurant categories",
        lithuanianChip: "Lithuanian",
        pizzaChip: "Pizza",
        burgerChip: "Burgers",
        sushiChip: "Sushi",
        greenChip: "Salads",
        allRestaurants: "All restaurants",
        noFavourites: "You haven’t saved any restaurants yet.",
        restaurantInformation: "Restaurant information",
        chooseLocation: "Choose a location",
        vilnius: "Vilnius",
        locationAddress: "Address in Vilnius",
        locationHelp: "Leave the address blank to show Vilnius.",
        saveLocation: "Save location",
        searchMenu: "Search the menu",
        searchRestaurant: "Search",
        menuSections: "Menu sections",
        discover: "Discover",
        featuredDishes: "Recommended",
        restaurantOffers: "Offers and benefits",
        orderRewards: "Earn XP on orders",
        showDetails: "See details",
        noDishes: "No dishes match your search.",
        dishCount: "dishes",
        addedDish: "Added to the cart",
        addDishToCart: "Add to cart",
        dishQuantity: "Quantity",
        decreaseDishQuantity: "Decrease quantity",
        increaseDishQuantity: "Increase quantity",
        ratingLabel: "Rating",
        deliveryFee: "Demo delivery fee",
        deliveryTime: "Estimated delivery time",
        close: "Close"
    }
};

const cuisineLabels = { lt: "lithuanianChip", pizza: "pizzaChip", burger: "burgerChip", sushi: "sushiChip", green: "greenChip" };
const nearbyRestaurantIds = ["pizza", "burger", "sushi", "green"];
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let catalogFilter = "all";
let catalogOrigin = null;
let returnFromRestaurantRewards = false;
let promotionPaused = reducedMotion.matches;

function restaurantCategory(id) {
    const categories = currentLanguage === "en" ? restaurantCategoriesEnglish : restaurantCategories;
    return categories[id];
}

function renderRestaurants() {
    const matching = catalogFilter === "favourites"
        ? restaurants.filter(restaurant => profileData.favouriteRestaurants.includes(restaurant.id))
        : restaurants.filter(restaurant => catalogFilter === "all" || restaurant.id === catalogFilter);

    const primaryList = document.getElementById("restaurantList");
    primaryList.innerHTML = matching.map(restaurantCard).join("");
    document.getElementById("nearbyList").innerHTML = nearbyRestaurantIds
        .map(id => restaurantCard(restaurants.find(restaurant => restaurant.id === id))).join("");
    document.getElementById("nearbySection").hidden = catalogFilter !== "all";
    document.getElementById("catalogEmpty").hidden = matching.length > 0;
    document.getElementById("restaurantsTitle").textContent = catalogFilter === "favourites"
        ? t("favourites")
        : catalogFilter === "all" ? t("restaurants") : restaurantCategory(catalogFilter);

    document.querySelectorAll("[data-cuisine]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.cuisine === catalogFilter));
    });
    document.querySelectorAll("[data-expand]").forEach(button => {
        const track = document.getElementById(button.dataset.expand);
        button.textContent = t(track.classList.contains("expanded") ? "showLess" : "showAll");
        updateRailControls(track);
    });
}

function restaurantCard(restaurant) {
    const stats = getRestaurantRating(restaurant.id);
    const score = stats.average.toLocaleString(currentLanguage, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const ratingLabel = `${t("ratingLabel")} ${score} / 5 · ${stats.count} ${t("reviewCount")}`;
    const delivery = restaurant.delivery;
    const fee = formatMoney(delivery.fee);
    const time = `${delivery.minutes.join("–")} min`;

    return `
        <button class="catalog-card" type="button" data-open-restaurant="${escapeHTML(restaurant.id)}">
            <span class="catalog-card-image">
                <img src="${escapeHTML(restaurant.image)}" alt="" loading="lazy" decoding="async">
                ${stats.count ? `<span class="catalog-card-rating">
                    <span aria-hidden="true">★ ${score} (${stats.count})</span>
                    <span class="visually-hidden">${escapeHTML(ratingLabel)}</span>
                </span>` : ""}
            </span>
            <span class="catalog-card-copy">
                <strong>${escapeHTML(restaurant.name)}</strong>
                <span class="catalog-card-category">${escapeHTML(restaurantCategory(restaurant.id))}</span>
                <span class="catalog-card-delivery">
                    <span title="${escapeHTML(t("deliveryFee"))}">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
                            <path d="m5.5 17.5 4-7h5l4 7M8 8.5h3M13 6.5h2.5l1.5 4"/>
                        </svg>
                        <span class="visually-hidden">${escapeHTML(t("deliveryFee"))} </span>${fee}
                    </span>
                    <span title="${escapeHTML(t("deliveryTime"))}">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>
                        </svg>
                        <span class="visually-hidden">${escapeHTML(t("deliveryTime"))} </span>${time}
                    </span>
                </span>
            </span>
        </button>`;
}

function selectCuisine(id) {
    catalogFilter = id;
    const track = document.getElementById("restaurantList");
    track.classList.remove("expanded");
    track.scrollLeft = 0;
    document.querySelector('[data-expand="restaurantList"]').setAttribute("aria-expanded", "false");
    renderRestaurants();
}

function updateRailControls(track) {
    const last = Math.max(0, track.scrollWidth - track.clientWidth);
    const hasOverflow = last > 2;
    document.querySelectorAll(`[data-shift="${track.id}"]`).forEach(button => {
        button.hidden = !hasOverflow;
        const isBack = button.dataset.direction === "-1";
        button.disabled = track.id !== "promotionTrack" && (isBack ? track.scrollLeft < 2 : track.scrollLeft >= last - 2);
    });

    const expand = document.querySelector(`[data-expand="${track.id}"]`);
    if (expand) expand.hidden = !hasOverflow && !track.classList.contains("expanded");
    if (track.id === "promotionTrack") updatePromotionControls(track);
}

function slidePositions(track) {
    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    const start = track.firstElementChild.offsetLeft;
    return [...new Set([...track.children].map(slide => Math.min(max, slide.offsetLeft - start)))];
}

function activeSlide(track, positions) {
    return positions.reduce((nearest, position, index) =>
        Math.abs(position - track.scrollLeft) < Math.abs(positions[nearest] - track.scrollLeft) ? index : nearest, 0);
}

function updatePromotionControls(track) {
    const positions = slidePositions(track);
    const current = activeSlide(track, positions);
    const pages = document.getElementById("promotionPages");
    const pause = document.getElementById("promotionPause");

    if (pages.children.length !== positions.length) {
        pages.innerHTML = positions.map((_, index) =>
            `<button type="button" data-promotion-page="${index}" aria-controls="promotionTrack"></button>`
        ).join("");
    }
    [...pages.children].forEach((button, index) => {
        button.setAttribute("aria-label", `${t("promotionPage")} ${index + 1}`);
        button.setAttribute("aria-current", String(index === current));
    });

    pause.textContent = promotionPaused ? "▶" : "❚❚";
    pause.setAttribute("aria-label", t(promotionPaused ? "playPromotions" : "pausePromotions"));
    pause.title = pause.getAttribute("aria-label");
    pause.hidden = positions.length < 2;
    pages.hidden = positions.length < 2;
}

function shiftRail(track, direction) {
    const step = track.firstElementChild?.offsetWidth || track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const behavior = reducedMotion.matches ? "instant" : "smooth";
    if (track.id === "promotionTrack") {
        const positions = slidePositions(track);
        const next = (activeSlide(track, positions) + direction + positions.length) % positions.length;
        track.scrollTo({ left: positions[next], behavior });
        return;
    }
    track.scrollBy({ left: direction * (step + gap), behavior });
}

function openRestaurant(restaurantId) {
    if (!restaurants.some(restaurant => restaurant.id === restaurantId)) return;
    selectedRestaurant = restaurantId;
    document.getElementById("menuSearch").value = "";
    document.getElementById("featuredItems").scrollLeft = 0;
    document.querySelector(".menu-navigation").scrollLeft = 0;
    returnFromRestaurantRewards = false;
    selectMenuSection("discover");
    renderMenu();
    setTab("menu");
    window.scrollTo(0, 0);
    document.getElementById("menu-title").focus({ preventScroll: true });
}

function renderMenu() {
    const restaurant = restaurants.find(item => item.id === selectedRestaurant);
    const cover = document.getElementById("restaurantCoverImage");
    const icon = document.getElementById("restaurantDetailIcon");

    // Optional cover and logo paths can be set in the restaurant data.
    if (cover.getAttribute("src") !== (restaurant.cover || restaurant.image)) {
        cover.src = restaurant.cover || restaurant.image;
    }
    icon.replaceChildren();
    if (restaurant.logo) {
        const logo = new Image();
        logo.alt = "";
        logo.src = restaurant.logo;
        icon.append(logo);
    } else {
        icon.textContent = restaurant.icon;
    }

    document.getElementById("menu-title").textContent = restaurant.name;
    document.getElementById("restaurantDetailCategory").textContent = restaurantCategory(restaurant.id);
    document.getElementById("restaurantDetailMeta").textContent =
        `${restaurantCategory(restaurant.id)} · ${restaurant.dishes.length} ${t("dishCount")}`;
    document.getElementById("menuSearch").placeholder = `${t("searchRestaurant")} ${restaurant.name}`;
    document.getElementById("featuredItems").innerHTML = items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item.restaurantId === restaurant.id)
        .slice(0, 3)
        .map(({ item, index }) => dishCard(item, index)).join("");
    updateMenuRating();
    updateFavouriteButton();
    renderMenuDishes();
}

function updateMenuRating() {
    const stats = getRestaurantRating(selectedRestaurant);
    const average = stats.average.toLocaleString(currentLanguage === "en" ? "en" : "lt", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    });
    document.getElementById("menuRating").textContent = stats.count ? `★ ${average} / 5` : "";
    document.getElementById("menuRating").hidden = !stats.count;
    document.getElementById("menuReviewCount").textContent = `${stats.count} ${t("reviewCount")}`;
}

function dishCard(item, index) {
    const focus = item.photoFocus ? ` style="object-position: ${escapeHTML(item.photoFocus)}"` : "";
    const photo = item.image
        ? `<img src="${escapeHTML(item.image)}" alt="" loading="lazy" decoding="async"${focus}>`
        : `<span class="dish-placeholder">${escapeHTML(item.icon || "🍽️")}</span>`;
    return `
        <article class="dish-card">
            <div class="dish-card-image" aria-hidden="true">${photo}</div>
            <div class="dish-card-copy">
                <h3><button class="dish-open" type="button" data-open-dish="${index}" aria-haspopup="dialog">${escapeHTML(item.name)}</button></h3>
                <span>${formatMoney(item.price)}</span>
            </div>
            <button class="dish-add" type="button" data-add-dish="${index}"
                aria-label="${escapeHTML(t("add"))} ${escapeHTML(item.name)}">+</button>
        </article>`;
}

function initDishDialog(menuView) {
    const dialog = document.getElementById("dishDialog");
    const body = dialog.querySelector(".dish-dialog-body");
    const visual = document.getElementById("dishDialogVisual");
    const image = document.getElementById("dishDialogImage");
    const title = document.getElementById("dishDialogTitle");
    const price = document.getElementById("dishDialogPrice");
    const description = document.getElementById("dishDialogDescription");
    const decrease = document.getElementById("dishQuantityDecrease");
    const increase = document.getElementById("dishQuantityIncrease");
    const quantityLabel = document.getElementById("dishQuantity");
    const total = document.getElementById("dishDialogTotal");
    let dishIndex;
    let quantity = 1;

    function renderQuantity() {
        quantityLabel.value = String(quantity);
        total.textContent = formatMoney(items[dishIndex].price * quantity);
        decrease.disabled = quantity === 1;
    }

    menuView.addEventListener("click", event => {
        const button = event.target.closest("[data-open-dish]");
        if (!button) return;

        const index = Number(button.dataset.openDish);
        const item = items[index];
        if (!item || item.restaurantId !== selectedRestaurant) return;

        dishIndex = index;
        quantity = 1;
        title.textContent = item.name;
        price.textContent = formatMoney(item.price);
        description.textContent = item.description[currentLanguage] || item.description.lt;
        visual.hidden = !item.image;
        if (item.image) {
            image.src = item.image;
            image.style.objectPosition = item.photoFocus || "";
        }
        renderQuantity();
        button.focus({ preventScroll: true });
        dialog.showModal();
        body.scrollTop = 0;
    });

    decrease.addEventListener("click", () => {
        if (quantity <= 1) return;
        quantity -= 1;
        renderQuantity();
        if (decrease.disabled && document.activeElement === decrease) increase.focus();
    });
    increase.addEventListener("click", () => {
        quantity += 1;
        renderQuantity();
    });
    document.getElementById("dishDialogAdd").addEventListener("click", () => {
        add(dishIndex, quantity);
        dialog.close();
        showToast(t("addedDish"));
    });
    document.getElementById("dishDialogClose").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
        if (event.target === dialog) dialog.close();
    });
}

function searchableName(value) {
    return value.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

function renderMenuDishes() {
    const query = searchableName(document.getElementById("menuSearch").value);
    const dishes = items.map((item, index) => {
        if (item.restaurantId !== selectedRestaurant || !searchableName(item.name).includes(query)) return "";
        return dishCard(item, index);
    }).join("");

    document.getElementById("menu").innerHTML = dishes;
    document.getElementById("menuEmpty").hidden = Boolean(dishes);
    document.getElementById("restaurantOffers").hidden = Boolean(query);
    document.getElementById("restaurantFeatured").hidden = Boolean(query);
    document.querySelector(".menu-navigation").hidden = Boolean(query);
}

function selectMenuSection(section) {
    document.querySelectorAll(".menu-navigation button").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.menuSection === section));
    });
}

function updateFavouriteButton() {
    const favourite = profileData.favouriteRestaurants.includes(selectedRestaurant);
    const button = document.getElementById("restaurantFavorite");
    button.setAttribute("aria-pressed", String(favourite));
    button.firstElementChild.textContent = favourite ? "♥" : "♡";
}

function updateLocationLabels() {
    document.getElementById("headerLocationLabel").textContent = profileData.address || t("vilnius");
    document.getElementById("restaurantLocationLabel").textContent = profileData.address || t("chooseLocation");
}

function localizeCatalog() {
    document.querySelectorAll("[data-label]").forEach(node => {
        node.setAttribute("aria-label", t(node.dataset.label));
    });
    updateLocationLabels();
    updatePromotionControls(document.getElementById("promotionTrack"));
}

function initCatalog() {
    Object.assign(TEXT.lt, catalogText.lt);
    Object.assign(TEXT.en, catalogText.en);
    profileData.address = typeof profileData.address === "string" ? profileData.address.slice(0, 90) : "";
    if (!Array.isArray(profileData.favouriteRestaurants)) profileData.favouriteRestaurants = [];

    const view = document.getElementById("restaurantsView");
    const menuView = document.getElementById("menuView");
    initDishDialog(menuView);
    const promotions = document.getElementById("promotionTrack");
    const cuisineNav = document.getElementById("cuisineNav");
    const cuisineOptions = [
        { id: "all", icon: "🍴", text: "restaurants" },
        ...restaurants.map(({ id, icon }) => ({ id, icon, text: cuisineLabels[id] })),
        { id: "favourites", icon: "♡", text: "favourites" }
    ];

    cuisineNav.innerHTML = cuisineOptions.map(({ id, icon, text }) => `
        <button type="button" data-cuisine="${id}" aria-pressed="false">
            <span aria-hidden="true">${icon}</span> <span data-i18n="${text}">${t(text)}</span>
        </button>`).join("");

    promotions.innerHTML = promotionSlides.map((slide, index) => {
        const content = `
            <img src="${slide.image}" alt="" ${index === 0 ? 'fetchpriority="high"' : ""} decoding="async">
            <span class="promotion-copy">
                <strong data-i18n="${slide.title}">${t(slide.title)}</strong>
                <span data-i18n="${slide.caption}">${t(slide.caption)}</span>
            </span>`;
        return slide.restaurant
            ? `<button class="promotion-slide" data-open-restaurant="${slide.restaurant}" type="button">${content}</button>`
            : `<article class="promotion-slide">${content}</article>`;
    }).join("");

    const observer = new ResizeObserver(entries => {
        entries.forEach(({ target }) => updateRailControls(target));
    });
    view.querySelectorAll(".promotion-track, .catalog-track").forEach(track => {
        observer.observe(track);
        track.addEventListener("scroll", () => updateRailControls(track), { passive: true });
    });

    const pause = document.getElementById("promotionPause");
    pause.addEventListener("click", () => {
        promotionPaused = !promotionPaused;
        updatePromotionControls(promotions);
    });
    reducedMotion.addEventListener("change", event => {
        promotionPaused = event.matches;
        updatePromotionControls(promotions);
    });
    window.setInterval(() => {
        const stage = promotions.parentElement;
        if (promotionPaused || view.hidden || document.hidden || pause.hidden) return;
        if (stage.matches(":focus-within") || (matchMedia("(hover: hover)").matches && stage.matches(":hover"))) return;
        shiftRail(promotions, 1);
    }, 6500);

    view.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;

        const { shift, direction, expand, promotionPage, cuisine, openRestaurant: restaurantId } = button.dataset;
        if (shift) shiftRail(document.getElementById(shift), Number(direction));
        if (expand) {
            const track = document.getElementById(expand);
            const expanded = track.classList.toggle("expanded");
            button.setAttribute("aria-expanded", String(expanded));
            button.textContent = t(expanded ? "showLess" : "showAll");
            if (!expanded) track.scrollLeft = 0;
            updateRailControls(track);
        }
        if (promotionPage !== undefined) {
            promotions.scrollTo({
                left: slidePositions(promotions)[Number(promotionPage)],
                behavior: reducedMotion.matches ? "instant" : "smooth"
            });
        }
        if (cuisine) selectCuisine(cuisine);
        if (restaurantId) {
            const track = button.closest(".promotion-track, .catalog-track");
            catalogOrigin = { id: track.id, left: track.scrollLeft, top: window.scrollY, restaurantId };
            openRestaurant(restaurantId);
        }
    });

    document.getElementById("restaurantBackButton").addEventListener("click", () => {
        setTab("restaurants");
        const origin = catalogOrigin;
        catalogOrigin = null;
        if (origin) {
            const track = document.getElementById(origin.id);
            track.scrollLeft = origin.left;
            window.scrollTo(0, origin.top);
            const button = [...track.querySelectorAll("[data-open-restaurant]")]
                .find(card => card.dataset.openRestaurant === origin.restaurantId);
            if (button) {
                button.focus({ preventScroll: true });
                return;
            }
        } else {
            window.scrollTo(0, 0);
        }
        document.getElementById("restaurantsTitle").focus({ preventScroll: true });
    });

    const info = document.getElementById("restaurantInfo");
    document.getElementById("restaurantInfoButton").addEventListener("click", () => info.showModal());
    document.getElementById("openRestaurantReviews").addEventListener("click", () => {
        info.close();
        setTab("reviews");
        window.scrollTo(0, 0);
        document.getElementById("reviewsTitle").focus({ preventScroll: true });
    });
    document.getElementById("reviewsBackButton").addEventListener("click", () => {
        renderMenu();
        setTab("menu");
        window.scrollTo(0, 0);
        document.getElementById("restaurantInfoButton").focus({ preventScroll: true });
    });

    const locationDialog = document.getElementById("locationDialog");
    const locationInput = document.getElementById("locationInput");
    document.querySelectorAll("[data-open-location]").forEach(button => {
        button.addEventListener("click", () => {
            locationInput.value = profileData.address;
            locationDialog.showModal();
            locationInput.focus();
        });
    });
    document.getElementById("locationForm").addEventListener("submit", event => {
        event.preventDefault();
        profileData.address = locationInput.value.trim();
        saveProfile();
        updateLocationLabels();
        locationDialog.close();
    });

    document.getElementById("restaurantFavorite").addEventListener("click", () => {
        const favourites = profileData.favouriteRestaurants;
        const index = favourites.indexOf(selectedRestaurant);
        if (index >= 0) favourites.splice(index, 1);
        else favourites.push(selectedRestaurant);
        saveProfile();
        updateFavouriteButton();
    });
    document.getElementById("favoritesButton").addEventListener("click", () => {
        selectCuisine("favourites");
        setTab("restaurants");
        cuisineNav.scrollLeft = cuisineNav.scrollWidth;
        document.getElementById("restaurantsTitle").scrollIntoView({ block: "start" });
        document.getElementById("restaurantsTitle").focus({ preventScroll: true });
    });

    document.getElementById("menuSearch").addEventListener("input", renderMenuDishes);
    menuView.addEventListener("click", event => {
        const button = event.target.closest("button");
        if (!button) return;
        const { menuSection, addDish } = button.dataset;
        if (menuSection) {
            selectMenuSection(menuSection);
            const sections = { discover: "restaurantOffers", offers: "restaurantOffers", featured: "restaurantFeatured", menu: "restaurantDishes" };
            document.getElementById(sections[menuSection]).scrollIntoView({
                block: "start", behavior: reducedMotion.matches ? "instant" : "smooth"
            });
            const tab = document.querySelector(`.menu-navigation [data-menu-section="${menuSection}"]`);
            if (tab !== button) {
                tab.focus({ preventScroll: true });
            }
        }
        if (addDish !== undefined) {
            add(Number(addDish));
            showToast(t("addedDish"));
        }
    });

    document.getElementById("restaurantRewards").addEventListener("click", () => {
        returnFromRestaurantRewards = true;
        setTab("level");
        window.scrollTo(0, 0);
        document.getElementById("levelBackButton").focus({ preventScroll: true });
    });

    localizeCatalog();
}
