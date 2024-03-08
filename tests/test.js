const SecretService = require("../src/SecretService");
const StorageMock = require("./mocks/Storage");
const SpreadsheetAppMock = require("./mocks/SpreadsheetApp");
const PropertiesInstanceMock = require("./mocks/PropertiesInstance");

describe("Direct use without initialization", () => {
    beforeEach(() => {
        PropertiesInstanceMock.reset();
    });

    it("setSecret() with the default prefix", () => {
        SecretService.setSecret("key", "value", { storage: PropertiesInstanceMock });
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledWith(
            "secret_service_key",
            "value"
        );
    });

    it("setSecret() with a custom prefix", () => {
        SecretService.setSecret("key", "value", {
            prefix: "custom_prefix_",
            storage: PropertiesInstanceMock,
        });
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledWith(
            "custom_prefix_key",
            "value"
        );
    });

    it("getSecret() with the default prefix", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce("value");
        expect(SecretService.getSecret("key", { storage: PropertiesInstanceMock })).toBe("value");
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledWith("secret_service_key");
    });

    it("getSecret() with a custom prefix", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce("value");
        expect(
            SecretService.getSecret("key", {
                prefix: "custom_prefix_",
                storage: PropertiesInstanceMock,
            })
        ).toBe("value");
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledWith("custom_prefix_key");
    });

    it("deleteSecrets() with the default prefix", () => {
        SecretService.deleteSecrets(["key"], { storage: PropertiesInstanceMock });
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledWith("secret_service_key");
    });

    it("deleteSecrets() with a custom prefix", () => {
        SecretService.deleteSecrets(["key"], {
            storage: PropertiesInstanceMock,
            prefix: "custom_prefix_",
        });
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledWith("custom_prefix_key");
    });

    it("deleteAllSecrets() without secrets to delete", () => {
        SecretService.deleteAllSecrets({ storage: PropertiesInstanceMock });
        expect(PropertiesInstanceMock.getProperties).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(0);
    });

    it("deleteAllSecrets() with secrets to delete and the default prefix", () => {
        PropertiesInstanceMock.getProperties.mockReturnValueOnce({
            secret_service_key1: "value1",
            secret_service_key2: "value2",
        });
        SecretService.deleteAllSecrets({ storage: PropertiesInstanceMock });
        expect(PropertiesInstanceMock.getProperties).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(2);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenNthCalledWith(
            1,
            "secret_service_key1"
        );
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenNthCalledWith(
            2,
            "secret_service_key2"
        );
    });

    it("deleteAllSecrets() with secrets to delete and the custom prefix", () => {
        PropertiesInstanceMock.getProperties.mockReturnValueOnce({
            custom_prefix_key1: "value1",
            custom_prefix_key2: "value2",
        });
        SecretService.deleteAllSecrets({
            prefix: "custom_prefix_",
            storage: PropertiesInstanceMock,
        });
        expect(PropertiesInstanceMock.getProperties).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(2);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenNthCalledWith(
            1,
            "custom_prefix_key1"
        );
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenNthCalledWith(
            2,
            "custom_prefix_key2"
        );
    });
});

describe("External PropertiesService storage", () => {
    beforeEach(() => {
        PropertiesInstanceMock.reset();
    });

    it("setSecret() with the default prefix", () => {
        const service = SecretService.init({ storage: PropertiesInstanceMock });
        service.setSecret("key", "value");
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledWith(
            "secret_service_key",
            "value"
        );
    });

    it("setSecret() with a custom prefix", () => {
        const service = SecretService.init({
            prefix: "custom_prefix_",
            storage: PropertiesInstanceMock,
        });
        service.setSecret("key", "value");
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledWith(
            "custom_prefix_key",
            "value"
        );
    });

    it("getSecret() with the default prefix", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce("value");
        const service = SecretService.init({ storage: PropertiesInstanceMock });
        expect(service.getSecret("key")).toBe("value");
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledWith("secret_service_key");
    });

    it("getSecret() with a custom prefix", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce("value");
        const service = SecretService.init({
            prefix: "custom_prefix_",
            storage: PropertiesInstanceMock,
        });
        expect(service.getSecret("key")).toBe("value");
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledWith("custom_prefix_key");
    });

    it("deleteSecrets() with the default prefix", () => {
        const service = SecretService.init({ storage: PropertiesInstanceMock });
        service.deleteSecrets(["key"]);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledWith("secret_service_key");
    });

    it("deleteSecrets() with a custom prefix", () => {
        const service = SecretService.init({
            storage: PropertiesInstanceMock,
            prefix: "custom_prefix_",
        });
        service.deleteSecrets(["key"]);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledWith("custom_prefix_key");
    });

    it("deleteAllSecrets() without secrets to delete", () => {
        const service = SecretService.init({ storage: PropertiesInstanceMock });
        service.deleteAllSecrets();
        expect(PropertiesInstanceMock.getProperties).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(0);
    });

    it("deleteAllSecrets() with secrets to delete and the default prefix", () => {
        PropertiesInstanceMock.getProperties.mockReturnValueOnce({
            secret_service_key1: "value1",
            secret_service_key2: "value2",
        });
        const service = SecretService.init({ storage: PropertiesInstanceMock });
        service.deleteAllSecrets();
        expect(PropertiesInstanceMock.getProperties).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(2);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenNthCalledWith(
            1,
            "secret_service_key1"
        );
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenNthCalledWith(
            2,
            "secret_service_key2"
        );
    });

    it("deleteAllSecrets() with secrets to delete and the custom prefix", () => {
        PropertiesInstanceMock.getProperties.mockReturnValueOnce({
            custom_prefix_key1: "value1",
            custom_prefix_key2: "value2",
        });
        const service = SecretService.init({
            prefix: "custom_prefix_",
            storage: PropertiesInstanceMock,
        });
        service.deleteAllSecrets();
        expect(PropertiesInstanceMock.getProperties).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenCalledTimes(2);
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenNthCalledWith(
            1,
            "custom_prefix_key1"
        );
        expect(PropertiesInstanceMock.deleteProperty).toHaveBeenNthCalledWith(
            2,
            "custom_prefix_key2"
        );
    });
});

