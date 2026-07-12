FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build
RUN apk add --no-cache maven

COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
RUN addgroup -S ladux && adduser -S ladux -G ladux \
    && mkdir -p /app/uploads && chown -R ladux:ladux /app

COPY --from=builder /build/target/ladux.jar /app/ladux.jar

# Đảm bảo non-root user có quyền đọc jar và ghi uploads (volume có thể override owner)
RUN chown ladux:ladux /app/ladux.jar && chmod 755 /app/uploads

USER ladux
EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/ladux.jar"]