package com.example.staycontrol.config;

import com.example.staycontrol.repository.HabitacionRepository;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class HabitacionConfig {
    @Bean
    public InitializingBean prepararHabitaciones(HabitacionRepository repository) {
        // Antes de aceptar HTTP. Si falla el índice, no servir escrituras sin unicidad.
        return repository::prepararIndices;
    }
}
