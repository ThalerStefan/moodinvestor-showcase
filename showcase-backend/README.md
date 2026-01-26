# MoodInvestor 3.0 – Backend Showcase

This repository is a stripped‑down showcase of the **MoodInvestor** backend architecture.  It preserves the full
package and class structure of the original Spring Boot project—controllers, services, repositories, models and DTOs—so
that you can see how the application is organised.  However, all business logic has been removed to protect the
proprietary algorithms and integrations that make up the core of the product.

## How to Read This Repository

* **Models and DTOs** (`src/main/java/at/stefan/moodinvestor/model` and `dto`): the domain objects and data transfer
  objects are provided unchanged.
* **Controllers** (`controller`): REST controller classes with method signatures intact.  Each method body has been
  replaced with a stub that throws an `UnsupportedOperationException`.
* **Services** (`service`): service classes show the public method signatures and now include succinct Javadoc
  comments explaining the high‑level purpose of each method.  The original implementations have been replaced with
  stubs that throw an exception.
* **Configuration** (`src/main/resources`): YAML and other config files are included but any passwords, API keys or
  secrets have been replaced by the placeholder `REDACTED_FOR_SHOWCASE`.

This showcase is intended for architectural reference only.  It demonstrates the layered design—controllers
delegating to services, services relying on repositories and models—without revealing the intellectual property in
the business logic or external API integrations.