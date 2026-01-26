# MoodInvestor 3.0 – Frontend Showcase

This repository is a simplified showcase of the **MoodInvestor** web frontend.  The file and folder structure of the
original project has been preserved—including components, pages, routes and utilities—so that you can understand how
the application is organised.  All sensitive configuration and client‑side business logic has been removed.

## Key Points

* **Service Modules** (`app/services`): these modules normally contain API calls, authentication helpers and
  client‑side computations.  In this showcase, the function bodies have been replaced with a single comment
  (`// Logic abstracted for showcase purposes.`) while keeping their signatures intact.  This highlights the
  module boundaries without exposing the underlying implementation.
* **Configuration** (`config.json`, `config.template.json`): any clerk keys or other secrets have been replaced
  with the placeholder `REDACTED_FOR_SHOWCASE`.
* **Components and Pages** (`app/components`, `app/pages`): the Vue components and pages remain unchanged,
  illustrating the component hierarchy and routing.

Use this repository as a reference for the high‑level frontend architecture.  It shows where key pieces of logic live
while abstracting away proprietary client code and third‑party integrations.