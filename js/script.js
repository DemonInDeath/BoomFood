// BoomFood – esama naršyklės logika.

// Bendras programos būsenos valdymas. Duomenys saugomi šiame įrenginyje,
// kol projektas neturi serverio / bendros duomenų bazės.
const STORAGE_KEYS = {
    cart: "boomfood.cart.v1",
    history: "boomfood.orderHistory.v1",
    xp: "boomfood.xp.v1",
    reviews: "boomfood.reviews.v1",
    reviewsByRestaurant: "boomfood.reviewsByRestaurant.v1",
    balance: "boomfood.balance.v1",
    rewardLevel: "boomfood.rewardedThroughLevel.v1",
    profile: "boomfood.profile.v1",
    theme: "boomfood.theme.v1",
    language: "boomfood.language.v1"
};

function readStoredValue(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
        console.warn(`Nepavyko nuskaityti ${key} iš localStorage:`, error);
        return fallback;
    }
}

function writeStoredValue(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`Nepavyko išsaugoti ${key} localStorage:`, error);
        return false;
    }
}

let cart = [];
let orderHistory = readStoredValue(STORAGE_KEYS.history, []);
if (!Array.isArray(orderHistory)) orderHistory = [];

let xp = Number(readStoredValue(STORAGE_KEYS.xp, 0));
if (!Number.isFinite(xp) || xp < 0) xp = 0;

let walletBalance = Number(readStoredValue(
    STORAGE_KEYS.balance,
    Number(localStorage.getItem("boomfood-balansas")) || 0
));
if (!Number.isFinite(walletBalance) || walletBalance < 0) walletBalance = 0;

const initialLevel = Math.floor(xp / 100) + 1;
let rewardedThroughLevel = Number(readStoredValue(STORAGE_KEYS.rewardLevel, initialLevel));
if (!Number.isFinite(rewardedThroughLevel) || rewardedThroughLevel < 1) rewardedThroughLevel = initialLevel;

let profileData = readStoredValue(STORAGE_KEYS.profile, {});
if (!profileData || typeof profileData !== "object" || Array.isArray(profileData)) profileData = {};

profileData.name = String(profileData.name || "BoomFood User").slice(0, 30);
profileData.avatar = typeof profileData.avatar === "string" ? profileData.avatar : "";
profileData.lastNameChangeAt = Number(profileData.lastNameChangeAt) || 0;

let currentLanguage = readStoredValue(STORAGE_KEYS.language, "lt") === "en" ? "en" : "lt";
let currentTheme = readStoredValue(STORAGE_KEYS.theme, "dark") === "light" ? "light" : "dark";
let levelUpTimer = null;

function saveWallet() {
    writeStoredValue(STORAGE_KEYS.balance, walletBalance);
    localStorage.setItem("boomfood-balansas", String(walletBalance));

    const header = document.getElementById("headerBalance");
    const profile = document.getElementById("profileBalance");

    if (header) header.textContent = formatReward(walletBalance);
    if (profile) profile.textContent = formatReward(walletBalance);
}

function saveProfile() {
    writeStoredValue(STORAGE_KEYS.profile, profileData);
}

function showToast(message) {
    const toast = document.getElementById("appToast");
    if (!toast) return;

    toast.textContent = message;
    toast.hidden = false;

    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
        toast.hidden = true;
    }, 3200);
}

