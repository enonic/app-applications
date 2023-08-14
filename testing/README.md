Users JavaScript UI Testing
===

### Building

Before trying to run tests, you need to verify that the following software are installed:

* Java 11 for building and running;
* node.js installed on system;
* Git installed on system;


Run ui-tests for app-applications:
  1.  gradlew w_testAppChrome - WDIO runner with chrome browser
  3.  gradlew testAppFirefox  - WDIO runner with firefox browser

Switch tests to FF in Github - replace  'w_testAppChrome' in 'gradle.yaml' to 

 run: ./gradlew :testing:testAppFirefox

