package com.example.staycontrol.service;

import org.bson.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Service
public class MongoConnectionService {

    private static final Logger log = LoggerFactory.getLogger(MongoConnectionService.class);

    private final MongoTemplate mongoTemplate;

    public MongoConnectionService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public void verifyConnection() {
        Document response;
        try {
            response = mongoTemplate.executeCommand(new Document("ping", 1));
        } catch (DataAccessException exception) {
            // No incluir credenciales ni la URI en los mensajes de error.
            throw new IllegalStateException(
                "No se pudo conectar a MongoDB. Revisa las credenciales, la red y la IP autorizada en Atlas."
            );
        }

        Object ok = response.get("ok");
        if (!(ok instanceof Number number) || number.doubleValue() != 1.0) {
            throw new IllegalStateException("MongoDB no confirmó el ping de conexión.");
        }
        log.info("Conexión a MongoDB verificada correctamente (ping OK).");
    }
}
