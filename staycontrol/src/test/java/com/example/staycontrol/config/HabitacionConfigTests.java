package com.example.staycontrol.config;

import com.example.staycontrol.repository.HabitacionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HabitacionConfigTests {
    @Test
    void preparaIndicesDuranteLaInicializacion() throws Exception {
        var repository = mock(HabitacionRepository.class);
        new HabitacionConfig().prepararHabitaciones(repository).afterPropertiesSet();
        verify(repository).prepararIndices();
    }

    @Test
    void noSilenciaElFalloAlCrearElIndice() {
        var repository = mock(HabitacionRepository.class);
        doThrow(new DataAccessResourceFailureException("sin permisos")).when(repository).prepararIndices();
        var inicializador = new HabitacionConfig().prepararHabitaciones(repository);
        assertThrows(DataAccessResourceFailureException.class, inicializador::afterPropertiesSet);
    }
}
