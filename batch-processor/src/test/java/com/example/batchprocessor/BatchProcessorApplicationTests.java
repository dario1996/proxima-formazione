package com.example.batchprocessor;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
        "spring.batch.job.enabled=false", // Disable automatic job execution in tests
        "logging.level.root=WARN" // Reduce log noise in tests
})
class BatchProcessorApplicationTests {

    @Test
    void contextLoads() {
        // Test that the Spring context loads successfully
    }
}