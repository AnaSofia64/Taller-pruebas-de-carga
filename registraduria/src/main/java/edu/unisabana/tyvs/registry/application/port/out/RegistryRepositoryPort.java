package edu.unisabana.tyvs.registry.application.port.out;

import edu.unisabana.tyvs.registry.infrastructure.persistence.RegistryRecord;

import java.util.Optional;

/**
 * Puerto de salida para persistencia de registros.
 * Define las operaciones necesarias para el caso de uso Registry.
 * No debe tener dependencias hacia JDBC u otras librerías de infraestructura.
 */
public interface RegistryRepositoryPort {

    /** Crea la tabla/estructura inicial (solo útil en pruebas con H2). */
    void initSchema() throws Exception;

    /** Verifica si un registro existe por ID. */
    boolean existsById(int id) throws Exception;

    /** Persiste un nuevo registro en la base de datos. */
    void save(int id, String name, int age, boolean isAlive) throws Exception;

    /** Busca un registro por su ID. */
    Optional<RegistryRecord> findById(int id) throws Exception;

    /** Borra todos los registros (útil para limpiar entre pruebas). */
    void deleteAll() throws Exception;
}