const TEXT = {
    lt: {
        balance: "Balansas",
        heroTitle: "Ko norėtum paragauti?",
        demoNotice: "Tikras maistas nebus pristatytas ir mokėti nereikia.",
        restaurants: "Restoranai",
        profile: "Profilis",
        logout: "Atsijungti",
        language: "Kalba",
        settings: "Nustatymai",
        account: "BOOMFOOD PASKYRA",
        changePhoto: "Pakeisti nuotrauką",
        profileName: "Profilio vardas",
        saveName: "Išsaugoti vardą",
        favourites: "Mėgstamiausi",
        orderHistory: "Užsakymų istorija",
        backToProfile: "← Grįžti į profilį",
        preferences: "PREFERENCIJOS",
        appearance: "Išvaizda",
        themeHint: "Pasirink šviesią arba tamsią temą.",
        lightMode: "Šviesi",
        darkMode: "Tamsi",
        deleteAccount: "Ištrinti paskyrą",
        deleteAccountHint: "Ištrins vietinius šios demonstracinės paskyros duomenis.",
        localDataNotice: "Tai demonstracinė paskyra – duomenys saugomi tik šiame įrenginyje.",
        walletBalance: "Balansas",
        levelWalletHint: "Lygio apdovanojimai pridedami prie balanso.",
        demoBalanceNotice: "Balansas yra demonstracinis ir saugomas šiame įrenginyje.",
        viewReviews: "Peržiūrėti atsiliepimus",
        backToRestaurant: "← Grįžti į restoraną",
        restaurantReviews: "RESTORANO ATSILIEPIMAI",
        leaveReview: "Palik atsiliepimą",
        yourName: "Vardas",
        rating: "Įvertinimas",
        comment: "Komentaras",
        publishReview: "Paskelbti atsiliepimą",
        menu: "Meniu",
        add: "Pridėti",
        reviewCount: "atsiliepimų",
        noReviews: "Atsiliepimų dar nėra.",
        profileSaved: "Profilio vardas išsaugotas.",
        cooldown: "Vardą vėl galėsi keisti po",
        minute: "min.",
        reviewSaved: "Atsiliepimas pridėtas ir išsaugotas šiame įrenginyje.",
        deleteConfirm: "Ar tikrai nori ištrinti šios demonstracinės paskyros duomenis? Šio veiksmo atšaukti negalima.",
        loggedOut: "Demonstracinė sesija uždaryta. Vietiniai duomenys išsaugoti.",
        photoTooLarge: "Nepavyko paruošti nuotraukos. Pabandyk kitą failą.",
        historyEmpty: "Kol kas užsakymų nėra. Pasirink patiekalų meniu ir pateik pirmą demonstracinį užsakymą.",
        order: "Užsakymas",
        products: "prek.",
        noName: "Įvesk profilio vardą (2–30 simbolių).",
        imageOnly: "Pasirink paveikslėlio failą.",
        backToRestaurants: "← Visi restoranai",
        back: "← Atgal",
        levelCenterTitle: "Lygių sistema",
        levelCenterHint: "Kaupk XP už užsakymus, kelk lygius ir atrakink apdovanojimus.",
        currentLevel: "DABARTINIS LYGIS",
        progressToNext: "Progresas iki kito lygio",
        levelHowTo: "Už pateiktą užsakymą gauni XP, o už pristatytą užsakymą – papildomų XP.",
        totalXP: "Iš viso sukaupta",
        allOrderXP: "Visų užsakymų XP",
        unlockedMilestones: "Atrakinti milestone’ai",
        milestoneHint: "Kas 5 lygius – didesnis rewardas",
        rewardPath: "Apdovanojimų kelias",
        rewardPathHint: "Kiekvienas naujas lygis suteikia demo piniginį apdovanojimą. Kas 5 lygius laukia didesnis milestone’as.",
        yourCart: "Tavo krepšelis",
        total: "Iš viso",
        placeOrder: "Pateikti užsakymą",
        cartFootnote: "Tai demonstracinis krepšelis – mokėjimas nevykdomas.",
        backToMenu: "← Grįžti į meniu",
        emptyCart: "Krepšelis tuščias.",
        chooseDishes: "Pasirink patiekalus iš meniu.",
        remove: "Pašalinti",
        levelNext: "Dar {xp} XP iki {level} lygio.",
        regularReward: "Lygio apdovanojimas",
        milestoneReward: "Milestone apdovanojimas",
        rewardUnlocked: "Apdovanojimas atrakintas",
        rewardLocked: "Pasiek šį lygį, kad atrakintum",
        received: "✓ Gauta",
        locked: "🔒 Užrakinta",
        orderAccepted: "Užsakymas priimtas",
        preparing: "Gaminamas",
        onTheWay: "Pakeliui",
        delivered: "Pristatytas",
        preparingDescription: "Virtuvė jau ruošia tavo patiekalus.",
        onTheWayDescription: "Kurjeris paėmė užsakymą ir jau pakeliui.",
        deliveredDescription: "Užsakymas pristatytas. Skanaus!",
        placedDescription: "Tavo užsakymas perduotas virtuvei.",
        levelRewardMessage: "Apdovanojimas pridėtas prie tavo balanso."
    },
    en: {
        balance: "Balance",
        heroTitle: "What would you like to try?",
        demoNotice: "This is a simulation. No real food will be delivered and no payment is required.",
        restaurants: "Restaurants",
        profile: "Profile",
        logout: "Log out",
        language: "Language",
        settings: "Settings",
        account: "BOOMFOOD ACCOUNT",
        changePhoto: "Change photo",
        profileName: "Profile name",
        saveName: "Save name",
        favourites: "Favourites",
        orderHistory: "Order history",
        backToProfile: "← Back to profile",
        preferences: "PREFERENCES",
        appearance: "Appearance",
        themeHint: "Choose light or dark mode.",
        lightMode: "Light",
        darkMode: "Dark",
        deleteAccount: "Delete account",
        deleteAccountHint: "This deletes the local data for this demo account.",
        localDataNotice: "This is a demo account – data is stored on this device only.",
        walletBalance: "Balance",
        levelWalletHint: "Level rewards are added to your balance.",
        demoBalanceNotice: "Balance is simulated and stored on this device.",
        viewReviews: "View reviews",
        backToRestaurant: "← Back to restaurant",
        restaurantReviews: "RESTAURANT REVIEWS",
        leaveReview: "Leave a review",
        yourName: "Name",
        rating: "Rating",
        comment: "Comment",
        publishReview: "Post review",
        menu: "Menu",
        add: "Add",
        reviewCount: "reviews",
        noReviews: "No reviews yet.",
        profileSaved: "Profile name saved.",
        cooldown: "You can change your name again in",
        minute: "min.",
        reviewSaved: "Review added and saved on this device.",
        deleteConfirm: "Delete this demo account's local data? This cannot be undone.",
        loggedOut: "Demo session closed. Local data was kept.",
        photoTooLarge: "Could not process this photo. Try another file.",
        historyEmpty: "No orders yet. Choose dishes from a menu and place your first demo order.",
        order: "Order",
        products: "items",
        noName: "Enter a profile name (2–30 characters).",
        imageOnly: "Choose an image file.",
        backToRestaurants: "← All restaurants",
        back: "← Back",
        levelCenterTitle: "Level system",
        levelCenterHint: "Earn XP from orders, level up and unlock rewards.",
        currentLevel: "CURRENT LEVEL",
        progressToNext: "Progress to next level",
        levelHowTo: "You earn XP when placing an order and extra XP when it is delivered.",
        totalXP: "Total XP earned",
        allOrderXP: "XP from all orders",
        unlockedMilestones: "Unlocked milestones",
        milestoneHint: "Every 5 levels unlocks a bigger reward",
        rewardPath: "Reward path",
        rewardPathHint: "Each new level gives a demo wallet reward. Every 5 levels unlocks a bigger milestone.",
        yourCart: "Your cart",
        total: "Total",
        placeOrder: "Place order",
        cartFootnote: "This is a demo cart – no payment is processed.",
        backToMenu: "← Back to menu",
        emptyCart: "Your cart is empty.",
        chooseDishes: "Choose dishes from a menu.",
        remove: "Remove",
        levelNext: "{xp} XP left to level {level}.",
        regularReward: "Level reward",
        milestoneReward: "Milestone reward",
        rewardUnlocked: "Reward unlocked",
        rewardLocked: "Reach this level to unlock",
        received: "✓ Received",
        locked: "🔒 Locked",
        orderAccepted: "Order received",
        preparing: "Preparing",
        onTheWay: "On the way",
        delivered: "Delivered",
        preparingDescription: "The kitchen is preparing your dishes.",
        onTheWayDescription: "The courier picked up your order and is on the way.",
        deliveredDescription: "Your order has been delivered. Enjoy!",
        placedDescription: "Your order has been sent to the kitchen.",
        levelRewardMessage: "The reward was added to your balance."
    }
};

function t(key) {
    return TEXT[currentLanguage]?.[key] || TEXT.lt[key] || key;
}

function applyLanguage() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach(node => {
        const value = t(node.dataset.i18n);
        if (value) node.textContent = value;
    });

    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) languageSelect.value = currentLanguage;

    const reviewNameInput = document.getElementById("reviewName");
    const reviewTextInput = document.getElementById("reviewText");
    const profileNameInput = document.getElementById("profileNameInput");

    if (reviewNameInput) reviewNameInput.placeholder = currentLanguage === "en" ? "Your name" : "Tavo vardas";
    if (reviewTextInput) reviewTextInput.placeholder = currentLanguage === "en" ? "Share your thoughts..." : "Pasidalink savo nuomone...";
    if (profileNameInput) profileNameInput.placeholder = currentLanguage === "en" ? "Your name" : "Tavo vardas";

    const ratingOptions = document.querySelectorAll("#reviewRating option");
    const ratingLabels = currentLanguage === "en"
        ? ["Excellent", "Good", "Average", "Poor", "Bad"]
        : ["Puikiai", "Gerai", "Vidutiniškai", "Prastai", "Blogai"];

    ratingOptions.forEach((option, index) => {
        option.textContent = `${"★".repeat(5 - index)}${"☆".repeat(index)} – ${ratingLabels[index]}`;
    });

    localizeCatalog();
    renderRestaurants();
    renderHistory();
    renderProfile();
    renderLevelUI();

    if (!document.getElementById("menuView").hidden) renderMenu();
    if (!document.getElementById("reviewsView").hidden) renderRestaurantReviews();
}

function applyTheme() {
    document.documentElement.dataset.theme = currentTheme;
    document.querySelector('meta[name="theme-color"]').content = currentTheme === "dark" ? "#101713" : "#f6f8f7";
    document.getElementById("lightThemeButton")?.classList.toggle("selected", currentTheme === "light");
    document.getElementById("darkThemeButton")?.classList.toggle("selected", currentTheme === "dark");
    writeStoredValue(STORAGE_KEYS.theme, currentTheme);
}

function saveXP() {
    writeStoredValue(STORAGE_KEYS.xp, xp);
    const status = document.getElementById("xpSaveStatus");
    if (status) status.textContent = "Pažanga išsaugoma automatiškai šiame įrenginyje.";
}

const stepNames = [
    "Užsakymas priimtas",
    "Gaminamas",
    "Pakeliui",
    "Pristatytas"
];

