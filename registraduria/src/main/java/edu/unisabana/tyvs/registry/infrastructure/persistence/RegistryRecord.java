package edu.unisabana.tyvs.registry.infrastructure.persistence;

public class RegistryRecord {
    private final int id;
    private final String name;
    private final int age;
    private final boolean isAlive;

    public RegistryRecord(int id, String name, int age, boolean isAlive) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.isAlive = isAlive;
    }

    public int getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    public boolean isAlive() {
        return isAlive;
    }
}
