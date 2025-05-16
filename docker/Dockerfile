FROM openjdk:25-slim

VOLUME [ "/tmp" ]

WORKDIR /app

COPY backend/target/omreznina-0.0.1-SNAPSHOT.jar app.jar 

COPY firebase.json /app/firebase.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/firebase.json

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "./app.jar"]
