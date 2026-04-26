package edu.unisabana.tyvs.registry.domain.model.rq;

public class PersonDTO {
    private String name;
    private int id;
    private int age;
    private String gender;
    private boolean alive;

    public PersonDTO() {
    }

    public PersonDTO(String name, int id, int age, String gender, boolean alive) {
        this.name = name;
        this.id = id;
        this.age = age;
        this.gender = gender;
        this.alive = alive;
    }

    public String getName() {
        return name;
    }

    public int getId() {
        return id;
    }

    public int getAge() {
        return age;
    }

    public String getGender() {
        return gender;
    }

    public boolean isAlive() {
        return alive;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setId(int id) {
        this.id = id;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public void setAlive(boolean alive) {
        this.alive = alive;
    }
}