function getLocalizedStepNames() {
    return currentLanguage === "en"
        ? [t("orderAccepted"), t("preparing"), t("onTheWay"), t("delivered")]
        : stepNames;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function saveHistory() {
    writeStoredValue(STORAGE_KEYS.history, orderHistory);
}

function renderHistory() {
    const list = document.getElementById("historyList");
    const count = document.getElementById("historyCount");

    if (!list || !count) return;

    const totalOrders = orderHistory.length;

    count.textContent = `${totalOrders} ${
        currentLanguage === "en"
            ? (totalOrders === 1 ? "order" : "orders")
            : (totalOrders === 1 ? "užsakymas" : "užsakymų")
    }`;

    if (!totalOrders) {
        list.innerHTML = `<div class="empty-history">${t("historyEmpty")}</div>`;
        return;
    }

    list.innerHTML = orderHistory.map(order => {
        const parsedDate = new Date(order.createdAt);
        const dateLabel = Number.isNaN(parsedDate.getTime())
            ? "—"
            : new Intl.DateTimeFormat(
                currentLanguage === "en" ? "en-GB" : "lt-LT",
                { dateStyle: "medium", timeStyle: "short" }
            ).format(parsedDate);

        const lines = Array.isArray(order.items)
            ? order.items.map(item => {
                const quantity = Math.max(1, Number(item.quantity) || 1);
                return `<li><span>${escapeHTML(item.name)} ×${quantity}</span><strong>${formatMoney((Number(item.price) || 0) * quantity)}</strong></li>`;
            }).join("")
            : "";

        const itemCount = Array.isArray(order.items)
            ? order.items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0)
            : 0;

        const restaurantNames = [...new Set(
            (order.items || []).map(item => item.restaurant).filter(Boolean)
        )].join(", ");

        return `<details class="history-card history-detail">
            <summary class="history-summary">
                <span class="history-summary-main">
                    <span class="history-id">${t("order")} #${escapeHTML(order.id)}</span>
                    <span class="history-date">${escapeHTML(dateLabel)}</span>
                </span>
                <span class="history-summary-right">
                    <span class="history-status">${escapeHTML(
                        Number.isInteger(order.statusIndex)
                            ? getLocalizedStepNames()[Math.min(3, Math.max(0, order.statusIndex))]
                            : (
                                currentLanguage === "en"
                                    ? ({
                                        "Užsakymas priimtas": "Order received",
                                        "Gaminamas": "Preparing",
                                        "Pakeliui": "On the way",
                                        "Pristatytas": "Delivered"
                                    }[order.status] || order.status)
                                    : (order.status || stepNames[0])
                            )
                    )}</span>
                    <strong class="history-total">${formatMoney(Number(order.total) || 0)}</strong>
                    <span class="history-chevron" aria-hidden="true">⌄</span>
                </span>
            </summary>
            <div class="history-detail-body">
                ${restaurantNames ? `<p class="history-restaurant">${escapeHTML(restaurantNames)}</p>` : ""}
                <ul class="history-items">${lines}</ul>
                <div class="history-bottom">
                    <span class="history-date">${itemCount} ${t("products")}</span>
                    <strong class="history-total">${formatMoney(Number(order.total) || 0)}</strong>
                </div>
            </div>
        </details>`;
    }).join("");
}

function renderProfile() {
    const name = document.getElementById("profileNameDisplay");
    const input = document.getElementById("profileNameInput");
    const summary = document.getElementById("profileLevelSummary");
    const headerAvatar = document.getElementById("headerAvatar");
    const avatarInitial = document.getElementById("profileAvatarInitial");
    const avatarImage = document.getElementById("profileAvatarImage");

    if (name) name.textContent = profileData.name;
    if (input && document.activeElement !== input) input.value = profileData.name;

    if (summary) {
        summary.textContent = `${getCurrentLevel()} ${currentLanguage === "en" ? "level" : "lygis"} · ${xp.toLocaleString("lt-LT")} XP`;
    }

    if (headerAvatar) {
        if (profileData.avatar) {
            headerAvatar.innerHTML = `<img src="${profileData.avatar}" alt="">`;
        } else {
            headerAvatar.textContent = (profileData.name.trim()[0] || "B").toUpperCase();
        }
    }

    if (avatarInitial) {
        avatarInitial.textContent = (profileData.name.trim()[0] || "B").toUpperCase();
    }

    if (avatarImage) {
        if (profileData.avatar) {
            avatarImage.src = profileData.avatar;
            avatarImage.hidden = false;
            if (avatarInitial) avatarInitial.hidden = true;
        } else {
            avatarImage.removeAttribute("src");
            avatarImage.hidden = true;
            if (avatarInitial) avatarInitial.hidden = false;
        }
    }

    const balance = document.getElementById("profileBalance");
    if (balance) balance.textContent = formatReward(walletBalance);

    updateNameCooldown();
}

function updateNameCooldown() {
    const hint = document.getElementById("nameCooldown");
    const saveButton = document.getElementById("saveProfileName");

    if (!hint || !saveButton) return;

    const remaining = Math.max(
        0,
        30 * 60 * 1000 - (Date.now() - profileData.lastNameChangeAt)
    );

    saveButton.disabled = remaining > 0;

    if (remaining > 0) {
        const mins = Math.ceil(remaining / 60000);
        hint.textContent = `${t("cooldown")} ${mins} ${t("minute")}`;
    } else {
        hint.textContent = currentLanguage === "en"
            ? "You can update your profile name every 30 minutes."
            : "Vardą galima keisti kas 30 minučių.";
    }
}

function setTab(viewName) {
    const views = {
        menu: "menuView",
        restaurants: "restaurantsView",
        reviews: "reviewsView",
        profile: "profileView",
        settings: "settingsView",
        level: "levelView"
    };

    if (!Object.prototype.hasOwnProperty.call(views, viewName)) return;

    Object.entries(views).forEach(([name, id]) => {
        const view = document.getElementById(id);
        if (view) view.hidden = name !== viewName;
    });

    if (viewName === "profile") {
        renderProfile();
        renderHistory();
    }

    if (viewName === "reviews") renderRestaurantReviews();
    if (viewName === "settings") applyTheme();
    if (viewName === "level") renderLevelCenter();
    if (viewName === "restaurants") renderRestaurants();
}

