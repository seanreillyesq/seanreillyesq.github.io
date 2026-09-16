/**
 * CookieConsent Configuration for seanreilly.net
 * Implements Google Consent Mode v2
 * Note: Consent defaults are set in head.html before GTM loads
 */

/**
 * Update Google Consent based on user choices
 */
function updateGtagConsent() {
    gtag('consent', 'update', {
        'analytics_storage': CookieConsent.acceptedCategory('analytics') ? 'granted' : 'denied',
        'ad_storage': CookieConsent.acceptedCategory('marketing') ? 'granted' : 'denied',
        'ad_user_data': CookieConsent.acceptedCategory('marketing') ? 'granted' : 'denied',
        'ad_personalization': CookieConsent.acceptedCategory('marketing') ? 'granted' : 'denied',
        'functionality_storage': CookieConsent.acceptedCategory('functionality') ? 'granted' : 'denied',
        'personalization_storage': CookieConsent.acceptedCategory('functionality') ? 'granted' : 'denied'
    });
}

// Initialise CookieConsent
CookieConsent.run({

    // GDPR requires opt-in
    mode: 'opt-in',

    // Bump when consent terms materially change (re-collects consent)
    revision: 1,

    // Auto-show the banner
    autoShow: true,

    // Do not block page interaction (avoids a cookie-wall pattern)
    disablePageInteraction: false,

    // Hide from bots
    hideFromBots: true,

    // Cookie settings
    cookie: {
        name: 'cc_seanreilly',
        domain: window.location.hostname,
        path: '/',
        secure: true,
        expiresAfterDays: 182,
        sameSite: 'Lax'
    },

    // UI options
    guiOptions: {
        consentModal: {
            layout: 'box',
            position: 'middle center',
            equalWeightButtons: true,
            flipButtons: false
        },
        preferencesModal: {
            layout: 'box',
            position: 'right',
            equalWeightButtons: true,
            flipButtons: false
        }
    },

    // Categories
    categories: {
        necessary: {
            enabled: true,
            readOnly: true
        },
        analytics: {
            enabled: false,
            autoClear: {
                cookies: [
                    { name: /^_ga/ },
                    { name: '_gid' }
                ]
            }
        },
        marketing: {
            enabled: false,
            autoClear: {
                cookies: [
                    { name: /^_gcl/ },
                    { name: '_fbp' }
                ]
            }
        },
        functionality: {
            enabled: false
        }
    },

    // Language and translations
    language: {
        default: 'en',
        translations: {
            en: {
                consentModal: {
                    title: 'We use cookies',
                    description: 'I use cookies to understand how visitors use this site and to improve your experience. You can choose which cookies you allow.',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    showPreferencesBtn: 'Manage preferences',
                    footer: '<a href="/privacy">Privacy Policy</a>'
                },
                preferencesModal: {
                    title: 'Cookie Preferences',
                    acceptAllBtn: 'Accept all',
                    acceptNecessaryBtn: 'Reject all',
                    savePreferencesBtn: 'Save preferences',
                    closeIconLabel: 'Close',
                    sections: [
                        {
                            title: 'Cookie Usage',
                            description: 'I use cookies to ensure the basic functionality of this website and to enhance your online experience. You can choose to opt in or out of each category whenever you want.'
                        },
                        {
                            title: 'Strictly Necessary Cookies',
                            description: 'These cookies are essential for the website to function properly. They cannot be disabled.',
                            linkedCategory: 'necessary'
                        },
                        {
                            title: 'Analytics Cookies',
                            description: 'These cookies help me understand how visitors interact with my website by collecting and reporting information anonymously.',
                            linkedCategory: 'analytics',
                            cookieTable: {
                                headers: {
                                    name: 'Name',
                                    domain: 'Service',
                                    description: 'Description',
                                    expiration: 'Expiration'
                                },
                                body: [
                                    {
                                        name: '_ga',
                                        domain: 'Google Analytics',
                                        description: 'Used to distinguish users',
                                        expiration: '2 years'
                                    },
                                    {
                                        name: '_ga_<container-id>',
                                        domain: 'Google Analytics 4',
                                        description: 'Used to persist session state',
                                        expiration: '2 years'
                                    }
                                ]
                            }
                        },
                        {
                            title: 'Marketing Cookies',
                            description: 'These cookies are used to track visitors across websites to display relevant advertisements.',
                            linkedCategory: 'marketing'
                        },
                        {
                            title: 'Functionality Cookies',
                            description: 'These cookies enable enhanced functionality and personalisation, such as remembering your preferences on interactive tools.',
                            linkedCategory: 'functionality',
                            cookieTable: {
                                headers: {
                                    name: 'Name',
                                    domain: 'Service',
                                    description: 'Description',
                                    expiration: 'Expiration'
                                },
                                body: [
                                    {
                                        name: 'caffeine_prefs',
                                        domain: 'Caffeine Calculator',
                                        description: 'Remembers your wake/sleep times and drink preferences',
                                        expiration: '1 year'
                                    },
                                    {
                                        name: 'ce_prefs',
                                        domain: 'Customer Economics Calculator',
                                        description: 'Remembers your inputs on the customer economics tool',
                                        expiration: '1 year'
                                    },
                                    {
                                        name: 'roas_prefs',
                                        domain: 'ROAS Calculator',
                                        description: 'Remembers your inputs on the ROAS tool',
                                        expiration: '1 year'
                                    },
                                    {
                                        name: 'serp-preview-v1',
                                        domain: 'SERP Preview Tool (local storage)',
                                        description: 'Remembers your last SERP preview inputs in your browser',
                                        expiration: 'Until cleared'
                                    }
                                ]
                            }
                        },
                        {
                            title: 'More Information',
                            description: 'For any queries about my cookie policy, please contact me via <a href="https://www.linkedin.com/in/seanreillyesq" target="_blank" rel="noopener">LinkedIn</a>.'
                        }
                    ]
                }
            }
        }
    },

    // Callbacks
    onFirstConsent: function() {
        updateGtagConsent();
    },

    onConsent: function() {
        updateGtagConsent();
    },

    onChange: function() {
        updateGtagConsent();
    }
});
