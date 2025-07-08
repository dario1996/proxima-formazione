package com.example.dataprocessor.repository;

import com.example.dataprocessor.entity.LearningDataRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface LearningDataRepository extends JpaRepository<LearningDataRecord, Long> {

    // Find records by processing status
    List<LearningDataRecord> findByProcessed(Boolean processed);

    // Find unprocessed records
    List<LearningDataRecord> findByProcessedFalse();

    // Find processed records
    List<LearningDataRecord> findByProcessedTrue();

    // Find unprocessed records
    default List<LearningDataRecord> findUnprocessed() {
        return findByProcessed(false);
    }

    // Count by processing status
    long countByProcessedTrue();

    long countByProcessedFalse();

    // Find by source file to check if already processed
    List<LearningDataRecord> findBySourceFile(String sourceFile);

    // Check if file has been processed before
    boolean existsBySourceFile(String sourceFile);

    // Find records by email
    List<LearningDataRecord> findByEmail(String email);

    // Find records by email and content name (potential duplicates)
    Optional<LearningDataRecord> findByEmailAndContentName(String email, String contentName);

    // Count unprocessed records
    long countByProcessed(Boolean processed);

    // Find records created within time range
    @Query("SELECT l FROM LearningDataRecord l WHERE l.createdAt BETWEEN :startDate AND :endDate")
    List<LearningDataRecord> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    // Find records for recent processing (last N hours)
    @Query("SELECT l FROM LearningDataRecord l WHERE l.processedAt >= :since ORDER BY l.processedAt DESC")
    List<LearningDataRecord> findRecentlyProcessed(@Param("since") LocalDateTime since);

    // Statistics query
    @Query("SELECT COUNT(l), l.processed FROM LearningDataRecord l GROUP BY l.processed")
    List<Object[]> getProcessingStatistics();
}