function goHome() {
    const delivery = document.getElementById("deliveryOverlay");
    const cartOverlay = document.getElementById("cartOverlay");

    if (delivery && !delivery.hidden) {
        closeDelivery();
        return;
    }

    if (cartOverlay && !cartOverlay.hidden) closeCart();

    hideLevelUp();
    selectCuisine("all");
    setTab("restaurants");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// Restoranai ir patiekalai.
const restaurants = [
    {
        id: "lt",
        name: "Lietuviška Virtuvė",
        icon: "🥟",
        image: "images/restaurants/lietuviska-virtuve.webp",
        delivery: { fee: 1.49, minutes: [20, 30] },
        dishes: [
            {
                name: "Cepelinai su mėsa", price: 7.9, image: "images/dishes/lietuviska-virtuve/cepelinai.webp",
                description: {
                    lt: "Bulviniai cepelinai su mėsos įdaru, patiekiami šilti su spirgučiais ir žalumynais.",
                    en: "Potato dumplings with a savoury meat filling, served warm with crispy bacon bits and herbs."
                }
            },
            {
                name: "Šaltibarščiai", price: 4.8, image: "images/dishes/lietuviska-virtuve/saltibarsciai.webp",
                photoFocus: "50% 72%",
                description: {
                    lt: "Šalta burokėlių ir kefyro sriuba su agurkais, krapais ir virtu kiaušiniu. Šalia – virtos bulvės.",
                    en: "Chilled beetroot and kefir soup with cucumber, dill and boiled egg, served with boiled potatoes."
                }
            },
            {
                name: "Bulvių kugelis", price: 6.5, image: "images/dishes/lietuviska-virtuve/bulviu-kugelis.webp",
                description: {
                    lt: "Orkaitėje keptas tarkuotų bulvių plokštainis su auksine plutele ir šaukštu grietinės.",
                    en: "Oven-baked grated potato pudding with a golden crust and a spoonful of sour cream."
                }
            },
            {
                name: "Kibinai (3 vnt.)", price: 5.9, image: "images/dishes/lietuviska-virtuve/kibinai.webp",
                description: {
                    lt: "Trys auksiniai tešlos pyragėliai su sultingu mėsos įdaru ir traškiu užspaustu krašteliu.",
                    en: "Three golden pastries with a juicy meat filling and crisp crimped edges."
                }
            },
            {
                name: "Bulviniai blynai", price: 6.2, image: "images/dishes/lietuviska-virtuve/bulviniai-blynai.webp",
                description: {
                    lt: "Keptuvėje apskrudinti tarkuotų bulvių blynai, patiekiami su grietine.",
                    en: "Pan-fried grated potato pancakes with crisp edges, served with sour cream."
                }
            }
        ]
    },
    {
        id: "pizza",
        name: "Pizza Corner",
        icon: "🍕",
        image: "images/restaurants/pizza-corner.webp",
        delivery: { fee: 1.99, minutes: [30, 40] },
        dishes: [
            {
                name: "Pica Margarita", price: 9.5, image: "images/dishes/pizza-corner/margarita.webp",
                description: {
                    lt: "Klasikinė pica su pomidorų padažu, lydyta mocarela ir šviežiais bazilikais.",
                    en: "Classic pizza with tomato sauce, melted mozzarella and fresh basil."
                }
            },
            {
                name: "Pica Pepperoni", price: 10.9, image: "images/dishes/pizza-corner/pepperoni.webp",
                description: {
                    lt: "Pica su pomidorų padažu, lydytu sūriu ir pikantiškomis peperoni dešros riekelėmis.",
                    en: "Pizza with tomato sauce, melted cheese and slices of spicy pepperoni."
                }
            },
            {
                name: "Pica Keturi sūriai", price: 11.5, image: "images/dishes/pizza-corner/keturi-suriai.webp",
                description: {
                    lt: "Sodri pica su keturių lydytų sūrių deriniu ir auksiniu, traškiu krašteliu.",
                    en: "A rich four-cheese pizza with a crisp, golden crust."
                }
            },
            {
                name: "Pica Hawaii", price: 10.5, image: "images/dishes/pizza-corner/hawaii.webp",
                description: {
                    lt: "Saldžiarūgštės ananasų skiltelės, kumpis ir lydytas sūris ant pomidorų padažu padengto picos pagrindo.",
                    en: "Sweet-tangy pineapple, ham and melted cheese on a tomato-based pizza."
                }
            },
            {
                name: "Calzone", price: 9.9, image: "images/dishes/pizza-corner/calzone.webp",
                photoFocus: "50% 56%",
                description: {
                    lt: "Orkaitėje kepta perlenkta pica su kumpiu ir lydytu sūriu. Tešla išorėje traški, o įdaras minkštas.",
                    en: "Oven-baked folded pizza with ham and melted cheese, with a crisp crust and a soft filling."
                }
            }
        ]
    },
    {
        id: "burger",
        name: "Burger House",
        icon: "🍔",
        image: "images/restaurants/burger-house.webp",
        delivery: { fee: 1.49, minutes: [20, 35] },
        dishes: [
            {
                name: "Klasikinis burgeris", price: 7.5, image: "images/dishes/burger-house/klasikinis-burgeris.webp",
                description: {
                    lt: "Jautienos paplotėlis, salotos, pomidorai ir lydytas sūris skrudintoje sezamų bandelėje.",
                    en: "A beef patty, lettuce, tomato and melted cheese in a toasted sesame bun."
                }
            },
            {
                name: "Sūrio burgeris", price: 8.2, image: "images/dishes/burger-house/surio-burgeris.webp",
                photoFocus: "50% 56%",
                description: {
                    lt: "Jautienos paplotėliai su gausiu lydyto sūrio sluoksniu ir kreminiu padažu sezamų bandelėje.",
                    en: "Beef patties layered with generous melted cheese and creamy sauce in a sesame bun."
                }
            },
            {
                name: "Bekono burgeris", price: 8.9, image: "images/dishes/burger-house/bekono-burgeris.webp",
                photoFocus: "50% 57%",
                description: {
                    lt: "Jautienos paplotėlis su traškiu bekonu, lydytu sūriu ir raudonaisiais svogūnais minkštoje bandelėje.",
                    en: "A beef patty with crispy bacon, melted cheese and red onion in a soft bun."
                }
            },
            {
                name: "Vištienos burgeris", price: 7.9, image: "images/dishes/burger-house/vistienos-burgeris.webp",
                photoFocus: "50% 57%",
                description: {
                    lt: "Traški vištiena su salotomis, lydytu sūriu ir kreminiu padažu sezamų bandelėje.",
                    en: "Crispy chicken with lettuce, melted cheese and creamy sauce in a sesame bun."
                }
            },
            {
                name: "Veggie burgeris", price: 7.8, image: "images/dishes/burger-house/veggie-burgeris.webp",
                description: {
                    lt: "Daržovių burgeris su salotomis, pomidorais, svogūnais ir padažu minkštoje bandelėje.",
                    en: "A veggie burger with lettuce, tomato, onion and sauce in a soft bun."
                }
            }
        ]
    },
    {
        id: "sushi",
        name: "Sushi Point",
        icon: "🍣",
        image: "images/restaurants/sushi-point.webp",
        delivery: { fee: 2.29, minutes: [35, 45] },
        dishes: [
            {
                name: "Suši rinkinys", price: 12.9, image: "images/dishes/sushi-point/susi-rinkinys.webp",
                description: {
                    lt: "Įvairių sušių rinkinys su ritinėliais ir nigiri. Tinka keliems skoniams paragauti.",
                    en: "An assorted sushi platter with rolls and nigiri, ideal for trying several flavours."
                }
            },
            {
                name: "Kalifornijos ritiniai", price: 9.9, image: "images/dishes/sushi-point/kalifornijos-ritiniai.webp",
                photoFocus: "50% 55%",
                description: {
                    lt: "Ryžių ritinėliai su avokadu, agurku ir krabų skonio įdaru, apibarstyti sezamais.",
                    en: "Rice rolls with avocado, cucumber and a crab-style filling, finished with sesame seeds."
                }
            },
            {
                name: "Lašišos burgeris", price: 8.5, image: "images/dishes/sushi-point/lasisos-burgeris.webp",
                photoFocus: "50% 53%",
                description: {
                    lt: "Traški lašiša minkštoje bandelėje su salotomis, sūriu ir kreminiu padažu. Šalia – bulvytės ir citrina.",
                    en: "Crispy salmon in a soft bun with lettuce, cheese and creamy sauce, served with fries and lemon."
                }
            },
            {
                name: "Miso sriuba", price: 3.9, image: "images/dishes/sushi-point/miso-sriuba.webp",
                photoFocus: "50% 69%",
                description: {
                    lt: "Šiltas miso sultinys su tofu kubeliais, grybais ir svogūnų laiškais.",
                    en: "Warm miso broth with cubes of tofu, mushrooms and spring onion."
                }
            },
            {
                name: "Edamame", price: 4.2, image: "images/dishes/sushi-point/edamame.webp",
                description: {
                    lt: "Šiltos žaliosios sojų pupelės ankštyse, pagardintos sezamais. Valgomos išlukštentos.",
                    en: "Warm green soybeans served in their pods and topped with sesame. Pop the beans out to eat."
                }
            }
        ]
    },
    {
        id: "green",
        name: "Green Bite",
        icon: "🥗",
        image: "images/restaurants/green-bite.webp",
        delivery: { fee: 1.79, minutes: [25, 35] },
        dishes: [
            {
                name: "Cezario salotos", price: 7.2, image: "images/dishes/green-bite/cezario-salotos.webp",
                description: {
                    lt: "Traškios salotos su kepta vištiena, skrebučiais, kietuoju sūriu ir kreminiu Cezario padažu.",
                    en: "Crisp lettuce with grilled chicken, croutons, hard cheese and creamy Caesar dressing."
                }
            },
            {
                name: "Veganiškas bowl", price: 8.9, image: "images/dishes/green-bite/veganiskas-bowl.webp",
                description: {
                    lt: "Dubuo su avokadu, agurkais, brokoliais, edamame pupelėmis ir grūdais.",
                    en: "A bowl of avocado, cucumber, broccoli, edamame and grains."
                }
            },
            {
                name: "Humusas su daržovėmis", price: 5.5, image: "images/dishes/green-bite/humusas.webp",
                photoFocus: "50% 55%",
                description: {
                    lt: "Kreminė avinžirnių užtepėlė su alyvuogių aliejumi ir traškiomis daržovių lazdelėmis.",
                    en: "Creamy chickpea hummus with olive oil and crunchy vegetable sticks."
                }
            },
            {
                name: "Žaliasis smoothie", price: 4.5, image: "images/dishes/green-bite/zaliasis-smoothie.webp",
                description: {
                    lt: "Tirštas žaliasis kokteilis iš špinatų, bananų ir kivių.",
                    en: "A thick green smoothie blended with spinach, banana and kiwi."
                }
            },
            {
                name: "Veganiškas wrap", price: 6.9, image: "images/dishes/green-bite/veganiskas-wrap.webp",
                description: {
                    lt: "Minkšta tortilija su lapinėmis salotomis, traškiomis daržovėmis ir augaliniu įdaru.",
                    en: "A soft tortilla packed with leafy greens, crunchy vegetables and a plant-based filling."
                }
            }
        ]
    }
];

const items = restaurants.flatMap(restaurant =>
    restaurant.dishes.map(dish => ({
        ...dish,
        restaurant: restaurant.name,
        restaurantId: restaurant.id
    }))
);

// Keep previously saved nigiri orders separate from the new salmon burger.
const discontinuedDishes = [
    { name: "Lašišos nigiri (4 vnt.)", price: 8.5, restaurant: "Sushi Point", restaurantId: "sushi" }
];
const storedCart = readStoredValue(STORAGE_KEYS.cart, []);

if (Array.isArray(storedCart)) {
    cart = storedCart.map(entry => {
        const name = typeof entry === "string" ? entry : entry?.name;
        return items.find(product => product.name === name)
            || discontinuedDishes.find(product => product.name === name);
    }).filter(Boolean);
}

let selectedRestaurant = restaurants[0].id;

const restaurantCategories = {
    lt: "Lietuviška virtuvė",
    pizza: "Picos ir itališki skoniai",
    burger: "Mėsainiai",
    sushi: "Sušiai ir azijietiški patiekalai",
    green: "Salotos ir sveikesni pasirinkimai"
};

const seedReviews = {
    lt: [
        ["Austėja", 5, "Cepelinai priminė namuose gamintus. Porcija soti, o šaltibarščiai labai gaivūs."],
        ["Mantas", 4, "Kugelis skanus, tik norėtųsi šiek tiek daugiau padažo."],
        ["Gabija", 5, "Labai patiko kibinai ir greitas užsakymo paruošimas."],
        ["Paulius", 4, "Geras tradicinis maistas, kainos visai normalios."],
        ["Ieva", 3, "Skonis geras, bet bulviniai blynai galėtų būti traškesni."],
        ["Lukas", 5, "Puikus pasirinkimas, kai norisi lietuviško maisto."]
    ],
    pizza: [
        ["Greta", 5, "Pepperoni pica su daug sūrio – tikrai užsisakysiu dar."],
        ["Nojus", 4, "Plona plutelė ir geras padažas. Calzone taip pat patiko."],
        ["Emilija", 3, "Pica skani, bet tikėjausi traškesnių kraštų."],
        ["Dovydas", 5, "Keturių sūrių pica viena geriausių šiame meniu."],
        ["Karolina", 4, "Gera porcija ir subalansuotas skonis."],
        ["Tadas", 4, "Hawaii pica nustebino – ananasas čia tikrai tinka."]
    ],
    burger: [
        ["Jonas", 4, "Sūrio burgeris sotus, mėsa gerai iškepta."],
        ["Viktorija", 5, "Bekono burgeris labai geras, patiko padažas."],
        ["Rokas", 3, "Skonis neblogas, bet bandelė buvo kiek sausa."],
        ["Monika", 4, "Vištienos burgeris lengvesnis, bet vis tiek sotus."],
        ["Simas", 5, "Didelė porcija ir geras ingredientų santykis."],
        ["Eglė", 3, "Norėtųsi daugiau daržovių, tačiau bendrai visai gerai."]
    ],
    sushi: [
        ["Lina", 5, "Sušiai atrodė švieži, ryžiai gerai paruošti."],
        ["Arnas", 4, "Kalifornijos ritiniai puikūs, miso sriuba taip pat patiko."],
        ["Viltė", 5, "Lašišos nigiri buvo labai skanūs."],
        ["Darius", 3, "Skonis geras, bet rinkinyje norėtųsi daugiau įvairovės."],
        ["Ugnė", 4, "Tvarkingas meniu ir geras skonių balansas."],
        ["Kamilė", 5, "Edamame ir sušiai – puikus derinys."]
    ],
    green: [
        ["Rūta", 5, "Cezario salotos šviežios, padažas labai geras."],
        ["Andrius", 5, "Veganiškas bowl sotus ir spalvingas."],
        ["Miglė", 4, "Humusas skanus, daržovės traškios."],
        ["Erikas", 5, "Smoothie gaivus, ne per saldus."],
        ["Saulė", 4, "Geras pasirinkimas lengvesniems pietums."],
        ["Nedas", 3, "Wrap skanus, bet norėtųsi šiek tiek didesnės porcijos."]
    ]
};

let reviewsByRestaurant = readStoredValue(STORAGE_KEYS.reviewsByRestaurant, null);

if (!reviewsByRestaurant || typeof reviewsByRestaurant !== "object" || Array.isArray(reviewsByRestaurant)) {
    reviewsByRestaurant = {};

    restaurants.forEach(restaurant => {
        reviewsByRestaurant[restaurant.id] = (seedReviews[restaurant.id] || []).map((review, index) => ({
            id: `${restaurant.id}-seed-${index + 1}`,
            name: review[0],
            rating: review[1],
            comment: review[2],
            createdAt: new Date(Date.now() - (index + 1) * 86400000).toISOString(),
            dateLabel: `${index + 1} d. prieš`,
            source: "seed"
        }));
    });

    // Migruojami tik seni atsiliepimai, kurie jau turi restorano ID.
    // Restoranas senam bendram atsiliepimui nespėjamas.
    const legacyReviews = readStoredValue(STORAGE_KEYS.reviews, []);

    if (Array.isArray(legacyReviews)) {
        legacyReviews
            .filter(review => review && review.restaurantId && reviewsByRestaurant[review.restaurantId])
            .forEach(review => {
                reviewsByRestaurant[review.restaurantId].unshift({
                    ...review,
                    id: review.id || `legacy-${Date.now()}-${Math.random()}`,
                    source: "user"
                });
            });
    }

    writeStoredValue(STORAGE_KEYS.reviewsByRestaurant, reviewsByRestaurant);
}

restaurants.forEach(restaurant => {
    if (!Array.isArray(reviewsByRestaurant[restaurant.id])) {
        reviewsByRestaurant[restaurant.id] = [];
    }
});

function saveRestaurantReviews() {
    writeStoredValue(STORAGE_KEYS.reviewsByRestaurant, reviewsByRestaurant);
}

function getRestaurantReviews(id) {
    return Array.isArray(reviewsByRestaurant[id]) ? reviewsByRestaurant[id] : [];
}

function getRestaurantRating(id) {
    const reviews = getRestaurantReviews(id);
    if (!reviews.length) return { average: 0, count: 0 };

    return {
        average: reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length,
        count: reviews.length
    };
}

function starsFor(rating) {
    const rounded = Math.round(rating);
    return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

function renderRestaurantReviews() {
    const restaurant = restaurants.find(item => item.id === selectedRestaurant);
    const list = document.getElementById("reviewList");

    if (!restaurant || !list) return;

    const stats = getRestaurantRating(restaurant.id);

    document.getElementById("reviewsTitle").textContent = currentLanguage === "en"
        ? `${restaurant.name} reviews`
        : `${restaurant.name} atsiliepimai`;

    document.getElementById("reviewRestaurantName").textContent =
        `${stats.average.toFixed(1).replace(".", ",")} / 5 · ${stats.count} ${t("reviewCount")}`;

    document.getElementById("ratingSummary").textContent =
        `${starsFor(stats.average)} ${stats.average.toFixed(1).replace(".", ",")} / 5`;

    const reviews = getRestaurantReviews(restaurant.id);

    list.innerHTML = reviews.length
        ? reviews.map(review => `
            <article class="review-card">
                <div class="review-top">
                    <strong>${escapeHTML(review.name)}</strong>
                    <span class="stars">${starsFor(Number(review.rating) || 0)}</span>
                </div>
                <p>„${escapeHTML(review.comment)}“</p>
                <span class="review-author">${escapeHTML(review.dateLabel || "Neseniai")}</span>
            </article>
        `).join("")
        : `<div class="empty-history">${t("noReviews")}</div>`;

    const reviewName = document.getElementById("reviewName");
    if (reviewName && !reviewName.value) reviewName.value = profileData.name;
}

const restaurantCategoriesEnglish = {
    lt: "Lithuanian cuisine",
    pizza: "Pizza and Italian food",
    burger: "Burgers",
    sushi: "Sushi and Asian food",
    green: "Salads and healthy choices"
};

initCatalog();
renderHistory();

document.getElementById("reviewForm")?.addEventListener("submit", event => {
    event.preventDefault();

    const form = event.currentTarget;
    const name = form.elements.namedItem("name").value.trim();
    const rating = Number(form.elements.namedItem("rating").value);
    const comment = form.elements.namedItem("comment").value.trim();
    const message = document.getElementById("reviewMessage");

    if (!name || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        message.textContent = currentLanguage === "en"
            ? "Please complete all fields and choose a rating."
            : "Užpildyk visus laukus ir pasirink įvertinimą.";
        return;
    }

    reviewsByRestaurant[selectedRestaurant].unshift({
        id: `user-${Date.now()}`,
        name: name.slice(0, 40),
        rating,
        comment: comment.slice(0, 500),
        createdAt: new Date().toISOString(),
        dateLabel: currentLanguage === "en"
            ? "Just now · saved on this device"
            : "Ką tik · išsaugota šiame įrenginyje",
        source: "user"
    });

    saveRestaurantReviews();
    renderRestaurantReviews();
    renderRestaurants();
    updateMenuRating();
    form.reset();
    message.textContent = t("reviewSaved");
});

const userMenu = document.getElementById("userMenu");

function closeUserMenu() {
    if (userMenu) userMenu.hidden = true;
    document.getElementById("profileButton")?.setAttribute("aria-expanded", "false");
}

document.getElementById("profileButton")?.addEventListener("click", event => {
    event.stopPropagation();

    if (!userMenu) return;

    userMenu.hidden = !userMenu.hidden;

    document.getElementById("profileButton").setAttribute(
        "aria-expanded",
        String(!userMenu.hidden)
    );
});

userMenu?.addEventListener("click", event => event.stopPropagation());

document.addEventListener("click", event => {
    if (!event.target.closest(".header-user-wrap")) closeUserMenu();
});

document.getElementById("userMenuProfile")?.addEventListener("click", () => {
    closeUserMenu();
    setTab("profile");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("userMenuLogout")?.addEventListener("click", () => {
    closeUserMenu();
    goHome();
    showToast(t("loggedOut"));
});

document.getElementById("languageSelect")?.addEventListener("change", event => {
    currentLanguage = event.target.value === "en" ? "en" : "lt";
    writeStoredValue(STORAGE_KEYS.language, currentLanguage);
    applyLanguage();
});

document.getElementById("openSettings")?.addEventListener("click", () => {
    setTab("settings");
});

document.getElementById("settingsBackButton")?.addEventListener("click", () => {
    setTab("profile");
});

document.querySelectorAll("[data-theme-choice]").forEach(button => {
    button.addEventListener("click", () => {
        currentTheme = button.dataset.themeChoice === "dark" ? "dark" : "light";
        applyTheme();
    });
});

document.getElementById("deleteAccountButton")?.addEventListener("click", () => {
    if (!window.confirm(t("deleteConfirm"))) return;

    [
        STORAGE_KEYS.cart,
        STORAGE_KEYS.history,
        STORAGE_KEYS.xp,
        STORAGE_KEYS.balance,
        STORAGE_KEYS.rewardLevel,
        STORAGE_KEYS.profile,
        STORAGE_KEYS.reviewsByRestaurant,
        STORAGE_KEYS.reviews
    ].forEach(key => localStorage.removeItem(key));

    localStorage.removeItem("boomfood-balansas");
    location.reload();
});

document.getElementById("saveProfileName")?.addEventListener("click", () => {
    const input = document.getElementById("profileNameInput");
    const value = input.value.trim();
    const message = document.getElementById("profileMessage");

    if (value.length < 2 || value.length > 30) {
        message.textContent = t("noName");
        return;
    }

    if (Date.now() - profileData.lastNameChangeAt < 30 * 60 * 1000) {
        updateNameCooldown();
        return;
    }

    profileData.name = value;
    profileData.lastNameChangeAt = Date.now();

    saveProfile();
    renderProfile();
    message.textContent = t("profileSaved");
});

document.getElementById("profilePictureInput")?.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showToast(t("imageOnly"));
        return;
    }

    const reader = new FileReader();

    reader.onload = () => {
        const image = new Image();

        image.onload = () => {
            try {
                const canvas = document.createElement("canvas");
                const size = 320;
                const scale = Math.min(size / image.width, size / image.height, 1);

                canvas.width = Math.max(1, Math.round(image.width * scale));
                canvas.height = Math.max(1, Math.round(image.height * scale));

                const context = canvas.getContext("2d");
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                profileData.avatar = canvas.toDataURL("image/jpeg", 0.82);
                saveProfile();
                renderProfile();
            } catch (error) {
                console.error(error);
                showToast(t("photoTooLarge"));
            }
        };

        image.onerror = () => showToast(t("photoTooLarge"));
        image.src = String(reader.result);
    };

    reader.onerror = () => showToast(t("photoTooLarge"));
    reader.readAsDataURL(file);
});

applyTheme();
applyLanguage();
saveProfile();
saveWallet();
renderProfile();

document.getElementById("levelButton")?.addEventListener("click", () => {
    closeUserMenu();
    returnFromRestaurantRewards = false;
    setTab("level");
    window.scrollTo(0, 0);
    document.getElementById("levelBackButton").focus({ preventScroll: true });
});

document.getElementById("levelBackButton")?.addEventListener("click", () => {
    if (returnFromRestaurantRewards) {
        returnFromRestaurantRewards = false;
        setTab("menu");
        document.getElementById("restaurantRewards").focus();
        return;
    }
    goHome();
});

document.getElementById("levelUpClose")?.addEventListener("click", hideLevelUp);
document.getElementById("homeButton")?.addEventListener("click", goHome);

document.querySelectorAll("[data-home-button]").forEach(button => {
    button.addEventListener("click", goHome);
});

// Pradinis puslapis – restoranų katalogas.
setTab("restaurants");

// Krepšelis: vienodi produktai rodomi viena eilute su kiekiu.
function getGroupedCart() {
    const grouped = new Map();

    cart.forEach(item => {
        const key = item.name;

        if (!grouped.has(key)) {
            grouped.set(key, {
                ...item,
                quantity: 0
            });
        }

        grouped.get(key).quantity += 1;
    });

    return [...grouped.values()];
}

function formatMoney(value) {
    return Number(value).toFixed(2).replace(".", ",") + " €";
}

function renderCart() {
    writeStoredValue(STORAGE_KEYS.cart, cart.map(item => item.name));

    const grouped = getGroupedCart();
    const totalQuantity = cart.length;
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const count = document.getElementById("cartCount");
    count.textContent = totalQuantity > 99 ? "99+" : String(totalQuantity);
    count.hidden = totalQuantity === 0;

    document.getElementById("cartItems").innerHTML = grouped.length
        ? grouped.map(item => `
            <article class="cart-line">
                <div>
                    <p class="cart-line-name">${escapeHTML(item.name)} <span aria-label="Kiekis">×${item.quantity}</span></p>
                    <p class="cart-line-meta">${formatMoney(item.price)} / vnt.</p>
                </div>
                <div class="cart-line-right">
                    <strong class="cart-line-total">${formatMoney(item.price * item.quantity)}</strong>
                    <div class="cart-line-actions">
                        <button class="cart-qty-button" type="button"
                            data-cart-action="decrease" data-item="${escapeHTML(item.name)}"
                            aria-label="${currentLanguage === "en" ? "Decrease" : "Sumažinti"} ${escapeHTML(item.name)} quantity">−</button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button class="cart-qty-button" type="button"
                            data-cart-action="increase" data-item="${escapeHTML(item.name)}"
                            aria-label="${currentLanguage === "en" ? "Increase" : "Padidinti"} ${escapeHTML(item.name)} quantity">+</button>
                        <button class="cart-remove" type="button"
                            data-cart-action="remove" data-item="${escapeHTML(item.name)}">${t("remove")}</button>
                    </div>
                </div>
            </article>
        `).join("")
        : `<div class="cart-empty"><span class="cart-empty-icon" aria-hidden="true">🛒</span>${t("emptyCart")}<br>${t("chooseDishes")}</div>`;

    document.getElementById("cartTotal").textContent = formatMoney(total);
    document.getElementById("order").disabled = totalQuantity === 0;
}

function add(index, quantity = 1) {
    const item = items[index];
    if (!item || !Number.isSafeInteger(quantity) || quantity < 1) return;
    for (let count = 0; count < quantity; count++) cart.push(item);
    renderCart();
}

function openCart() {
    const overlay = document.getElementById("cartOverlay");

    overlay.hidden = false;
    document.getElementById("cartButton").setAttribute("aria-expanded", "true");
    syncOverlayState();
    document.getElementById("cartClose").focus();
}

function closeCart() {
    document.getElementById("cartOverlay").hidden = true;
    document.getElementById("cartButton").setAttribute("aria-expanded", "false");
    syncOverlayState();
    document.getElementById("cartButton").focus();
}

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);

