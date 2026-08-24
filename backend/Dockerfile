# Stage 1: Build with Maven + JDK 21
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

# Maven is already installed – do NOT install it again

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run with JDK (instead of JRE, to use local image)
FROM eclipse-temurin:25-jdk
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]