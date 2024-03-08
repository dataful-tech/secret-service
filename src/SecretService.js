// Official repository: https://github.com/dataful-tech/secret-service
//
// MIT License

// Copyright 2024 Dataful.Tech

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the “Software”), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/**
 * @typedef {Object} SecretServiceConfig
 * @property {string|Object} [storage] The storage service to use:
 * - instance of `UserProperties`, `DocumentProperties`, or `ScriptProperties`.
 * - custom storage object: the secrets will be stored in the provided storage object.
 * @property {string} [mode] The mode of the Secret Service:
 * - `silent` (default): if secret is not found, do nothing and return null.
 * - `interactive`: if secret is not found, prompt user to enter it.
 *    The script has to be attached to a document and the user has to have it open.
 *    If the user cancels the prompt, throws an error. Requires `scriptContainer`.
 * - `strict`: if secret is not found, throw an error.
 * @property {string} [scriptContainer] The container service: `Spreadsheet-App`,
 * `Document-App`, `Slides-App`, or `Form-App` (without dashes).
 * Required when application is in `interactive` mode.
 * @property {string} [prefix] Prefix applied to the secret key. Default: `secret_service_`.
 */

/**
 * Creates a new SecretService instance with the given configuration.
 * @param {SecretServiceConfig} config The configuration object.
 * Supported options:
 * 1. `storage`: the storage service to use:
 *   - an instance of `UserProperties`, `DocumentProperties`, or `ScriptProperties`.
 *   - a custom storage object: the secrets will be stored in the provided storage object.
 * 2. `mode`: the mode of the Secret Service:
 *   - `silent` (default): if secret is not found, do nothing and return null.
 *   - `interactive`: if secret is not found, prompt user to enter it.
 *     The script has to be attached to a document and the user has to have it open.
 *     If the user cancels the prompt, throws an error. Requires `scriptContainer`.
 *   - `strict`: if secret is not found, throw an error.
 * 3. `scriptContainer`: the container service: `Spreadsheet-App`, `Document-App`,
 *   `Slides-App`, or `Form-App` (without dashes). Required when application is in `interactive` mode.
 * 4. `prefix`: prefix applied to the secret key. Default: `secret_service_`.
 * @returns {SecretService} An instance of SecretService.
 */
function init(config = {}) {
    return new SecretService(config);
}

/**
 * Class representing a SecretService.
 * @property {SecretServiceConfig=} config The configuration object for the SecretService.
 * Supported options:
 * 1. `storage`: the storage service to use:
 *   - an instance of `UserProperties`, `DocumentProperties`, or `ScriptProperties`.
 *   - a custom storage object: the secrets will be stored in the provided storage object.
 * 2. `mode`: the mode of the Secret Service:
 *   - `silent` (default): if secret is not found, do nothing and return null.
 *   - `interactive`: if secret is not found, prompt user to enter it.
 *     The script has to be attached to a document and the user has to have it open.
 *     If the user cancels the prompt, throws an error. Requires `scriptContainer`.
 *   - `strict`: if secret is not found, throw an error.
 * 3. `scriptContainer`: the container service: `Spreadsheet-App`, `Document-App`,
 *   `Slides-App`, or `Form-App` (without dashes). Required when application is in `interactive` mode.
 * 4. `prefix`: prefix applied to the secret key. Default: `secret_service_`.
 * @class
 */
class SecretService {
    constructor(config = {}) {
        /**
         * SecretService configuration object.
         * @type {SecretServiceConfig}
         * @public
         */
        this.config_ = { ...defaultConfig_, ...config };
        this.storage_ = this.getStorage_(this.config_);
    }

    getSecret(key, config = {}) {
        const mergedConfig = this.getConfig_(config);
        let secret = this.storage_.get(key, mergedConfig);
        if (secret !== null) return secret;

        if (mergedConfig.mode === "silent") return null;

        if (mergedConfig.mode === "strict") {
            throw new Error(`Secret not found: ${key}`);
        }

        // Interactive mode
        const ui = mergedConfig.scriptContainer.getUi();
        const result = ui.prompt(
            "Secrets Management",
            `Please enter ${key}`,
            ui.ButtonSet.OK_CANCEL
        );
        if (result.getSelectedButton() === ui.Button.OK) {
            secret = result.getResponseText();
            this.storage_.set(key, secret, mergedConfig);
            return secret;
        } else {
            // User clicked "CANCEL" or closed the prompt
            throw Error(`User has not entered the secret ${key}, aborting.`);
        }
    }

    setSecret(key, value, config = {}) {
        const mergedConfig = this.getConfig_(config);
        this.storage_.set(key, value, mergedConfig);
    }

    deleteSecrets(keys, config = {}) {
        const mergedConfig = this.getConfig_(config);
        keys.forEach((key) => this.storage_.delete(key, mergedConfig));
    }

    deleteAllSecrets(config = {}) {
        const mergedConfig = this.getConfig_(config);
        this.storage_.deleteAll(mergedConfig);
    }

    getStorage_(config) {
        // If getProperty method is defined, assume it's a `Properties` instance
        if (config.storage.getProperty !== undefined) return new PropertiesStorage_(config.storage);
        // Otherwise, it's a custom storage object
        return config.storage;
    }

    getConfig_(config = {}) {
        const mergedConfig = {
            ...this.config_,
            ...config,
        };
        if (!mergedConfig.storage) {
            throw new Error("`storage` is required");
        }
        if (!["interactive", "silent", "strict"].includes(mergedConfig.mode)) {
            throw new Error(
                `Invalid mode: ${mergedConfig.mode}. Supported modes: silent, interactive, strict.`
            );
        }
        if (mergedConfig.mode === "interactive" && !mergedConfig.scriptContainer) {
            throw new Error(
                "Script container is required for interactive mode. Please provide `scriptContainer` in the config."
            );
        }
        return mergedConfig;
    }
}

