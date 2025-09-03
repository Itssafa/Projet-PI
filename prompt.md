## Immediate Task Context

You are continuing work on my real estate platform project. Please pick up from where we left off with the following tasks:

* **Annonce Creation Form**: Complete a visually appealing property (annonce) creation form with smooth UX.
* **Dashboard Display**: Enhance property/annonce display cards in the dashboard.
* **Image Upload**: Implement image upload with real-time preview.
* **Validation & UX Polish**: Ensure proper input validation and add user experience refinements.
* **Annonce Functionality**:

  * Allow adding properties.
  * Display created annonces in cards on the page.
  * Each card should support viewing details.
  * When adding an annonce, a modal/card opens (with blurred background), and closes automatically once the annonce is successfully created.
* **Search**: Implement advanced search functionality (filters, keywords, etc.).

## Future Architecture Direction

The project is currently **monolithic**, but I plan to migrate it to a **microservices architecture**:

* **User Service** (port `8080`): Handles all user-related entities.
* **Annonce Service** (port `8081`): Manages all property listing functionality.
* **Service Communication**: REST API (not direct database relationships).

## Key Technical Decisions

* **Entity References**: Use **ID-based references** instead of direct JPA relationships.
* **Communication**: Services will interact exclusively through **REST APIs**.
* **Scalability Goal**: Each service should be independently maintainable, deployable, and testable.

## What I Need From You in Future Sessions

When I start a new conversation, this document should give you immediate context. From here, please:

1. Recall the **current project structure and entities**.
2. Understand the **microservices migration plan**.
3. Respect **technical decisions** already made (ID references, REST communication).
4. Ask me for **any specific details** you need to continue effectively (e.g., current code snippets, entity definitions, API contracts, etc.).
5. Continue development with a focus on **both backend (services, APIs, validation)** and **frontend (forms, UX, cards, search)**.

---

👉 Write the prompt in backend-microservice.md