document.getElementById("cartOverlay").addEventListener("click", event => {
    if (event.target.id === "cartOverlay") closeCart();
});

document.getElementById("cartItems").addEventListener("click", event => {
    const button = event.target.closest("button[data-cart-action]");
    if (!button) return;

    const action = button.dataset.cartAction;
    const name = button.dataset.item;
    const index = cart.findIndex(item => item.name === name);

    if (index < 0) return;

    if (action === "increase") {
        cart.push(cart[index]);
    } else if (action === "decrease") {
        cart.splice(index, 1);
    } else if (action === "remove") {
        cart = cart.filter(item => item.name !== name);
    }

    renderCart();
});

function syncOverlayState() {
    const isOpen =
        !document.getElementById("cartOverlay").hidden ||
        !document.getElementById("deliveryOverlay").hidden;

    document.body.classList.toggle("overlay-open", isOpen);
    document.querySelector(".site-header").inert = isOpen;
    document.querySelector("main").inert = isOpen;
}

function closeDelivery() {
    document.getElementById("deliveryOverlay").hidden = true;
    hideLevelUp();
    setTab("menu");
    syncOverlayState();
    document.getElementById("menu-title").focus({ preventScroll: true });
}

document.getElementById("deliveryBack").addEventListener("click", closeDelivery);
document.getElementById("deliveryFinish").addEventListener("click", closeDelivery);

