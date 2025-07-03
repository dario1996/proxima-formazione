package com.example.batchprocessor.service;

import com.example.batchprocessor.model.LearningDataRecord;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service to transform CSV data into formats compatible with the main
 * application entities
 * This service prepares data for eventual integration with Dipendente, Corso,
 * Assegnazione, and Piattaforma entities
 */
@Service
public class DataTransformationService {

    private static final DateTimeFormatter[] DATETIME_FORMATTERS = {
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),
            DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss"),
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"),
            DateTimeFormatter.ISO_LOCAL_DATE_TIME
    };

    /**
     * Transforms a LearningDataRecord into a structure that can be mapped to
     * existing entities
     */
    public TransformedLearningData transformForDatabaseIntegration(LearningDataRecord record) {
        TransformedLearningData transformed = new TransformedLearningData();

        // Employee data (maps to Dipendente entity)
        transformed.setEmployeeEmail(record.getEmail());
        transformed.setEmployeeName(extractFirstName(record.getNome()));
        transformed.setEmployeeLastName(extractLastName(record.getNome()));
        transformed.setEmployeeExternalId(record.getIdUtenteUnivoco());

        // Course data (maps to Corso entity)
        transformed.setCourseName(record.getNomeContenuto());
        transformed.setCourseExternalId(record.getIdContenuto() != null ? record.getIdContenuto().toString() : null);
        transformed.setCourseProvider(record.getFornitoreContenuto());
        transformed.setCourseType(record.getTipoContenuto());

        // Platform data (maps to Piattaforma entity)
        transformed.setPlatformName(record.getFornitoreContenuto());

        // Assignment data (maps to Assegnazione entity)
        transformed.setCompletionPercentage(record.getPercentualeCompletamentoAsDecimal());
        transformed.setHoursCompleted(convertTimeStringToDecimal(record.getOreVisione()));
        transformed.setStartDate(parseDateTime(record.getInizioPstPdt()));
        transformed.setLastViewDate(parseDateTime(record.getUltimaVisualizzazionePstPdt()));
        transformed.setCompletionDate(parseDateTime(record.getCompletamentoPstPdt()));

        // Extended data (not in current entities but available for future use)
        transformed.setTotalRatings(record.getValutazioniTotaliAsInteger());
        transformed.setCompletedRatings(record.getNumeroValutazioniCompletateAsInteger());
        transformed.setSkills(parseSkillsList(record.getCompetenze()));
        transformed.setParentCourseName(record.getNomeCorso());
        transformed.setParentCourseId(record.getIdCorso());
        transformed.setGroupsAtInteraction(parseGroupsList(record.getGruppiMomentoInterazione()));
        transformed.setCurrentGroups(parseGroupsList(record.getGruppiIscrizioniAttuali()));

        return transformed;
    }

    private String extractFirstName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return null;
        }
        String[] parts = fullName.trim().split("\\s+");
        return parts[0];
    }

    private String extractLastName(String fullName) {
        if (fullName == null || fullName.trim().isEmpty()) {
            return null;
        }
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length > 1) {
            return String.join(" ", Arrays.copyOfRange(parts, 1, parts.length));
        }
        return "";
    }

    private BigDecimal convertTimeStringToDecimal(String timeString) {
        if (timeString == null || timeString.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        try {
            String[] parts = timeString.split(":");
            if (parts.length == 3) {
                double hours = Double.parseDouble(parts[0]);
                double minutes = Double.parseDouble(parts[1]);
                double seconds = Double.parseDouble(parts[2]);

                double totalHours = hours + (minutes / 60.0) + (seconds / 3600.0);
                return BigDecimal.valueOf(totalHours).setScale(2, BigDecimal.ROUND_HALF_UP);
            }
        } catch (NumberFormatException e) {
            System.err.println("Error converting time string to decimal: " + timeString);
        }

        return BigDecimal.ZERO;
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null || dateTimeStr.trim().isEmpty()) {
            return null;
        }

        for (DateTimeFormatter formatter : DATETIME_FORMATTERS) {
            try {
                return LocalDateTime.parse(dateTimeStr.trim(), formatter);
            } catch (DateTimeParseException e) {
                // Try next formatter
            }
        }

        System.err.println("Could not parse date time: " + dateTimeStr);
        return null;
    }

    private List<String> parseSkillsList(String skillsString) {
        if (skillsString == null || skillsString.trim().isEmpty()) {
            return List.of();
        }

        return Arrays.stream(skillsString.split("[;,]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private List<String> parseGroupsList(String groupsString) {
        if (groupsString == null || groupsString.trim().isEmpty()) {
            return List.of();
        }

        return Arrays.stream(groupsString.split("[;,|]"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    /**
     * Data structure that represents transformed learning data ready for database
     * integration
     */
    public static class TransformedLearningData {
        // Employee data
        private String employeeEmail;
        private String employeeName;
        private String employeeLastName;
        private String employeeExternalId;

        // Course data
        private String courseName;
        private String courseExternalId;
        private String courseProvider;
        private String courseType;

        // Platform data
        private String platformName;

        // Assignment data
        private BigDecimal completionPercentage;
        private BigDecimal hoursCompleted;
        private LocalDateTime startDate;
        private LocalDateTime lastViewDate;
        private LocalDateTime completionDate;

        // Extended data
        private Integer totalRatings;
        private Integer completedRatings;
        private List<String> skills;
        private String parentCourseName;
        private String parentCourseId;
        private List<String> groupsAtInteraction;
        private List<String> currentGroups;

        // Getters and setters
        public String getEmployeeEmail() {
            return employeeEmail;
        }

        public void setEmployeeEmail(String employeeEmail) {
            this.employeeEmail = employeeEmail;
        }

        public String getEmployeeName() {
            return employeeName;
        }

        public void setEmployeeName(String employeeName) {
            this.employeeName = employeeName;
        }

        public String getEmployeeLastName() {
            return employeeLastName;
        }

        public void setEmployeeLastName(String employeeLastName) {
            this.employeeLastName = employeeLastName;
        }

        public String getEmployeeExternalId() {
            return employeeExternalId;
        }

        public void setEmployeeExternalId(String employeeExternalId) {
            this.employeeExternalId = employeeExternalId;
        }

        public String getCourseName() {
            return courseName;
        }

        public void setCourseName(String courseName) {
            this.courseName = courseName;
        }

        public String getCourseExternalId() {
            return courseExternalId;
        }

        public void setCourseExternalId(String courseExternalId) {
            this.courseExternalId = courseExternalId;
        }

        public String getCourseProvider() {
            return courseProvider;
        }

        public void setCourseProvider(String courseProvider) {
            this.courseProvider = courseProvider;
        }

        public String getCourseType() {
            return courseType;
        }

        public void setCourseType(String courseType) {
            this.courseType = courseType;
        }

        public String getPlatformName() {
            return platformName;
        }

        public void setPlatformName(String platformName) {
            this.platformName = platformName;
        }

        public BigDecimal getCompletionPercentage() {
            return completionPercentage;
        }

        public void setCompletionPercentage(BigDecimal completionPercentage) {
            this.completionPercentage = completionPercentage;
        }

        public BigDecimal getHoursCompleted() {
            return hoursCompleted;
        }

        public void setHoursCompleted(BigDecimal hoursCompleted) {
            this.hoursCompleted = hoursCompleted;
        }

        public LocalDateTime getStartDate() {
            return startDate;
        }

        public void setStartDate(LocalDateTime startDate) {
            this.startDate = startDate;
        }

        public LocalDateTime getLastViewDate() {
            return lastViewDate;
        }

        public void setLastViewDate(LocalDateTime lastViewDate) {
            this.lastViewDate = lastViewDate;
        }

        public LocalDateTime getCompletionDate() {
            return completionDate;
        }

        public void setCompletionDate(LocalDateTime completionDate) {
            this.completionDate = completionDate;
        }

        public Integer getTotalRatings() {
            return totalRatings;
        }

        public void setTotalRatings(Integer totalRatings) {
            this.totalRatings = totalRatings;
        }

        public Integer getCompletedRatings() {
            return completedRatings;
        }

        public void setCompletedRatings(Integer completedRatings) {
            this.completedRatings = completedRatings;
        }

        public List<String> getSkills() {
            return skills;
        }

        public void setSkills(List<String> skills) {
            this.skills = skills;
        }

        public String getParentCourseName() {
            return parentCourseName;
        }

        public void setParentCourseName(String parentCourseName) {
            this.parentCourseName = parentCourseName;
        }

        public String getParentCourseId() {
            return parentCourseId;
        }

        public void setParentCourseId(String parentCourseId) {
            this.parentCourseId = parentCourseId;
        }

        public List<String> getGroupsAtInteraction() {
            return groupsAtInteraction;
        }

        public void setGroupsAtInteraction(List<String> groupsAtInteraction) {
            this.groupsAtInteraction = groupsAtInteraction;
        }

        public List<String> getCurrentGroups() {
            return currentGroups;
        }

        public void setCurrentGroups(List<String> currentGroups) {
            this.currentGroups = currentGroups;
        }
    }
}