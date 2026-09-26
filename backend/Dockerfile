FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy the pom.xml files for dependency resolution
COPY pom.xml .
COPY deriva-domain/pom.xml deriva-domain/
COPY deriva-application/pom.xml deriva-application/
COPY deriva-market/pom.xml deriva-market/
COPY deriva-trading/pom.xml deriva-trading/
COPY deriva-learning/pom.xml deriva-learning/
COPY deriva-risk/pom.xml deriva-risk/
COPY deriva-persistence/pom.xml deriva-persistence/
COPY deriva-api/pom.xml deriva-api/
COPY deriva-bootstrap/pom.xml deriva-bootstrap/

# Copy the source code
COPY . .

# Build the application
# We skip tests in the Docker build to speed up deployment, tests run in CI
RUN ./mvnw clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
EXPOSE 8080

# Copy the packaged jar from the builder stage
COPY --from=builder /app/deriva-bootstrap/target/deriva-bootstrap-*.jar app.jar

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
