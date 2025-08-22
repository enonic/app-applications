# Enonic XP - Applications App

[![Actions Status](https://github.com/enonic/app-applications/workflows/Gradle%20Build/badge.svg)](https://github.com/enonic/app-applications/actions)
[![License][license-image]][license-url]
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/85183c43117642708e7f3af2db5fcdb2)](https://www.codacy.com/app/enonic/app-applications?utm_source=github.com&utm_medium=referral&utm_content=enonic/app-applications&utm_campaign=Badge_Grade)

Install and manage applications built on [Enonic XP](https://github.com/enonic/xp) platform.

## Usage

Just copy the built JAR files to the `$XP_HOME/deploy` folder, or use the `deploy` task from the Gradle:

```
./gradlew deploy
```

## Building

#### Default

Run the following command to build all applications with default options:

```
./gradlew build
```

With default build, applications will use the remote `lib-admin-ui` dependency and the environment variable won't be set.

#### Environment

To use the specific environment, you must set its value explicitly with `env` parameter (only `prod` or `dev`):

```
./gradlew build -Penv=dev
```

If the environment is set, the Gradle will look for the local `lib-admin-ui` and `xp` repositories in the parent folder of your `app-applications` repo. And if any present, will build them, along with building applications, instead of downloading the remote `lib-admin-ui` dependency.
The environment parameter will also be passed to `lib-admin-ui`.

Both environments are almost identical, except that building in the development environment will result in creating the DTS files, sourcemaps and other things, critical for the debugging.
The build itself may also be a bit slower sometimes.

<!-- Links -->

[license-url]: LICENSE.txt
[license-image]: https://img.shields.io/github/license/enonic/app-applications.svg "GPL 3.0"
