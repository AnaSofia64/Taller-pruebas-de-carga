package edu.unisabana.tyvs.registry.application.usecase;

import edu.unisabana.tyvs.registry.application.port.out.RegistryRepositoryPort;
import edu.unisabana.tyvs.registry.domain.model.Person;
import edu.unisabana.tyvs.registry.domain.model.RegisterResult;

public class Registry {

    private final RegistryRepositoryPort repo;

    // <<< ESTE es el constructor que falta >>>
    public Registry(RegistryRepositoryPort repo) {
        this.repo = repo;
    }

    // Si tenías un constructor vacío y lo quieres conservar, puedes dejarlo,
    // pero el IT usará SIEMPRE el constructor con puerto.
    public Registry() {
        this.repo = null;
    }

    public RegisterResult registerVoter(Person p) {
        if (p == null)
            return RegisterResult.INVALID;
        if (p.getId() <= 0)
            return RegisterResult.INVALID;
        if (!p.isAlive())
            return RegisterResult.DEAD;
        if (p.getAge() < 18)
            return RegisterResult.UNDERAGE;

        try {
            if (repo.existsById(p.getId()))
                return RegisterResult.DUPLICATED;
            repo.save(p.getId(), p.getName(), p.getAge(), p.isAlive());
            return RegisterResult.VALID;
        } catch (Exception e) {
            // MIENTRAS DIAGNOSTICAMOS: muestra el tipo y el mensaje real
            throw new IllegalStateException("Persistencia: " + e.getClass().getSimpleName() + " - " + e.getMessage(),
                    e);
        }
    }

}
