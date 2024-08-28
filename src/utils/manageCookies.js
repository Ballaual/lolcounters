import Cookies from 'js-cookie';

// Load theme from cookies
export const loadThemeFromCookies = (setTheme) => {
    const savedTheme = Cookies.get('theme');
    if (savedTheme) {
        setTheme(savedTheme);
        document.body.classList.add(savedTheme);
    }
};

// Load cookie preferences
export const loadCookiePreferences = (setCookiesAccepted, setShowCookiePopup) => {
    if (Cookies.get('cookiesPopupShown')) {
        setCookiesAccepted(Cookies.get('cookiesAccepted') === 'true');
    } else {
        setShowCookiePopup(true);
    }
};

// Load saved values from cookies
export const loadSavedValuesFromCookies = (cookiesAccepted, setLane, setRank, setYourChampions) => {
    if (cookiesAccepted) {
        const savedLane = Cookies.get('lane');
        const savedRank = Cookies.get('rank');
        const savedChampions = Cookies.get('yourChampions');

        if (savedLane) setLane(savedLane);
        if (savedRank) setRank(savedRank);
        if (savedChampions) {
            try {
                const parsedChampions = JSON.parse(savedChampions);
                setYourChampions(parsedChampions);
            } catch (e) {
                console.error('Error parsing champions from cookies:', e);
            }
        }
    }
};

// Save theme to cookies
export const saveThemeToCookies = (theme, cookiesAccepted) => {
    if (cookiesAccepted) {
        Cookies.set('theme', theme, { expires: 7 });
    }
};

// Handle cookie acceptance
export const handleCookiesAcceptance = (accept, setCookiesAccepted, setShowCookiePopup) => {
    setCookiesAccepted(accept);
    setShowCookiePopup(false);

    Cookies.set('cookiesPopupShown', 'true', { expires: 30 });

    if (accept) {
        Cookies.set('cookiesAccepted', 'true', { expires: 30 });
    } else {
        Cookies.remove('cookiesAccepted');
        Cookies.remove('theme');
        Cookies.remove('lane');
        Cookies.remove('rank');
        Cookies.remove('yourChampions');
    }
};

// Save specific data to cookies
export const saveDataToCookies = (key, value, cookiesAccepted) => {
    if (cookiesAccepted) {
        Cookies.set(key, value, { expires: 7, secure: true, sameSite: 'Strict' });
    } else {
        Cookies.remove(key);
    }
};
