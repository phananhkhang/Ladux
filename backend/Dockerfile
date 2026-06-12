FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build
RUN apk add --no-cache maven

COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
RUN addgroup -S auratech && adduser -S auratech -G auratech \
    && mkdir -p /app/uploads && chown -R auratech:auratech /app

COPY --from=builder /build/target/aura-tech.jar /app/aura-tech.jar

# Đảm bảo non-root user có quyền đọc jar và ghi uploads (volume có thể override owner)
RUN chown auratech:auratech /app/aura-tech.jar && chmod 755 /app/uploads

USER auratech
EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/aura-tech.jar"]