describe("Custom external storage object", () => {
    beforeEach(() => {
        StorageMock.reset();
    });

    it("setSecret()", () => {
        const service = SecretService.init({ storage: StorageMock });
        service.setSecret("key", "value");
        expect(StorageMock.set).toHaveBeenCalledTimes(1);
        expect(StorageMock.set).toHaveBeenCalledWith("key", "value", service.config_);
    });

    it("getSecret()", () => {
        StorageMock.get.mockReturnValueOnce("value");
        const service = SecretService.init({ storage: StorageMock });
        expect(service.getSecret("key")).toBe("value");
        expect(StorageMock.get).toHaveBeenCalledTimes(1);
        expect(StorageMock.get).toHaveBeenCalledWith("key", service.config_);
    });

    it("deleteSecrets()", () => {
        const service = SecretService.init({ storage: StorageMock });
        service.deleteSecrets(["key"]);
        expect(StorageMock.delete).toHaveBeenCalledTimes(1);
        expect(StorageMock.delete).toHaveBeenCalledWith("key", service.config_);
    });

    it("deleteAllSecrets()", () => {
        const service = SecretService.init({ storage: StorageMock });
        service.deleteAllSecrets();
        expect(StorageMock.deleteAll).toHaveBeenCalledTimes(1);
        expect(StorageMock.deleteAll).toHaveBeenCalledWith(service.config_);
    });
});

describe("Strict mode", () => {
    beforeEach(() => {
        PropertiesInstanceMock.reset();
        SpreadsheetAppMock.reset();
    });

    it("getSecret() with missing secret", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce(null);
        const service = SecretService.init({
            mode: "strict",
            storage: PropertiesInstanceMock,
            scriptContainer: SpreadsheetAppMock.mock,
        });
        expect(() => service.getSecret("key")).toThrow("Secret not found: key");
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledWith("secret_service_key");
    });

    it("getSecret() with an existing secret", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce("secret");
        const service = SecretService.init({
            storage: PropertiesInstanceMock,
            mode: "strict",
        });
        expect(service.getSecret("key")).toBe("secret");
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledWith("secret_service_key");
    });
});

describe("Interactive mode", () => {
    beforeEach(() => {
        PropertiesInstanceMock.reset();
        SpreadsheetAppMock.reset();
    });

    it("getSecret() in interactive mode for a missing secret and user aborted", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce(null);
        const service = SecretService.init({
            mode: "interactive",
            storage: PropertiesInstanceMock,
            scriptContainer: SpreadsheetAppMock.mock,
        });
        expect(() => service.getSecret("key")).toThrow(
            "User has not entered the secret key, aborting."
        );
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledWith("secret_service_key");
        expect(SpreadsheetAppMock.uiPromptMock).toHaveBeenCalledTimes(1);
        expect(SpreadsheetAppMock.uiPromptMock).toHaveBeenCalledWith(
            "Secrets Management",
            "Please enter key",
            SpreadsheetAppMock.okCancelButtonSet
        );
    });

    it("getSecret() without a script container", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce(null);
        const service = SecretService.init({
            storage: PropertiesInstanceMock,
            mode: "interactive",
        });
        expect(() => service.getSecret("key")).toThrow(
            "Script container is required for interactive mode"
        );
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(0);
        expect(SpreadsheetAppMock.uiPromptMock).toHaveBeenCalledTimes(0);
    });

    it("getSecret() for a missing secret and user provided the secret", () => {
        PropertiesInstanceMock.getProperty.mockReturnValueOnce(null);
        const secret = "secret";
        const service = SecretService.init({
            storage: PropertiesInstanceMock,
            mode: "interactive",
            scriptContainer: SpreadsheetAppMock.mock,
        });
        SpreadsheetAppMock.uiPromptMock.mockReturnValueOnce({
            getSelectedButton: () => SpreadsheetAppMock.okButton,
            getResponseText: () => secret,
        });
        expect(service.getSecret("key")).toBe(secret);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.getProperty).toHaveBeenCalledWith("secret_service_key");
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledTimes(1);
        expect(PropertiesInstanceMock.setProperty).toHaveBeenCalledWith(
            "secret_service_key",
            secret
        );
        expect(SpreadsheetAppMock.uiPromptMock).toHaveBeenCalledTimes(1);
        expect(SpreadsheetAppMock.uiPromptMock).toHaveBeenCalledWith(
            "Secrets Management",
            "Please enter key",
            SpreadsheetAppMock.okCancelButtonSet
        );
    });
});
