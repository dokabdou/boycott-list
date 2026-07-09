# Stage 1: Build with Maven + JDK 21
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Maven is already installed – do NOT install it again

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run with JRE 21 (because your pom.xml now uses Java 21)
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
