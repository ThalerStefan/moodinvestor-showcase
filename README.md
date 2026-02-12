# <img src="http://www.moodinvestor.com/favicon.ico" width="32" height="32" valign="middle"> MoodInvestor 3.0 – Portfolio Management & Psychological Analysis

[![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=java)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.9-brightgreen?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![MariaDB](https://img.shields.io/badge/Database-MariaDB-003545?style=for-the-badge&logo=mariadb)](https://mariadb.org/)
[![Docker](https://img.shields.io/badge/Infrastructure-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

**MoodInvestor** is a full-stack platform that combines traditional portfolio tracking with behavioral finance. The system correlates market data with the investor's emotional state to objectify decision-making processes.

---

## 🔒 Architectural Showcase Notice
This repository serves as a **technical architecture showcase**. 
* **Scope:** It demonstrates the project structure, API design, data modeling, and DevOps workflows.
* **IP Protection:** Core business logic (specifically the calculation algorithms for the PFG Index) has been abstracted or replaced by interfaces to protect intellectual property.
* **Code Quality:** All architectural patterns, security configurations, and package structures reflect the actual production environment.

---

## System Architecture & Engineering Approach

The application is designed as a high-performance **Thin-Client Architecture**. All business logic is encapsulated within a stateless Java backend to ensure maximum security and scalability.

### Backend (Core Engine)
* **Modern Java:** Leveraging Java 21 features for efficient data processing and modern syntax.
* **Spring Boot Ecosystem:** Utilizing Spring Boot 3.5.9 for RESTful APIs, security, and data handling.
* **Security & Auth:** Integration of **Clerk.js** for identity management. JWT-based authentication secures all endpoints.
* **Concurrency:** Event-driven architecture for live price updates via **WebSockets (STOMP)**.

### Data & Persistence
* **Data Modeling:** Normalized relational schema in MariaDB with optimized indexing for multi-user isolation.
* **SQL Views:** Implementation of database views (e.g., `vpositionuser`) to decouple complex calculations from the application layer.
* **Data Integrity:** Versioned database migrations managed via **Flyway**.

---

## Technical Key Features

* **Personal Fear & Greed Index (PFGI):** A proprietary algorithm that quantifies emotional parameters during the transaction process.
* **Real-Time Data Pipeline:** Automated synchronization with financial APIs (Binance/CoinGecko) every 18 seconds, including in-memory caching.
* **Multi-Tenancy:** Strict row-level data separation using global `clerkUserId` filtering.
* **CI/CD & DevOps:** Fully automated deployment pipeline via **GitHub Actions** onto a Docker-based infrastructure (Hetzner Cloud).

---

## Tech Stack Detail

| Layer | Technologies |
| :--- | :--- |
| **Languages** | Java 21, JavaScript (ES6+), SQL |
| **Frameworks** | Spring Boot 3.5.9, Spring Security, Hibernate |
| **Frontend** | Vanilla JS, Vite 7, Bootstrap 5, Charts.js |
| **Infrastructure** | Docker, Nginx, MariaDB, GitHub Actions |
| **Tools** | Maven, JUnit 5, Mockito, Flyway |

---

## Quality Assurance
* **Testing:** Comprehensive unit and integration tests using JUnit 5 and Mockito to validate architectural integrity and service logic.
* **Clean Code:** Strict adherence to SOLID principles and Separation of Concerns (SoC).
* **Monitoring:** Real-time health monitoring via Spring Actuator endpoints.

---

## About the Project
Developed by **Stefan Thaler** as a certified capstone project for the **Junior Developer** program (Completed: Jan 08, 2026). This project demonstrates the ability to translate complex functional requirements into a robust, production-ready software architecture.

---

## Live Demo & Access
The project is live at [www.moodinvestor.com](http://www.moodinvestor.com). 

> **Note for Recruiters:** As the project is currently in a controlled development phase, public registration is **restricted**. I am happy to provide a personal registration link for a full review of the application's functionality. Please send a brief request to: **info@stefan-thaler.at**

---
© 2026 Stefan Thaler – Junior Developer