document.addEventListener("keydown", event => {
    const overlay = ["levelUpOverlay", "deliveryOverlay", "cartOverlay"]
        .map(id => document.getElementById(id))
        .find(element => !element.hidden);

    if (!overlay) return;

    if (event.key === "Escape") {
        event.preventDefault();

        if (overlay.id === "levelUpOverlay") {
            hideLevelUp();
        } else if (overlay.id === "deliveryOverlay") {
            closeDelivery();
        } else {
            closeCart();
        }

        return;
    }

    if (event.key !== "Tab") return;

    const buttons = [...overlay.querySelectorAll("button:not(:disabled)")]
        .filter(button => button.getClientRects().length);

    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && (current === first || !buttons.includes(current))) {
        event.preventDefault();
        last?.focus();
    } else if (!event.shiftKey && (current === last || !buttons.includes(current))) {
        event.preventDefault();
        first?.focus();
    }
});

renderCart();

// Užsakymo eiga rodoma viso ekrano lange po demonstracinio užsakymo.
let displayedOrder = null;

function getStepDescriptions() {
    return currentLanguage === "en"
        ? [
            t("placedDescription"),
            t("preparingDescription"),
            t("onTheWayDescription"),
            t("deliveredDescription")
        ]
        : [
            "Tavo užsakymas perduotas virtuvei.",
            "Virtuvė jau ruošia tavo patiekalus.",
            "Kurjeris paėmė užsakymą ir jau pakeliui.",
            "Užsakymas pristatytas. Skanaus!"
        ];
}

