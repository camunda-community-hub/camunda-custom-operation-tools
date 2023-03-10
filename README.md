[![Community Extension](https://img.shields.io/badge/Community%20Extension-An%20open%20source%20community%20maintained%20project-FF4700)](https://github.com/camunda-community-hub/community)
![Compatible with: Camunda Platform 8](https://img.shields.io/badge/Compatible%20with-Camunda%20Platform%208-0072Ce)
[![](https://img.shields.io/badge/Lifecycle-Incubating-blue)](https://github.com/Camunda-Community-Hub/community/blob/main/extension-lifecycle.md#incubating-)

# Camunda Platform 8 custom Operate using React, Java and Spring Boot

This project is made to provide an example of custom Operate based on bpmn-js, Operate APIs and Zeebe client. The idea is to evaluate complexity to build custom solution when Operate doesn't fit completly.

This example show how a customer could build a 4-eyes principle mechanism where a user request process modifications (state, variables) and another user has to validate the request before it's applied in Zeebe's engine.

:information_source: This is a community project that you can use during exploration phase, PoCs, trainings, etc. It's **not production ready** and you should carefully review it before using it in production.

## Repository content

This repository contains a Java application built with Spring Boot and Zeebe Spring client to act as a connector runtime for Camunda Platform 8.

It also contains a [React front-end](src/main/front/) that you can execute independently (npm run start) or serve from the spring boot application (you should first run a `mvnw package` at the project root).


## First steps with the application

The application requires a running Zeebe engine (SaaS or Self Managed).
You can run Zeebe locally using the instructions :
[recommended deployment options for Camunda Platform](https://docs.camunda.io/docs/self-managed/platform-deployment/#deployment-recommendation.).

Run the application via
```
./mvnw spring-boot:run
```

UI [http://localhost:8080/](http://localhost:8080/)
Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

The first time you use the project, you should be able to connect with demo/demo to do all operations.

When you start the application for the first time, an "ACME" organization is created for you with a single user demo/demo with all rights.
Roles are the followings :
- viewVariables : can view process variables
- modifVariables : only available if you have viewVariables. Allow to modify variables
- modifState : can terminate/activate instance flownodes
- approveModif : can approve other user requests
- autoApproveModif : depends on approveModif. Can approve  his own requests

You can create other users with a subset of these permissions to have different behaviours.

## Secure the app with keycloak
If you want to secure your app with keycloak, you can set the keycloak.enabled to true and uncomment the properties in the application.yaml file.

```yaml
keycloak:
  enabled: true
  auth-server-url: http://localhost:18080/auth
  realm: camunda-platform
  resource: CustomOperate
  public-client: true
  principal-attribute: preferred_username
```

> :information_source: To use the application with Keycloak, create the CustomOperate client and roles listed above and assign them to (at least) one user.

## Build and run the image

```
docker build -t camunda-community/custom-operate .
```
```
docker run -p 8888:8080 camunda-community/custom-operate
```

## Time consumption
The current result was developped in 18 hours.
