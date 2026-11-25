// BoomFood – naršyklėje veikianti demonstracinė versija.
// Duomenys saugomi localStorage; tikro serverio, prisijungimo ar mokėjimų nėra.

(() => {
    "use strict";

    const STORAGE_KEYS = {
        cart: "boomfood.cart.v1",
        history: "boomfood.orderHistory.v1",
        xp: "boomfood.xp.v1",
        reviews: "boomfood.restaurantReviews.v2",
        profile: "boomfood.profile.v1",
        theme: "boomfood.theme.v1",
        language: "boomfood.language.v1",
        balance: "boomfood-balansas",
        claimedLevels: "boomfood.levelRewards.claimed.v1"
    };

    const NAME_COOLDOWN_MS = 30 * 60 * 1000;
    const DEFAULT_PROFILE = { name: "BoomFood naudotojas", picture: "", nameLastChangedAt: 0 };

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

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        })[character]);
    }

    const I18N = {
        lt: {
            pageTitle: "Ko norėtum paragauti?",
            simulationNotice: "Tai simuliacija. Tikras maistas nebus pristatytas ir mokėti nereikia.",
            discoverFlavours: "BOOMFOOD · ATRASK SKONIUS",
            restaurants: "Restoranai",
            restaurantsDescription: "Išsirink restoraną, peržiūrėk jo meniu ir pridėk patiekalus į krepšelį.",
            profile: "Profilis", logout: "Atsijungti", language: "Kalba", level: "Lygis",
            backToRestaurants: "← Visi restoranai", menu: "Meniu", viewMenu: "Peržiūrėti meniu",
            reviews: "Atsiliepimai", reviewCount: "atsiliepimų", dishes: "patiekalai",
            restaurantReviewsEyebrow: "BOOMFOOD · KLIENTŲ NUOMONĖS", restaurantReviews: "Restorano atsiliepimai",
            leaveReview: "Palik atsiliepimą", yourName: "Vardas", namePlaceholder: "Tavo vardas",
            rating: "Įvertinimas", comment: "Komentaras", reviewPlaceholder: "Pasidalink savo nuomone...",
            publishReview: "Paskelbti atsiliepimą", noReviews: "Šis restoranas dar neturi atsiliepimų.",
            reviewAdded: "Atsiliepimas pridėtas ir išsaugotas šiame įrenginyje.",
            reviewValidation: "Užpildyk visus laukus ir pasirink įvertinimą.",
            profileSubtitle: "Tvarkyk savo paskyrą, nustatymus ir peržiūrėk užsakymus.",
            accountOverview: "BOOMFOOD · PASKYRA", yourAccount: "TAVO PASKYRA",
            changePhoto: "Keisti nuotrauką", profileDetails: "Profilio informacija", profileName: "Profilio vardas",
            save: "Išsaugoti", nameSaved: "Profilio vardas atnaujintas.",
            nameCooldown: "Vardą galėsi keisti po {time}.", nameAvailable: "Vardą gali keisti dabar.",
            nameSame: "Įvesk kitą vardą.", nameInvalid: "Vardas turi būti 2–30 simbolių.",
            photoInvalid: "Pasirink tinkamą paveikslėlį.", photoTooLarge: "Nuotrauka per didelė. Pasirink failą iki 8 MB.",
            photoSaved: "Profilio nuotrauka atnaujinta.", photoError: "Nepavyko apdoroti nuotraukos.",
            demoBalance: "Demonstracinis balansas", balanceDisclaimer: "Balansas pildomas lygio apdovanojimais. Tikri mokėjimai nevykdomi.",
            quickActions: "Greiti veiksmai", favorites: "Mėgstamiausi", comingSoon: "Jau greitai",
            settings: "Nustatymai", themeAndAccount: "Tema ir paskyra", appearanceSettings: "Pasirink svetainės išvaizdą.",
            theme: "Tema", themeDescription: "Pasirink šviesų arba tamsų režimą.", lightMode: "Šviesi", darkMode: "Tamsi",
            deleteAccount: "Ištrinti paskyrą", deleteAccountDescription: "Ištrins vietinius profilio, balanso, krepšelio ir užsakymų duomenis.", delete: "Ištrinti",
            deleteConfirm: "Ar tikrai ištrinti šios demonstracinės paskyros duomenis šiame įrenginyje? Veiksmo atšaukti nepavyks.",
            accountDeleted: "Vietiniai demonstracinės paskyros duomenys ištrinti.",
            favoritesNotice: "Mėgstamiausių restoranų funkcija bus pridėta vėliau.",
            logoutNotice: "Tai demonstracinė svetainė be tikros prisijungimo sesijos. Grįžai į restoranų katalogą; duomenys išsaugoti.",
            orderHistory: "Užsakymų istorija", orderHistorySubtitle: "Peržiūrėk ankstesnius užsakymus ir jų detales.",
            orders: "užsakymų", order: "užsakymas", noOrders: "Kol kas užsakymų nėra. Pasirink patiekalų meniu ir pateik pirmą demonstracinį užsakymą.",
            orderDetails: "Peržiūrėti užsakymą", hideDetails: "Slėpti detales", orderNumber: "Užsakymas",
            items: "prek.", subtotal: "Suma", total: "Iš viso", status: "Būsena", restaurant: "Restoranas",
            yourCart: "Tavo krepšelis", placeOrder: "Pateikti užsakymą", cartDisclaimer: "Tai demonstracinis krepšelis – mokėjimas nevykdomas.",
            cartEmpty: "Krepšelis tuščias.", chooseDishes: "Pasirink patiekalus iš meniu.",
            add: "Pridėti", remove: "Pašalinti", increase: "Padidinti", decrease: "Sumažinti", perItem: "vnt.",
            levelSystem: "Lygių sistema", levelSubtitle: "Kaupk XP už užsakymus, kelk lygius ir atrakink apdovanojimus.",
            currentLevel: "DABARTINIS LYGIS", progressToNext: "Progresas iki kito lygio", nextLevel: "Dar {xp} XP iki {level} lygio.",
            howToEarn: "Už pateiktą užsakymą gauni XP, o už pristatytą užsakymą – papildomų XP.",
            totalXP: "Iš viso sukaupta", allOrderXP: "Visų užsakymų XP", rewardBalance: "Balansas",
            unlockedMilestones: "Atrakinti milestone’ai", everyFiveLevels: "Kas 5 lygius – didesnis rewardas",
            rewardPath: "Apdovanojimų kelias", rewardPathDescription: "Kiekvienas naujas lygis suteikia piniginį apdovanojimą. Kas 5 lygius laukia didesnis milestone’as.",
            demoRewards: "DEMO APDOVANOJIMAI", levelReward: "Lygio apdovanojimas", milestoneReward: "Milestone apdovanojimas",
            rewardUnlocked: "Apdovanojimas gautas", reachLevel: "Pasiek šį lygį, kad atrakintum", received: "✓ Gauta", locked: "🔒 Užrakinta",
            levelDisclaimer: "Visos sumos yra demonstracinės. Balansas saugomas tik šiame įrenginyje.",
            savedOnDevice: "Pažanga išsaugoma automatiškai šiame įrenginyje.",
            back: "← Atgal", orderAccepted: "Užsakymas priimtas", preparing: "Gaminamas", onTheWay: "Pakeliui", delivered: "Pristatytas",
            stepAccepted: "Tavo užsakymas perduotas virtuvei.", stepPreparing: "Virtuvė jau ruošia tavo patiekalus.",
            stepOnTheWay: "Kurjeris paėmė užsakymą ir jau pakeliui.", stepDelivered: "Užsakymas pristatytas. Skanaus!",
            orderProgress: "Užsakymo eiga", orderAmount: "Užsakymo suma", backToMenu: "← Grįžti į meniu", finish: "Grįžti į meniu", great: "Puiku!",
            levelUpTitle: "Naujas lygis pasiektas!", levelUpSingle: "Gavai {amount} į demonstracinį balansą!",
            levelUpMultiple: "Peršokai {levels} lygius ir gavai {amount} demo rewardų!",
            logout: "Atsijungti", photoUpload: "Profilio nuotrauka", stars: "žvaigždutės"
        },
        en: {
            pageTitle: "What are you craving today?",
            simulationNotice: "This is a simulation. No real food will be delivered and no payment is required.",
            discoverFlavours: "BOOMFOOD · DISCOVER NEW FLAVOURS",
            restaurants: "Restaurants",
            restaurantsDescription: "Choose a restaurant, explore its menu and add dishes to your cart.",
            profile: "Profile", logout: "Log out", language: "Language", level: "Level",
            backToRestaurants: "← All restaurants", menu: "Menu", viewMenu: "View menu",
            reviews: "Reviews", reviewCount: "reviews", dishes: "dishes",
            restaurantReviewsEyebrow: "BOOMFOOD · CUSTOMER FEEDBACK", restaurantReviews: "Restaurant reviews",
            leaveReview: "Leave a review", yourName: "Name", namePlaceholder: "Your name",
            rating: "Rating", comment: "Comment", reviewPlaceholder: "Share your experience...",
            publishReview: "Post review", noReviews: "This restaurant has no reviews yet.",
            reviewAdded: "Your review was added and saved on this device.",
            reviewValidation: "Complete all fields and choose a rating.",
            profileSubtitle: "Manage your profile, settings and order history.",
            accountOverview: "BOOMFOOD · ACCOUNT", yourAccount: "YOUR ACCOUNT",
            changePhoto: "Change photo", profileDetails: "Profile details", profileName: "Profile name",
            save: "Save", nameSaved: "Profile name updated.",
            nameCooldown: "You can change your name in {time}.", nameAvailable: "You can change your name now.",
            nameSame: "Enter a different name.", nameInvalid: "Name must be 2–30 characters.",
            photoInvalid: "Choose a valid image.", photoTooLarge: "The image is too large. Choose a file up to 8 MB.",
            photoSaved: "Profile picture updated.", photoError: "Could not process this image.",
            demoBalance: "Demo balance", balanceDisclaimer: "Your balance increases through level rewards. No real payments are made.",
            quickActions: "Quick actions", favorites: "Favourites", comingSoon: "Coming soon",
            settings: "Settings", themeAndAccount: "Theme and account", appearanceSettings: "Choose how the website looks.",
            theme: "Theme", themeDescription: "Choose light or dark mode.", lightMode: "Light", darkMode: "Dark",
            deleteAccount: "Delete account", deleteAccountDescription: "Deletes local profile, balance, cart and order data.", delete: "Delete",
            deleteConfirm: "Delete this demo account's data from this device? This action cannot be undone.",
            accountDeleted: "Local demo account data has been deleted.",
            favoritesNotice: "The favourites feature will be added later.",
            logoutNotice: "This demo website has no real sign-in session. You are back at the restaurant list; your data is saved.",
            orderHistory: "Order history", orderHistorySubtitle: "Review previous orders and their details.",
            orders: "orders", order: "order", noOrders: "No orders yet. Choose dishes from a menu and place your first demo order.",
            orderDetails: "View order", hideDetails: "Hide details", orderNumber: "Order",
            items: "items", subtotal: "Total", total: "Total", status: "Status", restaurant: "Restaurant",
            yourCart: "Your cart", placeOrder: "Place order", cartDisclaimer: "This is a demo cart — no payment is processed.",
            cartEmpty: "Your cart is empty.", chooseDishes: "Choose dishes from a menu.",
            add: "Add", remove: "Remove", increase: "Increase", decrease: "Decrease", perItem: "each",
            levelSystem: "Levels", levelSubtitle: "Earn XP with orders, level up and unlock rewards.",
            currentLevel: "CURRENT LEVEL", progressToNext: "Progress to next level", nextLevel: "{xp} XP to level {level}.",
            howToEarn: "Earn XP when placing an order and additional XP when it is delivered.",
            totalXP: "Total earned", allOrderXP: "XP from all orders", rewardBalance: "Balance",
            unlockedMilestones: "Milestones unlocked", everyFiveLevels: "A bigger reward every 5 levels",
            rewardPath: "Reward path", rewardPathDescription: "Each new level gives a cash reward. Every 5 levels unlocks a bigger milestone.",
            demoRewards: "DEMO REWARDS", levelReward: "Level reward", milestoneReward: "Milestone reward",
            rewardUnlocked: "Reward received", reachLevel: "Reach this level to unlock", received: "✓ Received", locked: "🔒 Locked",
            levelDisclaimer: "All amounts are for demonstration. Your balance is stored only on this device.",
            savedOnDevice: "Progress is automatically saved on this device.",
            back: "← Back", orderAccepted: "Order accepted", preparing: "Preparing", onTheWay: "On the way", delivered: "Delivered",
            stepAccepted: "Your order has been sent to the kitchen.", stepPreparing: "The kitchen is preparing your food.",
            stepOnTheWay: "The courier picked up your order and is on the way.", stepDelivered: "Your order has been delivered. Enjoy!",
            orderProgress: "Order progress", orderAmount: "Order total", backToMenu: "← Back to menu", finish: "Back to menu", great: "Great!",
            levelUpTitle: "Level up!", levelUpSingle: "You received {amount} in your demo balance!",
            levelUpMultiple: "You gained {levels} levels and received {amount} in demo rewards!",
            photoUpload: "Profile picture", stars: "stars"
        }
    };

    let language = localStorage.getItem(STORAGE_KEYS.language) === "en" ? "en" : "lt";
    let theme = localStorage.getItem(STORAGE_KEYS.theme) === "dark" ? "dark" : "light";
    let profile = readStoredValue(STORAGE_KEYS.profile, { ...DEFAULT_PROFILE });
    if (!profile || typeof profile !== "object") profile = { ...DEFAULT_PROFILE };
    profile = { ...DEFAULT_PROFILE, ...profile };

    function t(key, values = {}) {
        let output = (I18N[language] && I18N[language][key]) || I18N.lt[key] || key;
        Object.entries(values).forEach(([name, value]) => {
            output = output.replaceAll(`{${name}}`, String(value));
        });
        return output;
    }

    function applyLanguage() {
        document.documentElement.lang = language;
        document.querySelectorAll("[data-i18n]").forEach(element => {
            const key = element.dataset.i18n;
            if (I18N[language][key]) element.textContent = t(key);
        });
        document.querySelectorAll("[data-i18n-placeholder]").forEach(element => {
            const key = element.dataset.i18nPlaceholder;
            if (I18N[language][key]) element.placeholder = t(key);
        });
        const langSelect = document.getElementById("languageSelect");
        if (langSelect) langSelect.value = language;
        const ratingSelect = document.getElementById("reviewRating");
        if (ratingSelect) {
            ratingSelect.innerHTML = language === "lt"
                ? '<option value="5">★★★★★ – Puikiai</option><option value="4">★★★★☆ – Gerai</option><option value="3">★★★☆☆ – Vidutiniškai</option><option value="2">★★☆☆☆ – Prastai</option><option value="1">★☆☆☆☆ – Blogai</option>'
                : '<option value="5">★★★★★ – Excellent</option><option value="4">★★★★☆ – Good</option><option value="3">★★★☆☆ – Average</option><option value="2">★★☆☆☆ – Poor</option><option value="1">★☆☆☆☆ – Bad</option>';
        }
        const levelOverline = document.querySelector(".level-overline");
        if (levelOverline) levelOverline.textContent = language === "lt" ? "BOOMFOOD RANK" : "BOOMFOOD RANK";
        const progressFoot = document.querySelector(".level-progress-foot");
        if (progressFoot) {
            progressFoot.children[0].textContent = "0 XP";
            progressFoot.children[1].textContent = "100 XP";
        }
        const avatarButton = document.getElementById("profileButton");
        if (avatarButton) {
            avatarButton.title = language === "lt" ? "Paskyra" : "Account";
            avatarButton.setAttribute("aria-label", language === "lt" ? "Atidaryti paskyros meniu" : "Open account menu");
        }
        document.getElementById("cartButton")?.setAttribute("aria-label", language === "lt" ? "Atidaryti krepšelį" : "Open cart");
        document.getElementById("cartClose")?.setAttribute("aria-label", language === "lt" ? "Uždaryti krepšelį" : "Close cart");
        document.getElementById("levelButton")?.setAttribute("aria-label", language === "lt" ? "Atidaryti lygių sistemą" : "Open level system");
        document.getElementById("homeButton")?.setAttribute("aria-label", language === "lt" ? "BoomFood – grįžti į pagrindinį puslapį" : "BoomFood – go to home page");
        document.getElementById("profileAvatarPreview")?.setAttribute("aria-label", t("photoUpload"));
        renderRestaurants();
        renderMenu();
        renderRestaurantReviews();
        renderHistory();
        renderCart();
        renderLevelUI();
        if (!document.getElementById("profileView").hidden) renderProfile();
        if (!document.getElementById("levelView").hidden) renderLevelCenter();
        updateDeliveryLanguage();
    }

    function applyTheme() {
        document.documentElement.dataset.theme = theme;
        document.documentElement.style.colorScheme = theme;
        localStorage.setItem(STORAGE_KEYS.theme, theme);
        document.querySelectorAll("[data-theme-choice]").forEach(button => {
            button.classList.toggle("active", button.dataset.themeChoice === theme);
            button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
        });
        document.getElementById("profileBalance") && (document.getElementById("profileBalance").textContent = formatMoney(balance));
    }

    function showToast(message) {
        let toast = document.getElementById("appToast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "appToast";
            toast.className = "app-toast";
            toast.setAttribute("role", "status");
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add("visible");
        clearTimeout(showToast.timer);
        showToast.timer = setTimeout(() => toast.classList.remove("visible"), 3200);
    }

    const stepNames = ["Užsakymas priimtas", "Gaminamas", "Pakeliui", "Pristatytas"];
    function translatedStep(index) {
        return [t("orderAccepted"), t("preparing"), t("onTheWay"), t("delivered")][index] || t("orderAccepted");
    }
    function translatedStepDescription(index) {
        return [t("stepAccepted"), t("stepPreparing"), t("stepOnTheWay"), t("stepDelivered")][index] || "";
    }
    function statusIndex(status) {
        const index = stepNames.indexOf(status);
        return index >= 0 ? index : 0;
    }
    function formatMoney(value) {
        return Number(value || 0).toLocaleString(language === "lt" ? "lt-LT" : "en-IE", {
            minimumFractionDigits: 2, maximumFractionDigits: 2
        }) + " €";
    }
    function formatReward(value) {
        return "€" + Number(value || 0).toLocaleString(language === "lt" ? "lt-LT" : "en-IE");
    }
    function formatDate(value) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return language === "lt" ? "Data nenurodyta" : "Date unavailable";
        return new Intl.DateTimeFormat(language === "lt" ? "lt-LT" : "en-GB", {
            dateStyle: "medium", timeStyle: "short"
        }).format(date);
    }

    // Restoranų katalogas ir meniu.
    const IMG = { cepelinai: "images/cepelinai.webp" };
    const restaurants = [
        {
            id: "lt", name: "Lietuviška Virtuvė", nameEn: "Lithuanian Kitchen", icon: "🥟",
            image: "images/restaurants/lietuviska-virtuve.webp",
            category: "Lietuviška virtuvė", categoryEn: "Lithuanian cuisine",
            dishes: [
                { name: "Cepelinai su mėsa", nameEn: "Potato dumplings with meat", price: 7.9, image: IMG.cepelinai },
                { name: "Šaltibarščiai", nameEn: "Cold beet soup", price: 4.8, icon: "🩷" },
                { name: "Bulvių kugelis", nameEn: "Potato pudding", price: 6.5, icon: "🥔" },
                { name: "Kibinai (3 vnt.)", nameEn: "Kibinai (3 pcs)", price: 5.9, icon: "🥟" },
                { name: "Bulviniai blynai", nameEn: "Potato pancakes", price: 6.2, icon: "🥞" }
            ]
        },
        {
            id: "pizza", name: "Pizza Corner", nameEn: "Pizza Corner", icon: "🍕",
            image: "images/restaurants/pizza-corner.webp",
            category: "Picos ir itališki skoniai", categoryEn: "Pizza & Italian",
            dishes: [
                { name: "Pica Margarita", nameEn: "Margherita pizza", price: 9.5, icon: "🍕" },
                { name: "Pica Pepperoni", nameEn: "Pepperoni pizza", price: 10.9, icon: "🍕" },
                { name: "Pica Keturi sūriai", nameEn: "Four cheese pizza", price: 11.5, icon: "🧀" },
                { name: "Pica Hawaii", nameEn: "Hawaiian pizza", price: 10.5, icon: "🍍" },
                { name: "Calzone", nameEn: "Calzone", price: 9.9, icon: "🥟" }
            ]
        },
        {
            id: "burger", name: "Burger House", nameEn: "Burger House", icon: "🍔",
            image: "images/restaurants/burger-house.webp",
            category: "Mėsainiai", categoryEn: "Burgers",
            dishes: [
                { name: "Klasikinis burgeris", nameEn: "Classic burger", price: 7.5, icon: "🍔" },
                { name: "Sūrio burgeris", nameEn: "Cheeseburger", price: 8.2, icon: "🧀" },
                { name: "Bekono burgeris", nameEn: "Bacon burger", price: 8.9, icon: "🥓" },
                { name: "Vištienos burgeris", nameEn: "Chicken burger", price: 7.9, icon: "🍗" },
                { name: "Veggie burgeris", nameEn: "Veggie burger", price: 7.8, icon: "🥬" }
            ]
        },
        {
            id: "sushi", name: "Sushi Point", nameEn: "Sushi Point", icon: "🍣",
            image: "images/restaurants/sushi-point.webp",
            category: "Sušiai ir azijietiški patiekalai", categoryEn: "Sushi & Asian cuisine",
            dishes: [
                { name: "Suši rinkinys", nameEn: "Sushi set", price: 12.9, icon: "🍣" },
                { name: "Kalifornijos ritiniai", nameEn: "California rolls", price: 9.9, icon: "🍙" },
                { name: "Lašišos nigiri (4 vnt.)", nameEn: "Salmon nigiri (4 pcs)", price: 8.5, icon: "🍣" },
                { name: "Miso sriuba", nameEn: "Miso soup", price: 3.9, icon: "🍜" },
                { name: "Edamame", nameEn: "Edamame", price: 4.2, icon: "🫛" }
            ]
        },
        {
            id: "green", name: "Green Bite", nameEn: "Green Bite", icon: "🥗",
            image: "images/restaurants/green-bite.webp",
            category: "Salotos ir sveikesni pasirinkimai", categoryEn: "Salads & healthy choices",
            dishes: [
                { name: "Cezario salotos", nameEn: "Caesar salad", price: 7.2, icon: "🥗" },
                { name: "Veganiškas bowl", nameEn: "Vegan bowl", price: 8.9, icon: "🥙" },
                { name: "Humusas su daržovėmis", nameEn: "Hummus with vegetables", price: 5.5, icon: "🥕" },
                { name: "Žaliasis smoothie", nameEn: "Green smoothie", price: 4.5, icon: "🥤" },
                { name: "Veganiškas wrap", nameEn: "Vegan wrap", price: 6.9, icon: "🌯" }
            ]
        }
    ];

    const items = restaurants.flatMap(restaurant => restaurant.dishes.map(dish => ({
        ...dish, restaurant: restaurant.name, restaurantId: restaurant.id
    })));

    function restaurantName(restaurantId) {
        const restaurant = restaurants.find(item => item.id === restaurantId);
        return restaurant ? (language === "en" ? restaurant.nameEn : restaurant.name) : t("restaurant");
    }
    function dishName(item) {
        const dish = items.find(product => product.name === item.name);
        return dish ? (language === "en" ? dish.nameEn : dish.name) : (item.name || "");
    }
    function restaurantCategory(restaurant) {
        return language === "en" ? restaurant.categoryEn : restaurant.category;
    }
    function renderStars(rating) {
        const filled = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
        return "★".repeat(filled) + "☆".repeat(5 - filled);
    }

    // Pradiniai duomenys – po penkis skirtingus atsiliepimus kiekvienam restoranui.
    // Tai aiškiai pažymėti demonstraciniai atsiliepimai, o lankytojų atsiliepimai saugomi atskirai.
    const BASE_REVIEWS = {
        lt: [
            { name: "Mantas", rating: 5, comment: "Cepelinai priminė namuose gamintus, o porcija tikrai soti.", commentEn: "The potato dumplings tasted homemade and the portion was generous.", dateLabel: "prieš 2 val." },
            { name: "Ieva", rating: 4, comment: "Šaltibarščiai labai geri, tik norėjosi truputį daugiau bulvių.", commentEn: "The cold beet soup was great; I would have liked a little more potato on the side.", dateLabel: "vakar" },
            { name: "Paulius", rating: 5, comment: "Kugelis puikus, patiekalai atkeliavo dar šilti.", commentEn: "The potato pudding was excellent and the food arrived warm.", dateLabel: "prieš 2 d." },
            { name: "Rūta", rating: 4, comment: "Geras tradicinis maistas ir normalios kainos.", commentEn: "Good traditional food and reasonable prices.", dateLabel: "prieš 3 d." },
            { name: "Lukas", rating: 3, comment: "Skonis geras, bet pristatymas užtruko ilgiau nei tikėjausi.", commentEn: "The food tasted good, but delivery took longer than expected.", dateLabel: "prieš 5 d." }
        ],
        pizza: [
            { name: "Gabija", rating: 5, comment: "Traški plutelė, daug sūrio ir labai geras pepperoni.", commentEn: "Crispy crust, plenty of cheese and excellent pepperoni.", dateLabel: "prieš 1 val." },
            { name: "Tomas", rating: 5, comment: "Margarita paprasta, bet tikrai skani. Užsisakysiu dar.", commentEn: "The Margherita is simple but really tasty. I will order again.", dateLabel: "vakar" },
            { name: "Austėja", rating: 4, comment: "Pica gera, tik galėtų būti šiek tiek mažiau aliejaus.", commentEn: "The pizza was good, though it could use a little less oil.", dateLabel: "prieš 2 d." },
            { name: "Dominykas", rating: 3, comment: "Skonis neblogas, bet pica atvyko jau pravėsusi.", commentEn: "The taste was decent, but the pizza arrived lukewarm.", dateLabel: "prieš 4 d." },
            { name: "Ema", rating: 5, comment: "Keturių sūrių pica verta kiekvieno cento.", commentEn: "The four-cheese pizza is worth every cent.", dateLabel: "prieš 6 d." }
        ],
        burger: [
            { name: "Karolis", rating: 4, comment: "Sultingas burgeris ir geras padažas. Bulvytės galėtų būti traškesnės.", commentEn: "Juicy burger and a great sauce. The fries could be crispier.", dateLabel: "prieš 3 val." },
            { name: "Monika", rating: 5, comment: "Vištienos burgeris labai skanus, porcija soti.", commentEn: "The chicken burger was delicious and filling.", dateLabel: "vakar" },
            { name: "Edvinas", rating: 4, comment: "Geras kainos ir kokybės santykis.", commentEn: "Good value for money.", dateLabel: "prieš 2 d." },
            { name: "Simona", rating: 2, comment: "Bandelė buvo kiek sausa, o mėsa persūdyta.", commentEn: "The bun was a little dry and the patty was too salty.", dateLabel: "prieš 4 d." },
            { name: "Nojus", rating: 5, comment: "Klasikinis burgeris tapo mano favoritu.", commentEn: "The classic burger has become my favourite.", dateLabel: "prieš 1 sav." }
        ],
        sushi: [
            { name: "Viktorija", rating: 4, comment: "Sušiai švieži, ryžiai geros tekstūros.", commentEn: "The sushi was fresh and the rice had a good texture.", dateLabel: "prieš 2 val." },
            { name: "Tadas", rating: 5, comment: "Lašišos nigiri puikūs, tikrai rekomenduoju.", commentEn: "The salmon nigiri was excellent. Highly recommended.", dateLabel: "vakar" },
            { name: "Miglė", rating: 3, comment: "Skonis geras, bet rinkinys galėtų būti įvairesnis.", commentEn: "The flavour was good, but the set could be more varied.", dateLabel: "prieš 2 d." },
            { name: "Arnas", rating: 4, comment: "Miso sriuba labai patiko, sušiai taip pat geri.", commentEn: "I really liked the miso soup; the sushi was good too.", dateLabel: "prieš 4 d." },
            { name: "Ugnė", rating: 2, comment: "Ritiniai buvo kiek ištižę, tikėjausi geresnės kokybės.", commentEn: "The rolls were a little soggy. I expected better quality.", dateLabel: "prieš 6 d." }
        ],
        green: [
            { name: "Aistė", rating: 5, comment: "Šviežios daržovės, skanūs padažai ir puikus bowl.", commentEn: "Fresh vegetables, tasty dressings and an excellent bowl.", dateLabel: "prieš 1 val." },
            { name: "Jonas", rating: 4, comment: "Cezario salotos labai geros, norėtųsi daugiau padažo.", commentEn: "The Caesar salad was great; I would have liked a little more dressing.", dateLabel: "vakar" },
            { name: "Greta", rating: 5, comment: "Pagaliau skanus veganiškas pasirinkimas su didele porcija.", commentEn: "Finally, a delicious vegan option with a generous portion.", dateLabel: "prieš 2 d." },
            { name: "Dovydas", rating: 5, comment: "Smoothie gaivus, o wrap buvo labai sotus.", commentEn: "The smoothie was refreshing and the wrap was very filling.", dateLabel: "prieš 3 d." },
            { name: "Emilija", rating: 4, comment: "Puikus lengvesnis maistas, tik pristatymas kiek vėlavo.", commentEn: "Great lighter food, though delivery was a little late.", dateLabel: "prieš 5 d." }
        ]
    };

    let userReviews = readStoredValue(STORAGE_KEYS.reviews, []);
    if (!Array.isArray(userReviews)) userReviews = [];
    userReviews = userReviews.filter(review => review && restaurants.some(r => r.id === review.restaurantId));

    function getRestaurantReviews(restaurantId) {
        const seeds = (BASE_REVIEWS[restaurantId] || []).map((review, index) => ({
            ...review, id: `seed-${restaurantId}-${index}`, isSeed: true
        }));
        const submitted = userReviews.filter(review => review.restaurantId === restaurantId)
            .map(review => ({ ...review, isSeed: false }));
        return [...submitted, ...seeds];
    }
    function getRatingInfo(restaurantId) {
        const reviews = getRestaurantReviews(restaurantId);
        const average = reviews.length ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length : 0;
        return { count: reviews.length, average };
    }
    function reviewDateLabel(review) {
        if (language === "lt") return review.dateLabel || "Neseniai";
        if (!review.isSeed) return "Just now · on this device";
        const labels = {
            "prieš 1 val.": "1 hour ago", "prieš 2 val.": "2 hours ago", "prieš 3 val.": "3 hours ago",
            "vakar": "Yesterday", "prieš 2 d.": "2 days ago", "prieš 3 d.": "3 days ago",
            "prieš 4 d.": "4 days ago", "prieš 5 d.": "5 days ago", "prieš 6 d.": "6 days ago",
            "prieš 1 sav.": "1 week ago"
        };
        return labels[review.dateLabel] || "Recently";
    }

    let selectedRestaurant = restaurants[0].id;
    let selectedReviewRestaurant = restaurants[0].id;

    function renderRestaurants() {
        const list = document.getElementById("restaurantList");
        const count = document.getElementById("restaurantsCount");
        if (!list) return;
        if (count) count.textContent = `${restaurants.length} ${language === "lt" ? "restoranai" : "restaurants"}`;
        list.innerHTML = restaurants.map(restaurant => {
            const rating = getRatingInfo(restaurant.id);
            return `
                <article class="restaurant-card">
                    <span class="restaurant-card-art" aria-hidden="true">
                        <img src="${escapeHTML(restaurant.image)}" alt="" loading="lazy" decoding="async">
                    </span>
                    <span class="restaurant-card-content">
                        <span class="restaurant-card-category">${escapeHTML(restaurantCategory(restaurant))}</span>
                        <strong class="restaurant-card-name">${escapeHTML(restaurantName(restaurant.id))}</strong>
                        <span class="restaurant-card-meta">${restaurant.dishes.length} ${t("dishes")} · ${language === "lt" ? "Demonstracinis meniu" : "Demo menu"}</span>
                        <span class="restaurant-rating-line"><span class="stars">${renderStars(rating.average)}</span><strong>${rating.average.toFixed(1)}</strong><small>(${rating.count} ${t("reviewCount")})</small></span>
                        <span class="restaurant-card-actions">
                            <button type="button" class="restaurant-menu-action" data-open-restaurant="${restaurant.id}">${t("viewMenu")} →</button>
                            <button type="button" class="restaurant-review-action" data-open-reviews="${restaurant.id}">${t("reviews")}</button>
                        </span>
                    </span>
                </article>`;
        }).join("");
    }

    function openRestaurant(restaurantId) {
        const restaurant = restaurants.find(item => item.id === restaurantId);
        if (!restaurant) return;
        selectedRestaurant = restaurant.id;
        document.getElementById("restaurantDetailIcon").textContent = restaurant.icon;
        document.getElementById("restaurantDetailCategory").textContent = restaurantCategory(restaurant).toLocaleUpperCase(language === "lt" ? "lt-LT" : "en-US");
        document.getElementById("menu-title").textContent = restaurantName(restaurant.id);
        document.getElementById("restaurantDetailMeta").textContent = `${restaurant.dishes.length} ${t("dishes")} · ${language === "lt" ? "Pasirink patiekalus ir pridėk juos į krepšelį" : "Choose dishes and add them to your cart"}`;
        const rating = getRatingInfo(restaurant.id);
        document.getElementById("restaurantDetailRating").innerHTML = `<span class="stars">${renderStars(rating.average)}</span><strong>${rating.average.toFixed(1)} / 5</strong><button type="button" data-open-reviews="${restaurant.id}">${t("reviews")} (${rating.count})</button>`;
        renderMenu();
        setView("menu");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function openRestaurantReviews(restaurantId) {
        if (!restaurants.some(item => item.id === restaurantId)) return;
        selectedReviewRestaurant = restaurantId;
        document.getElementById("restaurantReviewsTitle").textContent = `${restaurantName(restaurantId)} · ${t("reviews")}`;
        document.getElementById("restaurantReviewsSubtitle").textContent = language === "lt"
            ? "Įvertinimai ir lankytojų komentarai apie šį restoraną."
            : "Ratings and customer comments about this restaurant.";
        document.getElementById("reviewName").value = profile.name || "";
        document.getElementById("reviewMessage").textContent = "";
        renderRestaurantReviews();
        setView("restaurantReviews");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function renderRestaurantReviews() {
        const list = document.getElementById("reviewList");
        if (!list) return;
        const restaurant = restaurants.find(item => item.id === selectedReviewRestaurant);
        if (!restaurant) return;
        const reviews = getRestaurantReviews(selectedReviewRestaurant);
        const info = getRatingInfo(selectedReviewRestaurant);
        const summary = document.getElementById("restaurantRatingSummary");
        if (summary) summary.textContent = `★ ${info.average.toFixed(1)} / 5 · ${info.count} ${t("reviewCount")}`;
        list.innerHTML = reviews.length ? reviews.map(review => `
            <article class="review-card">
                <div class="review-top">
                    <strong>${escapeHTML(review.name || (language === "lt" ? "Lankytojas" : "Guest"))}</strong>
                    <span class="stars" aria-label="${review.rating} / 5">${renderStars(review.rating)}</span>
                </div>
                <p>„${escapeHTML(language === "en" && review.commentEn ? review.commentEn : review.comment)}“</p>
                <span class="review-author">${escapeHTML(reviewDateLabel(review))}</span>
            </article>`).join("") : `<div class="empty-history">${t("noReviews")}</div>`;
    }

    function renderMenu() {
        const menu = document.getElementById("menu");
        if (!menu) return;
        menu.innerHTML = items.map((item, index) => {
            if (item.restaurantId !== selectedRestaurant) return "";
            const picture = item.image
                ? `<img class="dish-image" src="${escapeHTML(item.image)}" alt="${escapeHTML(dishName(item))}" loading="lazy" decoding="async">`
                : `<span class="dish-image dish-placeholder" role="img" aria-label="${escapeHTML(dishName(item))}">${item.icon || "🍽️"}</span>`;
            return `<article class="row">
                <span class="dish-name">${escapeHTML(dishName(item))}</span>
                <span class="price">${formatMoney(item.price)}</span>
                <button type="button" class="add-dish-button" data-add-item="${index}" aria-label="${t("add")} ${escapeHTML(dishName(item))}">${t("add")}</button>
                ${picture}
            </article>`;
        }).join("");
    }

    document.getElementById("restaurantList")?.addEventListener("click", event => {
        const menuButton = event.target.closest("[data-open-restaurant]");
        const reviewsButton = event.target.closest("[data-open-reviews]");
        if (menuButton) openRestaurant(menuButton.dataset.openRestaurant);
        else if (reviewsButton) openRestaurantReviews(reviewsButton.dataset.openReviews);
    });
    document.getElementById("restaurantDetailRating")?.addEventListener("click", event => {
        const button = event.target.closest("[data-open-reviews]");
        if (button) openRestaurantReviews(button.dataset.openReviews);
    });
    document.getElementById("menu")?.addEventListener("click", event => {
        const button = event.target.closest("[data-add-item]");
        if (button) add(Number(button.dataset.addItem));
    });
    document.getElementById("restaurantBackButton")?.addEventListener("click", () => setView("restaurants"));
    document.getElementById("reviewsBackButton")?.addEventListener("click", () => setView("restaurants"));

    // Naršymas tarp pagrindinio katalogo, profilio, restorano atsiliepimų ir lygių.
    function setView(viewName) {
        const views = {
            restaurants: "restaurantsView", menu: "menuView", restaurantReviews: "restaurantReviewsView",
            profile: "profileView", level: "levelView"
        };
        if (!Object.prototype.hasOwnProperty.call(views, viewName)) return;
        Object.entries(views).forEach(([name, id]) => {
            const view = document.getElementById(id);
            if (view) view.hidden = name !== viewName;
        });
        const hero = document.querySelector(".hero");
        if (hero) hero.hidden = viewName !== "restaurants";
        if (viewName === "restaurants") renderRestaurants();
        if (viewName === "menu") renderMenu();
        if (viewName === "restaurantReviews") renderRestaurantReviews();
        if (viewName === "profile") renderProfile();
        if (viewName === "level") renderLevelCenter();
    }

    function goHome() {
        const delivery = document.getElementById("deliveryOverlay");
        if (delivery && !delivery.hidden) {
            closeDelivery();
            return;
        }
        if (!document.getElementById("cartOverlay").hidden) closeCart();
        hideLevelUp();
        closeAccountMenu();
        setView("restaurants");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.getElementById("homeButton")?.addEventListener("click", goHome);
    document.querySelectorAll("[data-home-button]").forEach(button => button.addEventListener("click", goHome));
    document.getElementById("profileBackButton")?.addEventListener("click", () => setView("restaurants"));
    document.getElementById("levelButton")?.addEventListener("click", () => setView("level"));
    document.getElementById("levelBackButton")?.addEventListener("click", () => setView("restaurants"));

    // Paskyros išskleidžiamas meniu prie B avataro.
    const accountMenu = document.getElementById("accountMenu");
    function openAccountMenu() {
        if (!accountMenu) return;
        accountMenu.hidden = false;
        document.getElementById("profileButton").setAttribute("aria-expanded", "true");
    }
    function closeAccountMenu() {
        if (!accountMenu) return;
        accountMenu.hidden = true;
        document.getElementById("profileButton").setAttribute("aria-expanded", "false");
    }
    document.getElementById("profileButton")?.addEventListener("click", event => {
        event.stopPropagation();
        if (accountMenu.hidden) openAccountMenu(); else closeAccountMenu();
    });
    accountMenu?.addEventListener("click", event => event.stopPropagation());
    document.addEventListener("click", event => {
        if (!event.target.closest(".account-menu-wrap")) closeAccountMenu();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && accountMenu && !accountMenu.hidden) closeAccountMenu();
    });
    document.getElementById("accountProfileButton")?.addEventListener("click", () => {
        closeAccountMenu();
        setView("profile");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.getElementById("accountLogoutButton")?.addEventListener("click", () => {
        closeAccountMenu();
        setView("restaurants");
        showToast(t("logoutNotice"));
    });
    document.getElementById("languageSelect")?.addEventListener("change", event => {
        language = event.target.value === "en" ? "en" : "lt";
        localStorage.setItem(STORAGE_KEYS.language, language);
        applyLanguage();
    });

    // Atsiliepimo įrašymas pagal konkretaus restorano ID.
    document.getElementById("reviewForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const form = event.currentTarget;
        const name = form.elements.namedItem("name").value.trim();
        const rating = Number(form.elements.namedItem("rating").value);
        const comment = form.elements.namedItem("comment").value.trim();
        const message = document.getElementById("reviewMessage");
        if (!name || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            message.textContent = t("reviewValidation");
            return;
        }
        userReviews.unshift({
            id: `user-${Date.now()}`, restaurantId: selectedReviewRestaurant,
            name: name.slice(0, 40), rating, comment: comment.slice(0, 500),
            createdAt: new Date().toISOString(), dateLabel: language === "lt" ? "Ką tik · šiame įrenginyje" : "Just now · on this device"
        });
        writeStoredValue(STORAGE_KEYS.reviews, userReviews);
        renderRestaurantReviews();
        renderRestaurants();
        if (selectedRestaurant === selectedReviewRestaurant) {
            const info = getRatingInfo(selectedRestaurant);
            document.getElementById("restaurantDetailRating").innerHTML = `<span class="stars">${renderStars(info.average)}</span><strong>${info.average.toFixed(1)} / 5</strong><button type="button" data-open-reviews="${selectedRestaurant}">${t("reviews")} (${info.count})</button>`;
        }
        form.elements.namedItem("comment").value = "";
        form.elements.namedItem("rating").value = "5";
        message.textContent = t("reviewAdded");
    });

    // Krepšelis: atkuriamas pagal produktų pavadinimus, kad išliktų suderinamas su meniu.
    function restoreCart() {
        const stored = readStoredValue(STORAGE_KEYS.cart, []);
        if (!Array.isArray(stored)) return [];
        return stored.map(savedItem => {
            const currentItem = items.find(item => item.name === (typeof savedItem === "string" ? savedItem : savedItem?.name));
            return currentItem ? { ...currentItem } : null;
        }).filter(Boolean);
    }
    let cart = restoreCart();
    let orderHistory = readStoredValue(STORAGE_KEYS.history, []);
    if (!Array.isArray(orderHistory)) orderHistory = [];
    let xp = Number(readStoredValue(STORAGE_KEYS.xp, 0));
    if (!Number.isFinite(xp) || xp < 0) xp = 0;
    let balance = Number(localStorage.getItem(STORAGE_KEYS.balance) || 0);
    if (!Number.isFinite(balance) || balance < 0) balance = 0;
    let claimedLevels = readStoredValue(STORAGE_KEYS.claimedLevels, null);
    if (!Array.isArray(claimedLevels)) claimedLevels = [];
    let levelUpTimer = null;

    function saveCart() {
        return writeStoredValue(STORAGE_KEYS.cart, cart.map(item => ({ name: item.name })));
    }
    function saveHistory() {
        writeStoredValue(STORAGE_KEYS.history, orderHistory);
    }
    function saveXP() {
        writeStoredValue(STORAGE_KEYS.xp, xp);
        const status = document.getElementById("xpSaveStatus");
        if (status) status.textContent = t("savedOnDevice");
    }
    function saveBalance() {
        const rounded = Math.round(balance * 100) / 100;
        balance = Math.max(0, rounded);
        localStorage.setItem(STORAGE_KEYS.balance, String(balance));
        renderBalance();
    }
    function renderBalance() {
        const text = formatMoney(balance);
        const header = document.getElementById("boomfood-balansas");
        const profileBalance = document.getElementById("profileBalance");
        const rewardBalance = document.getElementById("rewardBalance");
        if (header) header.textContent = text;
        if (profileBalance) profileBalance.textContent = text;
        if (rewardBalance) rewardBalance.textContent = text;
    }

    function getGroupedCart() {
        const grouped = new Map();
        cart.forEach(item => {
            if (!grouped.has(item.name)) grouped.set(item.name, { ...item, quantity: 0 });
            grouped.get(item.name).quantity += 1;
        });
        return [...grouped.values()];
    }

    function renderCart() {
        const grouped = getGroupedCart();
        const totalQuantity = cart.length;
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const count = document.getElementById("cartCount");
        count.textContent = totalQuantity > 99 ? "99+" : String(totalQuantity);
        count.hidden = totalQuantity === 0;
        document.getElementById("cartItems").innerHTML = grouped.length ? grouped.map(item => `
            <article class="cart-line">
                <div>
                    <p class="cart-line-name">${escapeHTML(dishName(item))} <span aria-label="${language === "lt" ? "Kiekis" : "Quantity"}">×${item.quantity}</span></p>
                    <p class="cart-line-meta">${formatMoney(item.price)} / ${t("perItem")}</p>
                </div>
                <div class="cart-line-right">
                    <strong class="cart-line-total">${formatMoney(item.price * item.quantity)}</strong>
                    <div class="cart-line-actions">
                        <button class="cart-qty-button" type="button" data-cart-action="decrease" data-item="${escapeHTML(item.name)}" aria-label="${t("decrease")} ${escapeHTML(dishName(item))}">−</button>
                        <span class="cart-qty-value">${item.quantity}</span>
                        <button class="cart-qty-button" type="button" data-cart-action="increase" data-item="${escapeHTML(item.name)}" aria-label="${t("increase")} ${escapeHTML(dishName(item))}">+</button>
                        <button class="cart-remove" type="button" data-cart-action="remove" data-item="${escapeHTML(item.name)}">${t("remove")}</button>
                    </div>
                </div>
            </article>`).join("") : `<div class="cart-empty"><span class="cart-empty-icon" aria-hidden="true">🛒</span>${t("cartEmpty")}<br>${t("chooseDishes")}</div>`;
        document.getElementById("cartTotal").textContent = formatMoney(total);
        document.getElementById("order").disabled = totalQuantity === 0;
        saveCart();
        renderBalance();
    }

    function add(index) {
        if (!items[index]) return;
        cart.push({ ...items[index] });
        renderCart();
    }
    window.add = add; // suderinamumas su senais nuorodiniais meniu veiksmais.

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
    document.getElementById("cartButton")?.addEventListener("click", openCart);
    document.getElementById("cartClose")?.addEventListener("click", closeCart);
    document.getElementById("cartOverlay")?.addEventListener("click", event => {
        if (event.target.id === "cartOverlay") closeCart();
    });
    document.getElementById("cartItems")?.addEventListener("click", event => {
        const button = event.target.closest("button[data-cart-action]");
        if (!button) return;
        const action = button.dataset.cartAction;
        const name = button.dataset.item;
        const index = cart.findIndex(item => item.name === name);
        if (index < 0) return;
        if (action === "increase") {
            const item = items.find(product => product.name === name);
            if (item) cart.push({ ...item });
        } else if (action === "decrease") {
            cart.splice(index, 1);
        } else if (action === "remove") {
            cart = cart.filter(item => item.name !== name);
        }
        renderCart();
    });

    function syncOverlayState() {
        const isOpen = !document.getElementById("cartOverlay").hidden || !document.getElementById("deliveryOverlay").hidden;
        document.body.classList.toggle("overlay-open", isOpen);
        document.querySelector(".site-header").inert = isOpen;
        document.querySelector("main").inert = isOpen;
    }

    // Užsakymų istorija rodoma profilyje; kiekvienas įrašas turi išplečiamą detalių dalį.
    function renderHistory() {
        const list = document.getElementById("historyList");
        const count = document.getElementById("historyCount");
        if (!list || !count) return;
        const totalOrders = orderHistory.length;
        count.textContent = `${totalOrders} ${language === "lt" ? (totalOrders === 1 ? "užsakymas" : "užsakymų") : t("orders")}`;
        if (!totalOrders) {
            list.innerHTML = `<div class="empty-history">${t("noOrders")}</div>`;
            return;
        }
        list.innerHTML = orderHistory.map(order => {
            const dateLabel = formatDate(order.createdAt);
            const orderItems = Array.isArray(order.items) ? order.items : [];
            const totalItems = orderItems.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0);
            const status = translatedStep(statusIndex(order.status));
            const detailLines = orderItems.map(item => {
                const quantity = Math.max(1, Number(item.quantity) || 1);
                const inferred = items.find(product => product.name === item.name);
                const orderRestaurantId = item.restaurantId || inferred?.restaurantId;
                const restaurant = orderRestaurantId ? restaurantName(orderRestaurantId) : (item.restaurant || "");
                return `<div class="order-detail-line">
                    <div><strong>${escapeHTML(dishName(item))}</strong><small>${escapeHTML(restaurant)}</small></div>
                    <span>×${quantity}</span>
                    <strong>${formatMoney((Number(item.price) || 0) * quantity)}</strong>
                </div>`;
            }).join("");
            return `
                <article class="history-card">
                    <div class="history-top">
                        <div><div class="history-id">${t("orderNumber")} #${escapeHTML(order.id)}</div><div class="history-date">${escapeHTML(dateLabel)}</div></div>
                        <span class="history-status">${escapeHTML(status)}</span>
                    </div>
                    <div class="history-bottom history-summary-line"><span>${totalItems} ${t("items")}</span><strong class="history-total">${formatMoney(Number(order.total) || 0)}</strong></div>
                    <details class="order-detail-expand">
                        <summary>${t("orderDetails")}</summary>
                        <div class="order-detail-content">
                            ${detailLines}
                            <div class="order-detail-total"><span>${t("total")}</span><strong>${formatMoney(Number(order.total) || 0)}</strong></div>
                            <div class="order-detail-meta"><span>${t("status")}</span><strong>${escapeHTML(status)}</strong><span>${escapeHTML(dateLabel)}</span></div>
                        </div>
                    </details>
                </article>`;
        }).join("");
    }

    function renderProfile() {
        document.getElementById("profileDisplayName").textContent = profile.name || DEFAULT_PROFILE.name;
        document.getElementById("profileNameInput").value = profile.name || DEFAULT_PROFILE.name;
        document.getElementById("profileLevelLabel").textContent = `${getCurrentLevel()} ${t("level").toLocaleLowerCase(language === "lt" ? "lt-LT" : "en-US")}`;
        renderProfileAvatar();
        renderBalance();
        renderNameCooldown();
        renderHistory();
        applyTheme();
    }

    function renderProfileAvatar() {
        const headerAvatar = document.getElementById("headerAvatar");
        const profileAvatar = document.getElementById("profileAvatarPreview");
        [headerAvatar, profileAvatar].forEach(element => {
            if (!element) return;
            element.replaceChildren();
            if (profile.picture && /^data:image\/(png|jpeg|webp|gif);base64,/i.test(profile.picture)) {
                const image = document.createElement("img");
                image.src = profile.picture;
                image.alt = language === "lt" ? "Profilio nuotrauka" : "Profile picture";
                element.appendChild(image);
            } else {
                element.textContent = (profile.name || "B").trim().charAt(0).toLocaleUpperCase(language === "lt" ? "lt-LT" : "en-US") || "B";
            }
        });
    }

    function formatRemaining(ms) {
        const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    function isNameChangeAvailable() {
        return !profile.nameLastChangedAt || Date.now() >= Number(profile.nameLastChangedAt) + NAME_COOLDOWN_MS;
    }
    function renderNameCooldown() {
        const status = document.getElementById("nameCooldownStatus");
        const saveButton = document.getElementById("saveProfileName");
        const input = document.getElementById("profileNameInput");
        if (!status || !saveButton || !input) return;
        const available = isNameChangeAvailable();
        const sameName = input.value.trim() === (profile.name || DEFAULT_PROFILE.name);
        saveButton.disabled = !available || sameName;
        status.textContent = available ? t("nameAvailable") : t("nameCooldown", {
            time: formatRemaining(Number(profile.nameLastChangedAt) + NAME_COOLDOWN_MS - Date.now())
        });
    }

    document.getElementById("profileNameInput")?.addEventListener("input", renderNameCooldown);
    document.getElementById("profileNameForm")?.addEventListener("submit", event => {
        event.preventDefault();
        const input = document.getElementById("profileNameInput");
        const nextName = input.value.trim();
        if (nextName.length < 2 || nextName.length > 30) {
            showToast(t("nameInvalid"));
            return;
        }
        if (nextName === profile.name) {
            showToast(t("nameSame"));
            return;
        }
        if (!isNameChangeAvailable()) {
            renderNameCooldown();
            return;
        }
        profile.name = nextName;
        profile.nameLastChangedAt = Date.now();
        writeStoredValue(STORAGE_KEYS.profile, profile);
        renderProfile();
        showToast(t("nameSaved"));
    });
    setInterval(renderNameCooldown, 1000);

    document.getElementById("avatarUpload")?.addEventListener("change", event => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            showToast(t("photoInvalid"));
            event.target.value = "";
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            showToast(t("photoTooLarge"));
            event.target.value = "";
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            try {
                const side = Math.min(image.naturalWidth, image.naturalHeight);
                const sx = (image.naturalWidth - side) / 2;
                const sy = (image.naturalHeight - side) / 2;
                const canvas = document.createElement("canvas");
                canvas.width = 512;
                canvas.height = 512;
                const context = canvas.getContext("2d");
                context.drawImage(image, sx, sy, side, side, 0, 0, 512, 512);
                profile.picture = canvas.toDataURL("image/jpeg", 0.84);
                writeStoredValue(STORAGE_KEYS.profile, profile);
                renderProfileAvatar();
                showToast(t("photoSaved"));
            } catch (error) {
                console.warn("Nepavyko apdoroti profilio nuotraukos:", error);
                showToast(t("photoError"));
            } finally {
                URL.revokeObjectURL(objectUrl);
                event.target.value = "";
            }
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            event.target.value = "";
            showToast(t("photoError"));
        };
        image.src = objectUrl;
    });

    // Profilio nustatymai.
    document.getElementById("favoritesButton")?.addEventListener("click", () => showToast(t("favoritesNotice")));
    document.getElementById("settingsButton")?.addEventListener("click", () => {
        const panel = document.getElementById("settingsPanel");
        const button = document.getElementById("settingsButton");
        panel.hidden = !panel.hidden;
        button.setAttribute("aria-expanded", String(!panel.hidden));
    });
    document.querySelectorAll("[data-theme-choice]").forEach(button => button.addEventListener("click", () => {
        theme = button.dataset.themeChoice === "dark" ? "dark" : "light";
        applyTheme();
    }));
    document.getElementById("deleteAccountButton")?.addEventListener("click", () => {
        if (!window.confirm(t("deleteConfirm"))) return;
        [STORAGE_KEYS.cart, STORAGE_KEYS.history, STORAGE_KEYS.xp, STORAGE_KEYS.reviews,
            STORAGE_KEYS.profile, STORAGE_KEYS.balance, STORAGE_KEYS.claimedLevels].forEach(key => localStorage.removeItem(key));
        cart = [];
        orderHistory = [];
        userReviews = [];
        xp = 0;
        balance = 0;
        claimedLevels = [];
        profile = { ...DEFAULT_PROFILE };
        saveCart();
        saveHistory();
        saveXP();
        saveBalance();
        writeStoredValue(STORAGE_KEYS.profile, profile);
        renderProfile();
        renderRestaurants();
        renderRestaurantReviews();
        renderCart();
        renderLevelCenter();
        showToast(t("accountDeleted"));
    });

    // Lygių sistema ir tikras balanso papildymas (šiame demo – localStorage).
    function getCurrentLevel() {
        return Math.floor(xp / 100) + 1;
    }
    function getLevelReward(level) {
        if (level % 5 === 0) return 25 + (Math.floor(level / 5) - 1) * 25;
        const regularRewards = [4, 7, 9, 6, 11, 8, 13, 10, 15, 7, 12];
        return regularRewards[(level - 2) % regularRewards.length];
    }
    function grantLevelRewards(previousLevel, newLevel) {
        let earnedAmount = 0;
        for (let level = Math.max(2, previousLevel + 1); level <= newLevel; level++) {
            if (claimedLevels.includes(level)) continue;
            earnedAmount += getLevelReward(level);
            claimedLevels.push(level);
        }
        if (earnedAmount > 0) {
            writeStoredValue(STORAGE_KEYS.claimedLevels, claimedLevels);
            balance = Math.round((balance + earnedAmount) * 100) / 100;
            saveBalance();
        }
        return earnedAmount;
    }

    // Vienkartinė migracija: esamus XP lygius atžymime kaip apdovanotus ir pridedame jų rewardus.
    // Tai apsaugo nuo pakartotinio atlygio skyrimo po atnaujinimo.
    if (localStorage.getItem(STORAGE_KEYS.claimedLevels) === null) {
        const migratedReward = grantLevelRewards(1, getCurrentLevel());
        writeStoredValue(STORAGE_KEYS.claimedLevels, claimedLevels);
        if (migratedReward > 0) console.info(`Pradinis lygių rewardų migravimas: +${migratedReward} €`);
    }

    function renderLevelUI() {
        const level = getCurrentLevel();
        const progressXP = xp % 100;
        document.getElementById("lvl").textContent = level;
        document.getElementById("xp").textContent = progressXP;
        document.getElementById("xpfill").style.width = `${progressXP}%`;
        const big = document.getElementById("levelBig");
        if (big) big.textContent = level;
        const progressText = document.getElementById("levelProgressText");
        if (progressText) progressText.textContent = `${progressXP} / 100 XP`;
        const progressFill = document.getElementById("levelProgressFill");
        if (progressFill) progressFill.style.width = `${progressXP}%`;
        const progressBar = document.getElementById("levelProgressBar");
        if (progressBar) progressBar.setAttribute("aria-valuenow", String(progressXP));
        const nextText = document.getElementById("levelNextText");
        if (nextText) nextText.textContent = t("nextLevel", { xp: 100 - progressXP, level: level + 1 });
        const total = document.getElementById("totalXP");
        if (total) total.textContent = `${xp.toLocaleString(language === "lt" ? "lt-LT" : "en-GB")} XP`;
        const milestones = document.getElementById("milestoneCount");
        if (milestones) milestones.textContent = Math.floor(level / 5);
        renderBalance();
    }

    function renderLevelCenter() {
        renderLevelUI();
        const currentLevel = getCurrentLevel();
        const firstLevel = Math.max(2, currentLevel - 2);
        const lastLevel = Math.max(10, currentLevel + 7);
        const rewardCards = [];
        for (let level = firstLevel; level <= lastLevel; level++) {
            const milestone = level % 5 === 0;
            const earned = claimedLevels.includes(level);
            const amount = getLevelReward(level);
            rewardCards.push(`
                <article class="reward-card ${earned ? "earned" : "locked"} ${milestone ? "milestone" : ""}">
                    <div class="reward-card-icon" aria-hidden="true">${milestone ? "🏆" : "🎁"}</div>
                    <div class="reward-card-info">
                        <span class="reward-level">${language === "lt" ? "LYGIS" : "LEVEL"} ${level}${milestone ? " · MILESTONE" : ""}</span>
                        <strong>${milestone ? t("milestoneReward") : t("levelReward")}</strong>
                        <small>${earned ? t("rewardUnlocked") : t("reachLevel")}</small>
                    </div>
                    <div class="reward-card-amount"><strong>${formatReward(amount)}</strong><span>${earned ? t("received") : t("locked")}</span></div>
                </article>`);
        }
        document.getElementById("rewardList").innerHTML = rewardCards.join("");
    }

    function hideLevelUp() {
        const overlay = document.getElementById("levelUpOverlay");
        if (!overlay) return;
        overlay.classList.remove("visible");
        const wasVisible = !overlay.hidden;
        overlay.hidden = true;
        if (wasVisible && !document.getElementById("deliveryOverlay").hidden) document.getElementById("deliveryTitle").focus();
        if (levelUpTimer) {
            clearTimeout(levelUpTimer);
            levelUpTimer = null;
        }
    }
    function showLevelUp(level, earnedAmount, levelsGained) {
        const overlay = document.getElementById("levelUpOverlay");
        document.getElementById("levelUpNumber").textContent = level;
        document.getElementById("levelUpReward").textContent = levelsGained > 1
            ? t("levelUpMultiple", { levels: levelsGained, amount: formatReward(earnedAmount) })
            : t("levelUpSingle", { amount: formatReward(earnedAmount) });
        overlay.hidden = false;
        requestAnimationFrame(() => {
            overlay.classList.add("visible");
            document.getElementById("levelUpClose").focus();
        });
        if (levelUpTimer) clearTimeout(levelUpTimer);
        levelUpTimer = setTimeout(hideLevelUp, 4200);
    }
    function addXP(amountInput) {
        const amount = Math.max(0, Math.floor(Number(amountInput) || 0));
        if (!amount) return;
        const previousLevel = getCurrentLevel();
        xp += amount;
        const newLevel = getCurrentLevel();
        saveXP();
        const earnedAmount = grantLevelRewards(previousLevel, newLevel);
        renderLevelUI();
        if (newLevel > previousLevel) {
            renderLevelCenter();
            showLevelUp(newLevel, earnedAmount, newLevel - previousLevel);
        }
        if (!document.getElementById("profileView").hidden) renderProfile();
    }
    saveXP();
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            saveCart(); saveXP(); saveBalance();
        }
    });
    window.addEventListener("pagehide", () => { saveCart(); saveXP(); saveBalance(); });
    window.addEventListener("beforeunload", () => { saveCart(); saveXP(); saveBalance(); });

    // Užsakymo pateikimas ir pristatymo simuliacija.
    const stepDescriptions = ["Tavo užsakymas perduotas virtuvei.", "Virtuvė jau ruošia tavo patiekalus.", "Kurjeris paėmė užsakymą ir jau pakeliui.", "Užsakymas pristatytas. Skanaus!"];
    let displayedOrder = null;
    function showStep(index) {
        document.getElementById("steps").innerHTML = stepNames.map((step, itemIndex) =>
            `<li class="${itemIndex <= index ? "done" : ""} ${itemIndex === index ? "now" : ""}"${itemIndex === index ? ' aria-current="step"' : ""}>${translatedStep(itemIndex)}</li>`
        ).join("");
        if (index < 0) return;
        document.getElementById("deliveryTitle").textContent = translatedStep(index);
        document.getElementById("deliverySubtitle").textContent = translatedStepDescription(index);
        document.querySelector(".delivery-symbol").classList.toggle("is-delivered", index === 3);
        document.getElementById("deliveryFinish").hidden = index !== 3;
    }
    function updateDeliveryLanguage() {
        if (displayedOrder) {
            const index = statusIndex(displayedOrder.status);
            if (!document.getElementById("deliveryOverlay").hidden) showStep(index);
        }
        const back = document.getElementById("deliveryBack");
        if (back) back.textContent = t("backToMenu");
        const finish = document.getElementById("deliveryFinish");
        if (finish) finish.textContent = t("finish");
        const orderProgress = document.getElementById("steps-title");
        if (orderProgress) orderProgress.textContent = t("orderProgress");
        const amount = document.querySelector(".delivery-total span");
        if (amount) amount.textContent = t("orderAmount");
        const levelUpTitle = document.querySelector(".level-up-card h2");
        if (levelUpTitle) levelUpTitle.textContent = t("levelUpTitle");
        const levelUpClose = document.getElementById("levelUpClose");
        if (levelUpClose) levelUpClose.textContent = t("great");
    }
    showStep(-1);

    document.getElementById("order")?.addEventListener("click", () => {
        if (!cart.length) return;
        const count = cart.length;
        const groupedItems = getGroupedCart().map(({ name, price, quantity, restaurant, restaurantId }) => ({
            name, price, quantity, restaurant, restaurantId
        }));
        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const order = {
            id: Date.now(), createdAt: new Date().toISOString(), items: groupedItems,
            total, status: stepNames[0]
        };
        orderHistory.unshift(order);
        saveHistory();
        renderHistory();
        cart = [];
        renderCart();
        document.getElementById("cartOverlay").hidden = true;
        document.getElementById("cartButton").setAttribute("aria-expanded", "false");
        displayedOrder = order;
        document.getElementById("deliveryNumber").textContent = `${t("orderNumber")} #${order.id}`;
        document.getElementById("deliveryTotal").textContent = formatMoney(order.total);
        showStep(0);
        document.getElementById("deliveryOverlay").hidden = false;
        syncOverlayState();
        document.getElementById("deliveryTitle").focus();
        addXP(10 + count * 5);
        stepNames.forEach((step, index) => setTimeout(() => {
            if (displayedOrder === order) showStep(index);
            order.status = step;
            saveHistory();
            renderHistory();
            if (index === 3) addXP(20);
        }, index * 4000));
    });

    function closeDelivery() {
        document.getElementById("deliveryOverlay").hidden = true;
        hideLevelUp();
        setView("menu");
        syncOverlayState();
        document.getElementById("menu-title").focus({ preventScroll: true });
    }
    document.getElementById("deliveryBack")?.addEventListener("click", closeDelivery);
    document.getElementById("deliveryFinish")?.addEventListener("click", closeDelivery);
    document.getElementById("levelUpClose")?.addEventListener("click", hideLevelUp);

    document.addEventListener("keydown", event => {
        const overlay = ["levelUpOverlay", "deliveryOverlay", "cartOverlay"]
            .map(id => document.getElementById(id)).find(element => element && !element.hidden);
        if (!overlay) return;
        if (event.key === "Escape") {
            event.preventDefault();
            if (overlay.id === "levelUpOverlay") hideLevelUp();
            else if (overlay.id === "deliveryOverlay") closeDelivery();
            else closeCart();
            return;
        }
        if (event.key !== "Tab") return;
        const buttons = [...overlay.querySelectorAll("button:not(:disabled)")].filter(button => button.getClientRects().length);
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        const current = document.activeElement;
        if (event.shiftKey && (current === first || !buttons.includes(current))) {
            event.preventDefault(); last?.focus();
        } else if (!event.shiftKey && (current === last || !buttons.includes(current))) {
            event.preventDefault(); first?.focus();
        }
    });

    // Pagrindinis paleidimas.
    function renderAll() {
        renderRestaurants();
        renderMenu();
        renderRestaurantReviews();
        renderCart();
        renderHistory();
        renderLevelUI();
        renderProfileAvatar();
        renderBalance();
    }

    applyTheme();
    applyLanguage();
    renderAll();
    setView("restaurants");
})();