function showStep(number) {
    const labels = getLocalizedStepNames();
    const descriptions = getStepDescriptions();

    document.getElementById("steps").innerHTML = labels.map((step, index) =>
        `<li class="${index <= number ? "done" : ""} ${index === number ? "now" : ""}"${
            index === number ? ' aria-current="step"' : ""
        }>${step}</li>`
    ).join("");

    if (number < 0) return;

    document.getElementById("deliveryTitle").textContent = labels[number];
    document.getElementById("deliverySubtitle").textContent = descriptions[number];

    document.querySelector(".delivery-symbol").classList.toggle(
        "is-delivered",
        number === 3
    );

    document.getElementById("deliveryFinish").hidden = number !== 3;
}

showStep(-1);

document.getElementById("order").onclick = function() {
    if (!cart.length) return;

    const count = cart.length;

    const groupedItems = getGroupedCart().map(({
        name,
        price,
        quantity,
        restaurant,
        restaurantId
    }) => ({
        name,
        price,
        quantity,
        restaurant,
        restaurantId
    }));

    const total = cart.reduce((sum, item) => sum + item.price, 0);

    const order = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        items: groupedItems,
        total,
        status: getLocalizedStepNames()[0],
        statusIndex: 0
    };

    orderHistory.unshift(order);
    saveHistory();
    renderHistory();

    cart = [];
    renderCart();

    document.getElementById("cartOverlay").hidden = true;
    document.getElementById("cartButton").setAttribute("aria-expanded", "false");

    displayedOrder = order;

    document.getElementById("deliveryNumber").textContent = `Užsakymas #${order.id}`;
    document.getElementById("deliveryTotal").textContent = formatMoney(order.total);

    showStep(0);

    document.getElementById("deliveryOverlay").hidden = false;
    syncOverlayState();
    document.getElementById("deliveryTitle").focus();

    addXP(10 + count * 5);

    getLocalizedStepNames().forEach((step, index) => {
        setTimeout(() => {
            if (displayedOrder === order) showStep(index);

            order.status = getLocalizedStepNames()[index];
            order.statusIndex = index;

            saveHistory();
            renderHistory();

            if (index === 3) addXP(20);
        }, index * 4000);
    });
};

