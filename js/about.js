// BoomFood – „Apie mus“ puslapis.
// Šis failas kraunamas PO script.js, todėl script.js keisti nereikia.

Object.assign(TEXT.lt, {
    about: "Apie mus",
    aboutTitle: "Apie BoomFood",
    aboutIntro: "BoomFood yra demonstracinė maisto pristatymo platforma, kurioje gali naršyti restoranus, peržiūrėti jų meniu, dėti patiekalus į krepšelį ir pateikti užsakymą. Matysi net užsakymo eigą: nuo „Užsakymas priimtas“ iki „Pristatytas“.",
    aboutFeatures: "Už kiekvieną užsakymą gauni XP, keli lygius ir atrakini demonstracinius apdovanojimus. Gali palikti atsiliepimų, pasikeisti profilio vardą bei nuotrauką ir pasirinkti šviesią ar tamsią temą.",
    aboutNotice: "Tai simuliacija. Tikras maistas nepristatomas, mokėti nereikia, o visi duomenys (krepšelis, užsakymai, balansas, atsiliepimai) saugomi tik tavo įrenginyje."
});

Object.assign(TEXT.en, {
    about: "About",
    aboutTitle: "About BoomFood",
    aboutIntro: "BoomFood is a demo food delivery platform where you can browse restaurants, explore their menus, add dishes to your cart and place an order. You can even follow the order's progress, from \"Order received\" to \"Delivered\".",
    aboutFeatures: "Every order earns you XP, helps you level up and unlocks demo rewards. You can also leave reviews, change your profile name and photo, and switch between light and dark themes.",
    aboutNotice: "This is a simulation. No real food is delivered, no payment is required, and all your data (cart, orders, balance, reviews) is stored only on your device."
});

(function () {
    const originalSetTab = setTab;
    const otherViews = ["menuView", "restaurantsView", "reviewsView", "profileView", "settingsView", "levelView"];

    setTab = function (viewName) {
        const about = document.getElementById("aboutView");

        if (viewName === "about" && about) {
            otherViews.forEach(id => {
                const view = document.getElementById(id);
                if (view) view.hidden = true;
            });

            about.hidden = false;
            return;
        }

        if (about) about.hidden = true;
        originalSetTab(viewName);
    };
})();

document.getElementById("openAbout")?.addEventListener("click", () => {
    closeUserMenu();
    setTab("about");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

document.getElementById("aboutBackButton")?.addEventListener("click", () => {
    setTab("restaurants");
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// Pritaiko naujus tekstus pagal pasirinktą kalbą.
applyLanguage();
