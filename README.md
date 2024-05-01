# SecretService

SecretService is a Google Apps Script library that allows to store secrets (passwords, API keys, etc.) safer and provides the following features:

-   Choose a storage for the secrets:
    -   Any `Properties` instance from your script
    -   Custom secret storage, like Google Cloud Secret Manager
-   Different modes in case of a missing secret:
    -   Silent: do nothing, return null.
    -   Strict: throw an error.
    -   Interactive: prompt the user for a missing secret.

SecretService is a [Dataful.Tech](https://dataful.tech) project.

## Security Note

Storing secrets in Google Apps Script safely is challenging. The root cause is that other users often have access to the code and can edit it.

For example, if you have a script attached to a Google Sheets document, any editor of the document will automatically be able to edit the script to display the secrets. The owner of the script will get a notification but it can be easily missed and the damage will be done by then. There are techniques to reduce the surface of the attack, however, they all come with their costs and inconveniences.

## Setup

You can use SecretService in two ways:

1. **As a library**: use the library id `164Mv6awN8mIExnFu6ZeXviPSA2GhDVP3grAMfiJCpAkcjcGWaDlNU9K4`.
2. **Copy the code** from `src/SecretService.js` to your project.

## Usage

Using SecretService is simple: either use library's methods directly or create an instance.

### Use Library Directly

You can use the library directly, without initializing an instance:

```js
const config = {
    storage: PropertiesService.getUserProperties(),
};

// Only once: set the secret
// You can skip this step if you use the `interactive` mode
SecretService.setSecret("API_KEY", "very-secret-value", config);

// 3. Get the secret
SecretService.getSecret("API_KEY", config);

// Delete specific secrets:
SecretService.deleteSecrets(["API_KEY", "ANOTHER_SECRET"], config);

// Delete all secrets:
SecretService.deleteAllSecrets(config);
```

### Create an Instance

To avoid passing configuration on each call, you create an instance:

```js
// Initialize with a configuration passing a storage object
const SECRETS = SecretService.init({
    storage: PropertiesService.getUserProperties(),
});

// Only once: set the secret
// You can skip this step if you use the `interactive` mode
SECRETS.setSecret("API_KEY", "very-secret-value");

// 3. Get the secret
const secretValue = SECRETS.getSecret("API_KEY");

// Delete specific secrets:
SECRETS.deleteSecrets(["API_KEY", "ANOTHER_SECRET"]);

// Delete all secrets:
SECRETS.deleteAllSecrets();
```

See more examples in the configuration section below.

## Configuration

SecretService accepts four configuration parameters:

-   `storage` (required) - where to store the secrets.
-   `prefix` (default: `secret_service_`) - added to the secret's `key` to avoid collisions with other values.
-   `mode` - what to do if no secret is found. Options:
    -   `silent` (default) - do nothing, return null.
    -   `strict` - throw an error.
    -   `interactive` - prompt the user to input the secret. Works only in scripts attached to a container (Google Sheet, Doc, Slide, or Form). Requires `scriptContainer`.
-   `scriptContainer` - the object referring to the script container app. Required when running in `interactive` mode: `SpreadsheetApp`, `DocumentApp`, `SlidesApp`, `FormApp`.

Read more on the configuration options below.

### Storage

SecretService supports two types of storages:

#### Properties Storage

You can pass to SecretService any Properties storage from your script:

```js
const SECRETS = SecretService.init({
    storage: PropertiesService.getUserProperties(),
    // Alternatively:
    // storage: PropertiesService.getScriptProperties()
    // storage: PropertiesService.getDocumentProperties()
});
```

Generally, `UserProperties` is the safest storage as it is accessible only to the user running the script. Caveat: the user properties of the owner of a Google Sheets document are accessible to anyone via a custom function (why Google, why?).

#### Google Cloud Secret Manager

You can use Google Cloud Secret Manager as a storage backend via the [GCSecretManager library](https://github.com/dataful-tech/GCSecretManager):

```js
const storage = GCSecretManager.init({project: "project-id"});
const SECRETS = SecretService.init({storage});

const secretValue = SECRETS.getSecret("API_KEY");
```

GCSecretManager does not support destructive operations. It will require extra permissions scopes to access the Secret Manger API. For the details, please refer to the [documentation](https://github.com/dataful-tech/GCSecretManager).

#### Custom Storage

You can pass any custom storage for secrets that implements these methods:

1. `get(key, config)`
2. `set(key, value, config)`
3. `delete(key, config)`
4. `deleteAll(key, config)`

`config` is an object passed to `SecretService.init(config)`, merged with a config override of any method.

The custom storage does not have to implement all methods. For example, if you need only to get the secrets, you can implement only `get(key, config)` method.

### Mode

The mode determines behavior of SecretService when a requested secret is not found.

#### Silent

Do nothing if a secret is not found and return `null`. It is the default behavior.

```js
const SECRETS = SecretService.init({
    storage: PropertiesService.getUserProperties(),
});

// It will return null
const API_KEY = SECRETS.getSecret("Does not exist");
```

#### Strict

Throw an error, if a secret is not found.

```js
const SECRETS = SecretService.init({
    storage: PropertiesService.getUserProperties(),
    mode: "strict",
});

// Throws an error
const API_KEY = SECRETS.getSecret("Does not exist");
```

<div align="center">
  <img src="https://github.com/dataful-tech/secret-service/raw/main/images/strict-mode-error.png" width="600px" alt="SecretService | Strict mode error: no secret"/>
</div>

#### Interactive

User will be prompted to enter the secret which will be saved to the storage. This method works only for scripts that are attached to a document container which you need to pass during the initialization:

```js
const SECRETS = SecretService.init({
    storage: PropertiesService.getUserProperties(),
    mode: "interactive",
    scriptContainer: SpreadsheetApp,
});

// User will be prompted if the secret does not exist
const API_KEY = SECRETS.getSecret("API_KEY");
```

<div align="center">
  <img src="https://github.com/dataful-tech/secret-service/raw/main/images/user-input-secret-prompt.png" width="600px" alt="SecretService | Input a secret prompt"/>
</div>

If the user clicks `Cancel` or closes the prompt, SecretService will throw an error.

<div align="center">
  <img src="https://github.com/dataful-tech/secret-service/raw/main/images/interactive-mode-error.png" width="600px" alt="SecretService | Interactive mode error: no secret"/>
</div>

### Overrides

You can specify the configuration during the initialization and provide an override for any parameter (except for the storage) when calling any other method:

```js
const SECRETS = SecretService.init({
    storage: PropertiesService.getUserProperties(),
    scriptContainer: SpreadsheetApp,
    mode: "interactive",
});

// Override certain 
const API_KEY = SECRETS.getSecret({
    prefix: "custom_prefix_override_",
    mode: "strict",
});
```

## Authorization Scopes

SecretService does not require any authorization scopes on its own. If you use a custom storage, it may require extra permissions.

## Limitations

Storing `null` secret is equivalent to not storing the secret at all.

## Tests

SecretService is covered by unit tests with mocks and jest, and by integration tests that validate behavior of the library in real Google Apps Script infrastructure.

## Versioning

This project follows standard `MAJOR.MINOR.PATCH` semantic versioning. Breaking changes may be introduced in new major versions.

## License

SecretService is available under the MIT license.

## Contribution

Contributions are welcome. Feel free to submit PRs or issues on GitHub for any suggestions or issues.
