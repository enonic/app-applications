Users JavaScript UI Testing
===

### Building

Before trying to run tests, you need to verify that the following software are installed:

* Java 11 for building and running;
* node.js installed on system;
* Git installed on system;
* Chrome browser installed on system.

Run tests for app-admin-home.
go to '/testing' folder and run:
  1. `gradle testApplicationsApp
  2. `gradle testApplicationsAppLocally  --project-cache-dir d:/cache
  3.  gradle testApplicationsAppFirefox

Switch tests to FF in Github - replace  'testApplicationsApp' in 'gradle.yaml'
 run: ./gradlew :testing:testApplicationsAppFirefox

