FROM openjdk:25-slim

VOLUME [ "/tmp" ]

WORKDIR /app

COPY backend/target/omreznina-0.0.1-SNAPSHOT.war app.war 

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "./app.war"]
