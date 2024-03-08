// To be run from a real apps script

const runTests = () => {
    testPropertiesStorage();
    testCustomStorage();
    testDirectUse();
};

const assertEqual = (value1, value2) => {
    if (value1 !== value2)
        throw `Values ${JSON.stringify(value1)} and ${JSON.stringify(value2)} are not equal`;
};

const testCustomStorage = () => {
    class CustomStorageMock {
        constructor() {
            this.store = {};
        }

        get(key, config) {
            const value = this.store[key];
            if (value !== undefined) return value;
            return null;
        }

        set(key, value, config) {
            this.store[key] = value;
        }

        delete(key, config) {
            delete this.store[key];
        }

        deleteAll(key, config) {
            this.store = {};
        }
    }

    const SECRETS = SecretService.init({
        storage: new CustomStorageMock(),
    });

    SECRETS.deleteAllSecrets();

    // Get non-existent secret
    assertEqual(SECRETS.getSecret("key"), null);

    // Get existing secret
    SECRETS.setSecret("key", "secret");
    assertEqual(SECRETS.getSecret("key"), "secret");

    // Delete secret
    SECRETS.setSecret("key1", "secret");
    SECRETS.setSecret("key2", "secret");
    SECRETS.deleteSecrets(["key1", "key2"]);
    assertEqual(SECRETS.getSecret("key1"), null);
    assertEqual(SECRETS.getSecret("key2"), null);

    // Test deleting all secrets
    SECRETS.setSecret("key1", "secret");
    SECRETS.setSecret("key2", "secret");
    SECRETS.setSecret("key3", "secret");
    SECRETS.deleteAllSecrets();
    assertEqual(SECRETS.getSecret("key1"), null);
    assertEqual(SECRETS.getSecret("key2"), null);
    assertEqual(SECRETS.getSecret("key3"), null);

    console.log("Passed: Custom storage");
};

// Test direct use
const testDirectUse = () => {
    const config = {
        storage: PropertiesService.getScriptProperties(),
    };

    SecretService.deleteAllSecrets(config);

    // Get non-existent secret
    assertEqual(SecretService.getSecret("key", config), null);

    // Get existing secret
    SecretService.setSecret("key", "secret", config);
    assertEqual(SecretService.getSecret("key", config), "secret");
    // Check that it is stored in the ScriptProperties tied to the calling script
    assertEqual(
        PropertiesService.getScriptProperties().getProperty("secret_service_key"),
        "secret"
    );

    // Delete secret
    SecretService.setSecret("key1", "secret", config);
    SecretService.setSecret("key2", "secret", config);
    SecretService.deleteSecrets(["key1", "key2"], config);
    assertEqual(SecretService.getSecret("key1", config), null);
    assertEqual(SecretService.getSecret("key2", config), null);

    // Test deleting all secrets
    SecretService.setSecret("key1", "secret", config);
    SecretService.setSecret("key2", "secret", config);
    SecretService.setSecret("key3", "secret", config);
    SecretService.deleteAllSecrets(config);
    assertEqual(SecretService.getSecret("key1", config), null);
    assertEqual(SecretService.getSecret("key2", config), null);
    assertEqual(SecretService.getSecret("key3", config), null);
    assertEqual(JSON.stringify(PropertiesService.getScriptProperties().getProperties()), "{}");

    console.log("Passed: Direct use");
};

// Test with explicit properties storage
const testPropertiesStorage = () => {
    const SECRETS = SecretService.init({
        storage: PropertiesService.getScriptProperties(),
    });

    SECRETS.deleteAllSecrets();

    // Get non-existent secret
    assertEqual(SECRETS.getSecret("key"), null);

    // Get existing secret
    SECRETS.setSecret("key", "secret");
    assertEqual(SECRETS.getSecret("key"), "secret");
    // Check that it is stored in the ScriptProperties tied to the calling script
    assertEqual(
        PropertiesService.getScriptProperties().getProperty("secret_service_key"),
        "secret"
    );

    // Delete secret
    SECRETS.setSecret("key1", "secret");
    SECRETS.setSecret("key2", "secret");
    SECRETS.deleteSecrets(["key1", "key2"]);
    assertEqual(SECRETS.getSecret("key1"), null);
    assertEqual(SECRETS.getSecret("key2"), null);

    // Test deleting all secrets
    SECRETS.setSecret("key1", "secret");
    SECRETS.setSecret("key2", "secret");
    SECRETS.setSecret("key3", "secret");
    SECRETS.deleteAllSecrets();
    assertEqual(SECRETS.getSecret("key1"), null);
    assertEqual(SECRETS.getSecret("key2"), null);
    assertEqual(SECRETS.getSecret("key3"), null);
    assertEqual(JSON.stringify(PropertiesService.getScriptProperties().getProperties()), "{}");

    console.log("Passed: Explicit properties storage");
};
