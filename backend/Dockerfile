FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
RUN addgroup -S auratech && adduser -S auratech -G auratech

COPY target/aura-tech.jar /app/aura-tech.jar

USER auratech
EXPOSE 8080

ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/aura-tech.jar"]
