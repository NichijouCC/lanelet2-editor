module.exports = api => {
    api.cache(true);
    return {
        "plugins": [
            ['@babel/plugin-transform-typescript', { allowNamespaces: true, allowDeclareFields: true }],
            [
                "@babel/plugin-proposal-decorators",
                {
                    "legacy": true
                }
            ],
            "@babel/proposal-class-properties",
            // "@babel/proposal-object-rest-spread",
        ],
        "presets": [
            [
                "@babel/env",
                process.env.NODE_ENV == "development" ? {
                    "corejs": "3.22.0",
                    "useBuiltIns": "usage",
                    "targets": {
                        "chrome": "77",
                    },
                } : {
                    "corejs": "3.22.0",
                    "useBuiltIns": "usage",
                    "targets": {
                        "browsers": ["> 1%", "last 2 versions", "not ie <= 8"]
                    },
                    "modules": false,
                }
            ],
            "@babel/react",
            ['@babel/preset-typescript', {
                allowNamespaces: true,
                allowDeclareFields: true,
            }],
        ],
    };
};