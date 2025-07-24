# E-CLAUT Backend

(WIP)

## Description

This is the backend of the E-CLAUT project. It consists of a REST API that allows the frontend to interact with the
database.
It also includes an MQTT, SQS and lambda api for the communication with the IoT devices (Machines).

## Technologies

- [NodeJS](https://nodejs.org/): version 22
- [Typescript](https://www.typescriptlang.org/)
- [HonoJS](https://hono.dev)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)
- [Turborepo](https://turborepo.org)
- [AWS CDK](https://aws.amazon.com/cdk/)

## API Documentation

TODO: add link to deployed api documentation

## Installation

### Prerequisites

- NodeJS: version 22

### Steps

```bash
  corepack enable
```

```bash
  yarn set version 4.1.0
```

```bash
  yarn install
```

Install Docker

You can download [Docker Desktop](https://www.docker.com/products/docker-desktop) for free
to have a GUI for managing your containers.

Alternative for MacOS via Brew:

```bash
 brew install docker
```

## Packages

- **API / REST Server**: The REST API is the main server which will be hosted within a Docker. It is built with HonoJS.
  This allows us to quickly switch between different runtimes if needed.

- **API / Layers**: Layers are used to separate reusable components for functions.

- **API / Functions**: We have one lambda used to handle the incoming machine events. The lambda is triggered by SQS
  which in turn is triggered by IoT Core MQTT messages.

- **Libraries / Services**: The business layer of the application. This is where the main logic of the application is
  stored.

- **Libraries / Models**: The models are implemented using the *static factory pattern* so they can act as a mapper
  between the database, the services, and the API.

- **Libraries / Errors**: The collection of custom errors used throughout the application.

- **Libraries / Repositories**: The repositories are used to interact with the database.

- **Libraries / Database**: The connection to the database is established here.

- **Libraries / Utils**: Helper functions and classes that are either used on multiple locations or are third-party
  integrations.

## Development

TODO

### Database

### Exporting a module

Please use named exports for all modules. This will make it easier to import and test the modules.

```typescript
// ❌
export default function someFn() {
	return 'Hello World';
}

// ❌
function someFn() {
	return 'Hello World';
}

export default someFn;

// ✅
export function someFn() {
	return 'Hello World';
}

// ✅
function someFn() {
	return 'Hello World';
}

export {someFn};
```

> **Try to avoid bucket index files.** This is annoying to tree shake and makes it harder to find the module you are
> looking for.
> You can export multiple files from one module. Check the package.json ``exports`` property.
>
> Alternatively, we can do both and set the bundler to change the imports from the index file to the actual file.

### Formatting

This project uses ESLint in combination with Prettier to enforce a consistent code style. You can run the linter with
the following command:

```bash
  yarn pretty
```

This will be run automatically before each commit.

### Type Checking

Unfortunately, we use different bundlers for development, testing, and production. For compatibility we have to separate
the type exports and imports.

```typescript

import {Type, someFn} from 'module'; // ❌

import type {Type} from 'module'; // ✅
import {someFn} from 'module'; // ✅

//or in one line

import {type Type, someFn} from 'module'; // ✅

```

### Testing

Our test library is Vitest. Tests are located in the test folder of each package. In the test folder, we have separate
directories for unit, integration, and end-to-end tests.

```bash
  yarn test
```

```bash
  yarn test:unit
```

```bash
  yarn test:integration
```

### Commits

When committing please use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to enforce a
consistent commit message style.

Examples

```
feat: add new feature
feat(TICKET-123): add new feature

fix: correct typo
fix(TICKET-123): correct typo

BREAKING CHANGE: remove feature
BREAKING CHANGE(TICKET-123): remove feature

chore: update dependencies
chore(TICKET-123): update dependencies

ci: update CI/CD
ci(TICKET-123): update CI/CD

docs: update documentation
docs(TICKET-123): update documentation
```

## Database

### Local

You can start a local postgres instance if you wish by running:

```bash
  yarn run db
```

```bash
  yarn run db:down
```

### Remote

If you want to connect to the RDS instance, you have to setup an SSH tunnel.

1. Create a new SSH key pair

```bash
  ssh-keygen -t ed25519 -f <PRIVATE_KEY_NAME>
```

2. Upload your public key to the EC2 bastion. You probably have to ask someone with permissions to do this for you.
3. Add the following to your `~/.ssh/config` file. Change parameters to match your setup.

```
Host <WHATEVER_NAME>
    Hostname 63.32.108.33
    User ubuntu
    LocalForward 5432 eclaut-db-cluster.cluster-chwy06y88fg4.eu-west-1.rds.amazonaws.com:5432
    IdentityFile ~/.ssh/<PRIVATE_KEY_NAME>
```

4. Setup the tunnel by running `ssh <WHATEVER_NAME>`. This will create a tunnel and you can use `localhost:5432` as the
   DB host during development.
5. To connect to the DB you need to have the correct credentials. You can ask someone with permissions to provide you
   with the necessary information.


## Deployment

Since we only have AWS as a deployment target, we use the AWS CDK to deploy our services.

### Tools used

- [Jenkins](https://www.jenkins.io/)?
- [AWS CDK](https://aws.amazon.com/cdk/)
