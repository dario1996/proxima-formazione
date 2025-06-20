package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.security.user.name=test",
    "spring.security.user.password=test",
    "spring.liquibase.enabled=false"
})
class DemoApplicationTests {

    @Test
    void contextLoads() {
    }
}