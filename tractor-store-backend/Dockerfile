# syntax=docker/dockerfile:1

# Imagen oficial: Maven + JDK 21 (evita apk maven + OpenJDK 25 en Alpine)
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY docker/maven-settings.xml /root/.m2/settings.xml
COPY pom.xml .

# Capa cacheable: dependencias antes del código fuente
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B -s /root/.m2/settings.xml dependency:go-offline -DskipTests || true

COPY src ./src

RUN --mount=type=cache,target=/root/.m2/repository \
    sh -c 'for attempt in 1 2 3; do \
      mvn -B -s /root/.m2/settings.xml -DskipTests package && exit 0; \
      echo "Maven build attempt $attempt failed, retrying..."; \
      sleep 20; \
    done; exit 1'

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S tractor && adduser -S tractor -G tractor
USER tractor
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-jar", "app.jar"]
