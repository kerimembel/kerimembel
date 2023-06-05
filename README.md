```kotlin
package Kerim.Embel

class About : Me() {

    fun getCurrentWorkplace(): Workplace {
        return Workplace.builder()
            .company("Bayzat")
            .position("Software Engineer")
            .build()
    }

    fun getInterests(): List<Interest> {
        return listOf(
            Interest("Amateur Music Producing"),
            Interest("Trading"),
            Interest("Traveling"),
            Interest("Camping"),
            Interest("Coding")
        )
    }
}
```
