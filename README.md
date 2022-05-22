```java
package Kerim.Embel;

public class About extends Me {

    public Workplace getCurrentWorkplace() {
        return Workplace.builder()
                .company("Garanti BBVA Technology")
                .position("Associate Ⅰ Software Engineer").build();
    }

    public List<Skill> getSkills() {
        return List.of(
                new Skill("Java - Spring Boot"),
                new Skill("Python - Django, Flask"),
                new Skill("OOP - SOLID Principles"),
                new Skill("SQL - MySQL, Oracle, NoSQL"),
                new Skill("TDD - JUnit, Mockito, pytest"),
                new Skill("Design Patterns - Creational, Structural, Behavioral"),
                new Skill("Cloud Technologies - AWS"),
                new Skill("Resilience Patterns - Circuit Breaker, Retry, Timeout"),
                new Skill("Architectural Styles - Microservices, Monolith"),
                new Skill("Asynchronous Communication - RabbitMQ, Kafka"),
                new Skill("Agile Methodologies - Scrum, Kanban"),
                new Skill("Git - GitHub, Bitbucket"),
                new Skill("CI/CD - Jenkins"),
                new Skill("Container Technologies - Docker, Kubernetes, OpenShift")
        );
    }

    public List<Language> getLanguages() {
        return List.of(
                Language.builder()
                        .name("Turkish")
                        .level("Native").build(),
                Language.builder()
                        .name("English")
                        .level("Fluent").build()
        );
    }

    public Education getEducation() {
        return Education.builder()
                .school("Dokuz Eylul University")
                .degree("Bachelor of Engineering")
                .major("Computer Engineering")
                .graduation("2020").build();
    }

    public List<Interest> getInterests() {
        return List.of(
                new Interest("Decentralized Applications"),
                new Interest("Amateur Music Producing"),
                new Interest("Traveling"),
                new Interest("Camping"),
                new Interest("Cycling"),
                new Interest("Coding"),
                new Interest("NFT")
        );
    }
}

```
