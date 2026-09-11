package com.example.staycontrol.repository;

import com.example.staycontrol.model.Usuario;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public class UsuarioRepository {
    private final MongoTemplate mongo;
    public UsuarioRepository(MongoTemplate mongo) { this.mongo = mongo; }

    public Optional<Usuario> buscar(String email) {
        return Optional.ofNullable(mongo.findById(email, Usuario.class));
    }

    public Usuario insertar(Usuario usuario) {
        // El email normalizado es _id: unicidad atómica sin save ni sobreescritura.
        return mongo.insert(usuario);
    }
}