/**
 * Wrapper around UserProperties / ScriptProperties / DocumentProperties.
 * @class
 * @private
 */
class PropertiesStorage_ {
    /**
     * Creates an instance of PropertiesStorage.
     * @param {Properties} properties The properties service.
     * @constructor
     */
    constructor(properties) {
        this.properties_ = properties;
    }

    /**
     * Retrieves a property with the given key.
     * @param {string} key The key of the property.
     * @param {SecretServiceConfig} config The configuration object.
     * @returns {string|null} The value of the property.
     */
    get(key, config) {
        const completeKey = this.buildKey_(key, config);
        return this.properties_.getProperty(completeKey);
    }

    /**
     * Saves a property with the given key and value.
     * @param {string} key The key of the property.
     * @param {string} value The value of the property.
     * @param {SecretServiceConfig} config The configuration object.
     */
    set(key, value, config) {
        const completeKey = this.buildKey_(key, config);
        this.properties_.setProperty(completeKey, value);
    }

    /**
     * Deletes a property with the given key.
     * @param {string} key The key of the property.
     * @param {SecretServiceConfig} config The configuration object.
     */
    delete(key, config) {
        const completeKey = this.buildKey_(key, config);
        this.properties_.deleteProperty(completeKey);
    }

    /**
     * Deletes all properties with the given prefix.
     * @param {SecretServiceConfig} config The configuration object.
     */
    deleteAll(config) {
        const allProperties = this.properties_.getProperties();
        Object.keys(allProperties)
            .filter((key) => key.startsWith(config.prefix))
            .forEach((key) => this.properties_.deleteProperty(key));
    }

    /**
     * Builds a complete key based on the prefix in configuration.
     * @param {string} key The key of the property.
     * @param {SecretServiceConfig} config The configuration object.
     * @returns {string} The complete key.
     * @private
     */
    buildKey_(key, config) {
        return `${config.prefix}${key}`;
    }
}

const defaultConfig_ = {
    storage: null,
    mode: "silent",
    prefix: "secret_service_",
    scriptContainer: null,
};

// Methods to use SecretService without creating an instance.
// Also allow for type hints in the Google Apps Script IDE.

/**
 * Retrieves a secret with the given key.
 * @param {string} key The key of the secret.
 * @param {SecretServiceConfig=} config The configuration object.
 * Supported options:
 * 1. `storage`: the storage service to use:
 *   - an instance of `UserProperties`, `DocumentProperties`, or `ScriptProperties`.
 *   - a custom storage object: the secrets will be stored in the provided storage object.
 * 2. `mode`: the mode of the Secret Service:
 *   - `silent` (default): if secret is not found, do nothing and return null.
 *   - `interactive`: if secret is not found, prompt user to enter it.
 *     The script has to be attached to a document and the user has to have it open.
 *     If the user cancels the prompt, throws an error. Requires `scriptContainer`.
 *   - `strict`: if secret is not found, throw an error.
 * 3. `scriptContainer`: the container service: `Spreadsheet-App`, `Document-App`,
 *   `Slides-App`, or `Form-App` (without dashes). Required when application is in `interactive` mode.
 * 4. `prefix`: prefix applied to the secret key. Default: `secret_service_`.
 * @returns {string|null} The value of the secret.
 */
function getSecret(key, config) {
    return init(config).getSecret(key);
}

/**
 * Saves a secret with the given key and value.
 * @param {string} key The key of the secret.
 * @param {string} value The value of the secret.
 * @param {SecretServiceConfig=} config The configuration object.
 * Supported options:
 * 1. `storage`: the storage service to use:
 *   - an instance of `UserProperties`, `DocumentProperties`, or `ScriptProperties`.
 *   - a custom storage object: the secrets will be stored in the provided storage object.
 * 2. `prefix`: prefix applied to the secret key. Default: `secret_service_`.
 * @returns {void}
 */
function setSecret(key, value, config) {
    init(config).setSecret(key, value);
}

/**
 * Deletes secrets with the given keys.
 * @param {string[]} keys Array of keys of the secrets to delete.
 * @param {SecretServiceConfig=} config The configuration object.
 * Supported options:
 * 1. `storage`: the storage service to use:
 *   - an instance of `UserProperties`, `DocumentProperties`, or `ScriptProperties`.
 *   - a custom storage object: the secrets will be stored in the provided storage object.
 * 2. `prefix`: prefix applied to the secret key. Default: `secret_service_`.
 * @returns {void}
 */
function deleteSecrets(keys, config) {
    init(config).deleteSecrets(keys);
}

/**
 * Deletes all secrets in the storage.
 * @param {SecretServiceConfig=} config The configuration object.
 * Supported options:
 * 1. `storage`: the storage service to use:
 *   - an instance of `UserProperties`, `DocumentProperties`, or `ScriptProperties`.
 *   - a custom storage object: the secrets will be stored in the provided storage object.
 * 2. `prefix`: prefix applied to the secret key. Default: `secret_service_`.
 * @returns {void}
 */
function deleteAllSecrets(config) {
    init(config).deleteAllSecrets();
}

// Export to allow unit testing
if (typeof module === "object") {
    module.exports = {
        init,
        defaultConfig_,
        setSecret,
        getSecret,
        deleteSecrets,
        deleteAllSecrets,
    };
}
