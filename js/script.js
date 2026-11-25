// BoomFood – esama naršyklės logika.

            // Bendras programos būsenos valdymas. Duomenys saugomi šiame įrenginyje,
            // kol projektas neturi serverio / bendros duomenų bazės.
            const STORAGE_KEYS = {
                cart: "boomfood.cart.v1",
                history: "boomfood.orderHistory.v1",
                xp: "boomfood.xp.v1",
                reviews: "boomfood.reviews.v1"
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
            let levelUpTimer = null;

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
                count.textContent = `${totalOrders} ${totalOrders === 1 ? "užsakymas" : "užsakymų"}`;
                if (!totalOrders) {
                    list.innerHTML = '<div class="empty-history">Kol kas užsakymų nėra. Pasirink patiekalų meniu ir pateik pirmą demonstracinį užsakymą.</div>';
                    return;
                }

                list.innerHTML = orderHistory.map(order => {
                    const parsedDate = new Date(order.createdAt);
                    const dateLabel = Number.isNaN(parsedDate.getTime())
                        ? "Data nenurodyta"
                        : new Intl.DateTimeFormat("lt-LT", { dateStyle: "medium", timeStyle: "short" }).format(parsedDate);
                    const lines = Array.isArray(order.items) ? order.items.map(item => {
                        const quantity = Math.max(1, Number(item.quantity) || 1);
                        return `<li>${escapeHTML(item.name)} ×${quantity}</li>`;
                    }).join("") : "";
                    return `
                        <article class="history-card">
                            <div class="history-top">
                                <div><div class="history-id">Užsakymas #${escapeHTML(order.id)}</div><div class="history-date">${escapeHTML(dateLabel)}</div></div>
                                <span class="history-status">${escapeHTML(order.status || stepNames[0])}</span>
                            </div>
                            <ul class="history-items">${lines}</ul>
                            <div class="history-bottom"><span class="history-date">${Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + Math.max(1, Number(item.quantity) || 1), 0) : 0} prek.</span><strong class="history-total">${formatMoney(Number(order.total) || 0)}</strong></div>
                        </article>`;
                }).join("");
            }

            function setTab(viewName) {
                const views = {
                    menu: "menuView",
                    restaurants: "restaurantsView",
                    history: "historyView",
                    reviews: "reviewsView",
                    profile: "profileView",
                    level: "levelView"
                };
                if (!Object.prototype.hasOwnProperty.call(views, viewName)) return;

                Object.entries(views).forEach(([name, id]) => {
                    const view = document.getElementById(id);
                    if (view) view.hidden = name !== viewName;
                });

                const hero = document.querySelector(".hero");
                const tabs = document.querySelector(".tabs");
                if (hero) hero.hidden = viewName !== "restaurants";
                // Restorano meniu yra atskiras ekranas su mygtuku grįžti į katalogą.
                if (tabs) tabs.hidden = viewName === "profile" || viewName === "level" || viewName === "menu";

                document.querySelectorAll(".tab[data-tab]").forEach(button => {
                    button.setAttribute("aria-selected", String(button.dataset.tab === viewName));
                });

                if (viewName === "history") renderHistory();
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
                setTab("restaurants");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }

            // 1. Prekės (čia galima pridėti daugiau)
            // 1. Restoranai ir patiekalai (kiekvienas po 5)
            const IMG = {
                cepelinai: "images/cepelinai.webp"
            };

            const restaurants = [
                {
                    id: "lt", name: "Lietuviška Virtuvė", icon: "🥟",
                    dishes: [
                        { name: "Cepelinai su mėsa", price: 7.9, image: IMG.cepelinai },
                        { name: "Šaltibarščiai", price: 4.8, icon: "🩷" },
                        { name: "Bulvių kugelis", price: 6.5, icon: "🥔" },
                        { name: "Kibinai (3 vnt.)", price: 5.9, icon: "🥟" },
                        { name: "Bulviniai blynai", price: 6.2, icon: "🥞" }
                    ]
                },
                {
                    id: "pizza", name: "Pizza Corner", icon: "🍕",
                    dishes: [
                        { name: "Pica Margarita", price: 9.5, icon: "🍕" },
                        { name: "Pica Pepperoni", price: 10.9, icon: "🍕" },
                        { name: "Pica Keturi sūriai", price: 11.5, icon: "🧀" },
                        { name: "Pica Hawaii", price: 10.5, icon: "🍍" },
                        { name: "Calzone", price: 9.9, icon: "🥟" }
                    ]
                },
                {
                    id: "burger", name: "Burger House", icon: "🍔",
                    dishes: [
                        { name: "Klasikinis burgeris", price: 7.5, icon: "🍔" },
                        { name: "Sūrio burgeris", price: 8.2, icon: "🧀" },
                        { name: "Bekono burgeris", price: 8.9, icon: "🥓" },
                        { name: "Vištienos burgeris", price: 7.9, icon: "🍗" },
                        { name: "Veggie burgeris", price: 7.8, icon: "🥬" }
                    ]
                },
                {
                    id: "sushi", name: "Sushi Point", icon: "🍣",
                    dishes: [
                        { name: "Suši rinkinys", price: 12.9, icon: "🍣" },
                        { name: "Kalifornijos ritiniai", price: 9.9, icon: "🍙" },
                        { name: "Lašišos nigiri (4 vnt.)", price: 8.5, icon: "🍣" },
                        { name: "Miso sriuba", price: 3.9, icon: "🍜" },
                        { name: "Edamame", price: 4.2, icon: "🫛" }
                    ]
                },
                {
                    id: "green", name: "Green Bite", icon: "🥗",
                    dishes: [
                        { name: "Cezario salotos", price: 7.2, icon: "🥗" },
                        { name: "Veganiškas bowl", price: 8.9, icon: "🥙" },
                        { name: "Humusas su daržovėmis", price: 5.5, icon: "🥕" },
                        { name: "Žaliasis smoothie", price: 4.5, icon: "🥤" },
                        { name: "Veganiškas wrap", price: 6.9, icon: "🌯" }
                    ]
                }
            ];

            // Bendras masyvas krepšeliui. Kiekvieno patiekalo pavadinimas unikalus.
            const items = restaurants.flatMap(r =>
                r.dishes.map(d => ({ ...d, restaurant: r.name, restaurantId: r.id }))
            );

            let selectedRestaurant = restaurants[0].id;

            // 2. Slenkamas restoranų katalogas ir atskiro restorano meniu.
            const restaurantCategories = {
                lt: "Lietuviška virtuvė",
                pizza: "Picos ir itališki skoniai",
                burger: "Mėsainiai",
                sushi: "Sušiai ir azijietiški patiekalai",
                green: "Salotos ir sveikesni pasirinkimai"
            };

            function renderRestaurants() {
                const list = document.getElementById("restaurantList");
                const count = document.getElementById("restaurantsCount");
                if (!list) return;
                if (count) count.textContent = `${restaurants.length} restoranai`;
                list.innerHTML = restaurants.map(restaurant => `
                    <button class="restaurant-card" type="button" data-open-restaurant="${escapeHTML(restaurant.id)}" aria-label="Atidaryti ${escapeHTML(restaurant.name)} meniu">
                        <span class="restaurant-card-art" aria-hidden="true"><span>${restaurant.icon}</span></span>
                        <span class="restaurant-card-content">
                            <span class="restaurant-card-category">${escapeHTML(restaurantCategories[restaurant.id] || "Restoranas")}</span>
                            <strong class="restaurant-card-name">${escapeHTML(restaurant.name)}</strong>
                            <span class="restaurant-card-meta">${restaurant.dishes.length} patiekalai <span aria-hidden="true">·</span> Demonstracinis meniu</span>
                            <span class="restaurant-card-link">Peržiūrėti meniu <span aria-hidden="true">→</span></span>
                        </span>
                    </button>`).join("");
            }

            function openRestaurant(restaurantId) {
                const restaurant = restaurants.find(item => item.id === restaurantId);
                if (!restaurant) return;
                selectedRestaurant = restaurant.id;
                document.getElementById("restaurantDetailIcon").textContent = restaurant.icon;
                document.getElementById("restaurantDetailCategory").textContent = restaurantCategories[restaurant.id] || "RESTORANAS";
                document.getElementById("menu-title").textContent = restaurant.name;
                document.getElementById("restaurantDetailMeta").textContent = `${restaurant.dishes.length} patiekalai · Pasirink patiekalus ir pridėk juos į krepšelį`;
                renderMenu();
                setTab("menu");
                window.scrollTo({ top: 0, behavior: "smooth" });
            }

            document.getElementById("restaurantList")?.addEventListener("click", event => {
                const card = event.target.closest("button[data-open-restaurant]");
                if (card) openRestaurant(card.dataset.openRestaurant);
            });
            document.getElementById("restaurantBackButton")?.addEventListener("click", () => {
                setTab("restaurants");
                window.scrollTo({ top: 0, behavior: "smooth" });
            });

            function renderMenu() {
                document.getElementById("menu").innerHTML = items.map((it, i) => {
                    if (it.restaurantId !== selectedRestaurant) return "";
                    const picture = it.image
                        ? `<img class="dish-image" src="${it.image}" alt="${it.name}" loading="lazy" decoding="async">`
                        : `<span class="dish-image" role="img" aria-label="${it.name}"
                             style="display:grid;place-items:center;font-size:2rem;background:#f3f3f3;border-radius:12px">${it.icon || "🍽️"}</span>`;
                    return `<div class="row"><span>${it.name}</span>
                      <span class="price">${it.price.toFixed(2).replace(".", ",")} €</span>
                      <button onclick="add(${i})" aria-label="Pridėti ${it.name}">Pridėti</button>
                      ${picture}</div>`;
                }).join("");
            }

            renderRestaurants();
            renderMenu();
            renderHistory();

            const reviewList = document.getElementById("reviewList");
            const defaultReviewMarkup = reviewList ? reviewList.innerHTML : "";
            let savedReviews = readStoredValue(STORAGE_KEYS.reviews, []);
            if (!Array.isArray(savedReviews)) savedReviews = [];

            function renderReviews() {
                if (!reviewList) return;
                const savedMarkup = savedReviews.map(review => `
                    <article class="review-card">
                        <div class="review-top"><strong>${escapeHTML(review.name)}</strong><span class="stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</span></div>
                        <p>„${escapeHTML(review.comment)}“</p>
                        <span class="review-author">${escapeHTML(review.dateLabel || "Neseniai")}</span>
                    </article>`).join("");
                reviewList.innerHTML = savedMarkup + defaultReviewMarkup;
            }
            renderReviews();

            document.querySelector(".tabs")?.addEventListener("click", event => {
                const button = event.target.closest("button[data-tab]");
                if (button) setTab(button.dataset.tab);
            });

            document.getElementById("profileButton")?.addEventListener("click", () => setTab("profile"));
            document.getElementById("levelButton")?.addEventListener("click", () => setTab("level"));
            document.getElementById("levelBackButton")?.addEventListener("click", () => setTab("restaurants"));
            document.getElementById("levelUpClose")?.addEventListener("click", hideLevelUp);
            document.getElementById("homeButton")?.addEventListener("click", goHome);
            document.querySelectorAll("[data-home-button]").forEach(button => button.addEventListener("click", goHome));

            document.getElementById("reviewForm")?.addEventListener("submit", event => {
                event.preventDefault();
                const form = event.currentTarget;
                const name = form.elements.namedItem("name").value.trim();
                const rating = Number(form.elements.namedItem("rating").value);
                const comment = form.elements.namedItem("comment").value.trim();
                const message = document.getElementById("reviewMessage");
                if (!name || !comment || !Number.isInteger(rating) || rating < 1 || rating > 5) {
                    message.textContent = "Užpildyk visus laukus ir pasirink įvertinimą.";
                    return;
                }
                savedReviews.unshift({
                    name: name.slice(0, 40),
                    rating,
                    comment: comment.slice(0, 500),
                    createdAt: new Date().toISOString(),
                    dateLabel: "Ką tik · išsaugota šiame įrenginyje"
                });
                writeStoredValue(STORAGE_KEYS.reviews, savedReviews);
                renderReviews();
                form.reset();
                message.textContent = "Atsiliepimas pridėtas. Šiuo metu jis išsaugotas tik šiame įrenginyje.";
            });

            // Pradinis puslapis – restoranų katalogas.
            setTab("restaurants");

            // 3. Krepšelis: vienodi produktai rodomi viena eilute su kiekiu.
            function getGroupedCart() {
                const grouped = new Map();
                cart.forEach(item => {
                    const key = item.name;
                    if (!grouped.has(key))
                        grouped.set(key, {
                            ...item,
                            quantity: 0
                        });
                    grouped.get(key).quantity += 1;
                }
                );
                return [...grouped.values()];
            }

            function formatMoney(value) {
                return Number(value).toFixed(2).replace(".", ",") + " €";
            }

            function renderCart() {
                const grouped = getGroupedCart();
                const totalQuantity = cart.length;
                const total = cart.reduce( (sum, item) => sum + item.price, 0);
                const count = document.getElementById("cartCount");
                count.textContent = totalQuantity > 99 ? "99+" : String(totalQuantity);
                count.hidden = totalQuantity === 0;
                document.getElementById("cartItems").innerHTML = grouped.length ? grouped.map(item => `
      <article class="cart-line">
        <div>
          <p class="cart-line-name">${escapeHTML(item.name)} <span aria-label="Kiekis">×${item.quantity}</span></p>
          <p class="cart-line-meta">${formatMoney(item.price)} / vnt.</p>
        </div>
        <div class="cart-line-right">
          <strong class="cart-line-total">${formatMoney(item.price * item.quantity)}</strong>
          <div class="cart-line-actions">
            <button class="cart-qty-button" type="button" data-cart-action="decrease" data-item="${escapeHTML(item.name)}" aria-label="Sumažinti ${escapeHTML(item.name)} kiekį">−</button>
            <span class="cart-qty-value">${item.quantity}</span>
            <button class="cart-qty-button" type="button" data-cart-action="increase" data-item="${escapeHTML(item.name)}" aria-label="Padidinti ${escapeHTML(item.name)} kiekį">+</button>
            <button class="cart-remove" type="button" data-cart-action="remove" data-item="${escapeHTML(item.name)}">Pašalinti</button>
          </div>
        </div>
      </article>`).join("") : '<div class="cart-empty"><span class="cart-empty-icon" aria-hidden="true">🛒</span>Krepšelis tuščias.<br>Pasirink patiekalus iš meniu.</div>';
                document.getElementById("cartTotal").textContent = formatMoney(total);
                document.getElementById("order").disabled = totalQuantity === 0;
            }

            function add(i) {
                if (!items[i])
                    return;
                cart.push(items[i]);
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
                if (event.target.id === "cartOverlay")
                    closeCart();
            }
            );
            document.getElementById("cartItems").addEventListener("click", event => {
                const button = event.target.closest("button[data-cart-action]");
                if (!button)
                    return;
                const action = button.dataset.cartAction;
                const name = button.dataset.item;
                const index = cart.findIndex(item => item.name === name);
                if (index < 0)
                    return;
                if (action === "increase") {
                    const item = items.find(product => product.name === name);
                    if (item)
                        cart.push(item);
                } else if (action === "decrease") {
                    cart.splice(index, 1);
                } else if (action === "remove") {
                    cart = cart.filter(item => item.name !== name);
                }
                renderCart();
            }
            );
            function syncOverlayState() {
                const isOpen = !document.getElementById("cartOverlay").hidden ||
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
                if (!overlay)
                    return;
                if (event.key === "Escape") {
                    event.preventDefault();
                    if (overlay.id === "levelUpOverlay")
                        hideLevelUp();
                    else if (overlay.id === "deliveryOverlay")
                        closeDelivery();
                    else
                        closeCart();
                    return;
                }
                if (event.key !== "Tab")
                    return;
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

            // 4. Užsakymo eiga rodoma viso ekrano lange po demonstracinio apmokėjimo.
            let displayedOrder = null;
            const stepDescriptions = [
                "Tavo užsakymas perduotas virtuvei.",
                "Virtuvė jau ruošia tavo patiekalus.",
                "Kurjeris paėmė užsakymą ir jau pakeliui.",
                "Užsakymas pristatytas. Skanaus!"
            ];

            function showStep(n) {
                document.getElementById("steps").innerHTML = stepNames.map((step, i) =>
                    `<li class="${i <= n ? "done" : ""} ${i === n ? "now" : ""}"${i === n ? ' aria-current="step"' : ""}>${step}</li>`
                ).join("");
                if (n < 0)
                    return;
                document.getElementById("deliveryTitle").textContent = stepNames[n];
                document.getElementById("deliverySubtitle").textContent = stepDescriptions[n];
                document.querySelector(".delivery-symbol").classList.toggle("is-delivered", n === 3);
                document.getElementById("deliveryFinish").hidden = n !== 3;
            }
            showStep(-1);

            document.getElementById("order").onclick = function() {
                if (!cart.length)
                    return;
                const count = cart.length;
                const groupedItems = getGroupedCart().map( ({name, price, quantity}) => ({
                    name,
                    price,
                    quantity
                }));
                const total = cart.reduce( (sum, item) => sum + item.price, 0);

                const order = {
                    id: Date.now(),
                    createdAt: new Date().toISOString(),
                    items: groupedItems,
                    total,
                    status: stepNames[0]
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

                stepNames.forEach( (step, i) => setTimeout( () => {
                    if (displayedOrder === order)
                        showStep(i);
                    order.status = step;
                    saveHistory();
                    renderHistory();
                    if (i === 3)
                        addXP(20);
                }
                , i * 4000));
            }
            ;

            // 5. XP, lygiai ir demonstraciniai apdovanojimai
            // Kiekvienam lygiui skiriamas piniginis placeholderis, o kas 5 lygius – milestone.
            function getCurrentLevel() {
                return Math.floor(xp / 100) + 1;
            }

            function getLevelReward(level) {
                if (level % 5 === 0)
                    return 25 + (Math.floor(level / 5) - 1) * 25;
                const regularRewards = [4, 7, 9, 6, 11, 8, 13, 10, 15, 7, 12];
                return regularRewards[(level - 2) % regularRewards.length];
            }

            function getEarnedRewardTotal() {
                let total = 0;
                for (let level = 2; level <= getCurrentLevel(); level++)
                    total += getLevelReward(level);
                return total;
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
                if (big)
                    big.textContent = level;
                const progressText = document.getElementById("levelProgressText");
                if (progressText)
                    progressText.textContent = `${progressXP} / 100 XP`;
                const progressFill = document.getElementById("levelProgressFill");
                if (progressFill)
                    progressFill.style.width = percent + "%";
                const progressBar = document.getElementById("levelProgressBar");
                if (progressBar)
                    progressBar.setAttribute("aria-valuenow", String(progressXP));
                const nextText = document.getElementById("levelNextText");
                if (nextText)
                    nextText.textContent = `Dar ${100 - progressXP} XP iki ${level + 1} lygio.`;
                const total = document.getElementById("totalXP");
                if (total)
                    total.textContent = `${xp.toLocaleString("lt-LT")} XP`;
                const balance = document.getElementById("rewardBalance");
                if (balance)
                    balance.textContent = formatReward(getEarnedRewardTotal());
                const milestones = document.getElementById("milestoneCount");
                if (milestones)
                    milestones.textContent = Math.floor(level / 5);
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
            <span class="reward-level">LYGIS ${level}${milestone ? " · MILESTONE" : ""}</span>
            <strong>${milestone ? "Milestone apdovanojimas" : "Lygio apdovanojimas"}</strong>
            <small>${earned ? "Apdovanojimas atrakintas" : "Pasiek šį lygį, kad atrakintum"}</small>
          </div>
          <div class="reward-card-amount">
            <strong>${formatReward(amount)}</strong>
            <span>${earned ? "✓ Gauta" : "🔒 Užrakinta"}</span>
          </div>
        </article>`);
                }
                document.getElementById("rewardList").innerHTML = rewardCards.join("");
            }

            function hideLevelUp() {
                const overlay = document.getElementById("levelUpOverlay");
                overlay.classList.remove("visible");
                const wasVisible = !overlay.hidden;
                overlay.hidden = true;
                if (wasVisible && !document.getElementById("deliveryOverlay").hidden)
                    document.getElementById("deliveryTitle").focus();
                if (levelUpTimer) {
                    clearTimeout(levelUpTimer);
                    levelUpTimer = null;
                }
            }

            function showLevelUp(level, earnedAmount, levelsGained) {
                const overlay = document.getElementById("levelUpOverlay");
                document.getElementById("levelUpNumber").textContent = level;
                document.getElementById("levelUpReward").textContent = levelsGained > 1 ? `Peršokai ${levelsGained} lygius ir gavai ${formatReward(earnedAmount)} demo rewardų!` : `Gavai ${formatReward(earnedAmount)} į demonstracinį balansą!`;
                overlay.hidden = false;
                requestAnimationFrame(() => {
                    overlay.classList.add("visible");
                    document.getElementById("levelUpClose").focus();
                });
                if (levelUpTimer)
                    clearTimeout(levelUpTimer);
                levelUpTimer = setTimeout(hideLevelUp, 4200);
            }

            function addXP(n) {
                const amount = Math.max(0, Math.floor(Number(n) || 0));
                if (!amount)
                    return;
                const previousLevel = getCurrentLevel();
                xp += amount;
                const newLevel = getCurrentLevel();
                saveXP();
                renderLevelUI();

                if (newLevel > previousLevel) {
                    let earnedAmount = 0;
                    for (let level = previousLevel + 1; level <= newLevel; level++) {
                        earnedAmount += getLevelReward(level);
                    }
                    renderLevelCenter();
                    showLevelUp(newLevel, earnedAmount, newLevel - previousLevel);
                }
            }

            // Įrašomas migracijos įrašas ir papildomai išsaugoma uždarant / atverčiant kitą kortelę.
            saveXP();
            document.addEventListener("visibilitychange", () => {
                if (document.visibilityState === "hidden")
                    saveXP();
            }
            );
            window.addEventListener("pagehide", saveXP);
            window.addEventListener("beforeunload", saveXP);

            renderLevelUI();
        
// Demonstracinis balansas (atskiras nuo XP apdovanojimų).

    let balansas = Number(
        localStorage.getItem("boomfood-balansas")
    ) || 0;

    const pinigine = document.createElement("div");
    pinigine.id = "boomfood-balansas";

    const lygis = document.querySelector(".site-header .level");

    if (lygis) {
        lygis.before(pinigine);
    } else {
        document.querySelector(".site-header .wrap").appendChild(pinigine);
    }

    function atnaujintiBalansa() {
        pinigine.textContent = balansas.toFixed(2) + " €";
        localStorage.setItem("boomfood-balansas", balansas);
    }

    function pridetiPinigu(suma) {
        balansas = Math.round((balansas + suma) * 100) / 100;
        atnaujintiBalansa();
    }

    atnaujintiBalansa();

