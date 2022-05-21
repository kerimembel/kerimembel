```java
package Kerim.Embel;

import java.util.List;

public class About extends Me{

    public Workplace getCurrentWorkplace() {
        return Workplace.builder()
                .company("Garanti BBVA Technology")
                .position("Associate Ⅰ Software Engineer")
                .build();
    }

    public List<Skill> getSkills() {
        return List.of(
                new Skill("Java - Spring Boot"),
                new Skill("Python - Django, Flask"),
                new Skill("SQL - MySQL, Oracle, NoSQL"),
                new Skill("OOP - SOLID Principles"),
                new Skill("Design Patterns - Creational, Structural, Behavioral"),
                new Skill("Git - GitHub, Bitbucket"),
                new Skill("Agile Methodologies - Scrum, Kanban"),
                new Skill("Software Architecture - Monolith, Microservices"),
                new Skill("Unit Test - JUnit, Mockito"),
                new Skill("CI/CD - Jenkins"),
                new Skill("Container Technologies - Docker Kubernetes, OpenShift"),
                new Skill("Cloud Technologies - AWS"),
                new Skill("TDD - JUnit, Mockito, TestNG")
            );
    }

    public List<Language> getLanguages() {
        return List.of(
                new Language("Turkish", "Native"),
                new Language("English", "Fluent")
        );
    }

    public Education getEducation() {
        return Education.builder()
                .school("Dokuz Eylul University")
                .degree("Bachelor of Engineering")
                .major("Computer Engineering")
                .graduation("2020")
                .build();
    }


}
```