// XP, lygiai ir demonstraciniai apdovanojimai.
function getCurrentLevel() {
    return Math.floor(xp / 100) + 1;
}

function getLevelReward(level) {
    if (level % 5 === 0) {
        return 25 + (Math.floor(level / 5) - 1) * 25;
    }

    const regularRewards = [4, 7, 9, 6, 11, 8, 13, 10, 15, 7, 12];
    return regularRewards[(level - 2) % regularRewards.length];
}

function getEarnedRewardTotal() {
    return walletBalance;
}

function formatReward(amount) {
    return "€" + Number(amount).toLocaleString("lt-LT");
}

function renderLevelUI() {
    const level = getCurrentLevel();
    const progressXP = xp % 100;
    const percent = progressXP;

    document.getElementById("lvl").textContent = level;
    document.getElementById("xp").textContent = progressXP;
    document.getElementById("xpfill").style.width = percent + "%";

    const big = document.getElementById("levelBig");
    if (big) big.textContent = level;

    const progressText = document.getElementById("levelProgressText");
    if (progressText) progressText.textContent = `${progressXP} / 100 XP`;

    const progressFill = document.getElementById("levelProgressFill");
    if (progressFill) progressFill.style.width = percent + "%";

    const progressBar = document.getElementById("levelProgressBar");
    if (progressBar) progressBar.setAttribute("aria-valuenow", String(progressXP));

    const nextText = document.getElementById("levelNextText");
    if (nextText) {
        nextText.textContent = t("levelNext")
            .replace("{xp}", String(100 - progressXP))
            .replace("{level}", String(level + 1));
    }

    const total = document.getElementById("totalXP");
    if (total) total.textContent = `${xp.toLocaleString("lt-LT")} XP`;

    const balance = document.getElementById("rewardBalance");
    if (balance) balance.textContent = formatReward(walletBalance);

    const milestones = document.getElementById("milestoneCount");
    if (milestones) milestones.textContent = Math.floor(level / 5);

    const headerBalance = document.getElementById("headerBalance");
    if (headerBalance) headerBalance.textContent = formatReward(walletBalance);

    const profileBalance = document.getElementById("profileBalance");
    if (profileBalance) profileBalance.textContent = formatReward(walletBalance);

    const profileLevel = document.getElementById("profileLevelSummary");
    if (profileLevel) {
        profileLevel.textContent = `${level} ${
            currentLanguage === "en" ? "level" : "lygis"
        } · ${xp.toLocaleString("lt-LT")} XP`;
    }
}

function renderLevelCenter() {
    renderLevelUI();

    const currentLevel = getCurrentLevel();
    const firstLevel = Math.max(2, currentLevel - 2);
    const lastLevel = Math.max(10, currentLevel + 7);
    const rewardCards = [];

    for (let level = firstLevel; level <= lastLevel; level++) {
        const milestone = level % 5 === 0;
        const earned = level <= currentLevel;
        const amount = getLevelReward(level);

        rewardCards.push(`
            <article class="reward-card ${earned ? "earned" : "locked"} ${milestone ? "milestone" : ""}">
                <div class="reward-card-icon" aria-hidden="true">${milestone ? "🏆" : "🎁"}</div>
                <div class="reward-card-info">
                    <span class="reward-level">${currentLanguage === "en" ? "LEVEL" : "LYGIS"} ${level}${milestone ? " · MILESTONE" : ""}</span>
                    <strong>${milestone ? t("milestoneReward") : t("regularReward")}</strong>
                    <small>${earned ? t("rewardUnlocked") : t("rewardLocked")}</small>
                </div>
                <div class="reward-card-amount">
                    <strong>${formatReward(amount)}</strong>
                    <span>${earned ? t("received") : t("locked")}</span>
                </div>
            </article>
        `);
    }

    document.getElementById("rewardList").innerHTML = rewardCards.join("");
}

function hideLevelUp() {
    const overlay = document.getElementById("levelUpOverlay");

    overlay.classList.remove("visible");

    const wasVisible = !overlay.hidden;
    overlay.hidden = true;

    if (wasVisible && !document.getElementById("deliveryOverlay").hidden) {
        document.getElementById("deliveryTitle").focus();
    }

    if (levelUpTimer) {
        clearTimeout(levelUpTimer);
        levelUpTimer = null;
    }
}

function showLevelUp(level, earnedAmount, levelsGained) {
    const overlay = document.getElementById("levelUpOverlay");

    document.getElementById("levelUpNumber").textContent = level;

    document.getElementById("levelUpReward").textContent = currentLanguage === "en"
        ? (
            levelsGained > 1
                ? `You gained ${levelsGained} levels and received ${formatReward(earnedAmount)}!`
                : `${formatReward(earnedAmount)} was added to your balance!`
        )
        : (
            levelsGained > 1
                ? `Peršokai ${levelsGained} lygius ir gavai ${formatReward(earnedAmount)} demo rewardų!`
                : `Gavai ${formatReward(earnedAmount)} į demonstracinį balansą!`
        );

    overlay.hidden = false;

    requestAnimationFrame(() => {
        overlay.classList.add("visible");
        document.getElementById("levelUpClose").focus();
    });

    if (levelUpTimer) clearTimeout(levelUpTimer);
    levelUpTimer = setTimeout(hideLevelUp, 4200);
}

function addXP(amountToAdd) {
    const amount = Math.max(0, Math.floor(Number(amountToAdd) || 0));
    if (!amount) return;

    const previousLevel = getCurrentLevel();

    xp += amount;

    const newLevel = getCurrentLevel();

    saveXP();

    let earnedAmount = 0;

    if (newLevel > rewardedThroughLevel) {
        for (
            let level = rewardedThroughLevel + 1;
            level <= newLevel;
            level++
        ) {
            earnedAmount += getLevelReward(level);
        }

        rewardedThroughLevel = newLevel;
        walletBalance = Math.round((walletBalance + earnedAmount) * 100) / 100;

        writeStoredValue(STORAGE_KEYS.rewardLevel, rewardedThroughLevel);
        saveWallet();
    }

    renderLevelUI();
    renderProfile();

    if (newLevel > previousLevel) {
        renderLevelCenter();
        showLevelUp(newLevel, earnedAmount, newLevel - previousLevel);
    }
}

// Pažanga ir krepšelis išsaugomi automatiškai uždarant / paslepiant puslapį.
saveXP();

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") saveXP();
});

window.addEventListener("pagehide", saveXP);
window.addEventListener("beforeunload", saveXP);

window.addEventListener("pagehide", () => {
    writeStoredValue(STORAGE_KEYS.cart, cart.map(item => item.name));
});

renderLevelUI();
renderCart();
renderHistory();
renderProfile();

setInterval(updateNameCooldown, 15000);
