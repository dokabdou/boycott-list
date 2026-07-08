# Stage 1: Build with JDK 21 + Maven
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Install Maven
RUN apt update && apt install -y maven && rm -rf /var/lib/apt/lists/*

COPY pom.xml .
# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the app with JRE 21
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]