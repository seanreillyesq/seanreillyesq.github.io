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

    // Auto-show the banner
    autoShow: true,

    // Block page interaction until consent given
    disablePageInteraction: true,

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
            enabled: true,
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
                    showPreferencesBtn: 'Manage preferences',
                    footer: '<a href="/privacy">Privacy Policy</a>'
                },
                preferencesModal: {
                    title: 'Cookie Preferences',
                    acceptAllBtn: 'Accept all',
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
                                        name: '_gid',
                                        domain: 'Google Analytics',
                                        description: 'Used to distinguish users',
                                        expiration: '24 hours'
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
                            description: 'These cookies enable enhanced functionality and personalisation.',
                            linkedCategory: 'functionality'
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
