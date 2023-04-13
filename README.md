```java
package Kerim.Embel;

public class About extends Me {

    public Workplace getCurrentWorkplace() {
        return Workplace.builder()
                .company("Bayzat")
                .position("Software Engineer").build();
    }

    public List<Interest> getInterests() {
        return List.of(
                new Interest("Decentralized Applications"),
                new Interest("Amateur Music Producing"),
                new Interest("Traveling"),
                new Interest("Camping"),
                new Interest("Cycling"),
                new Interest("Coding")
        );
    }
}
```
