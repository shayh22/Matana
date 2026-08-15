# Matana

This project is a Spring Boot-based RESTful API for managing movie tickets, including users, movies, showtimes, and ticket bookings.

> **Also in this repo:** `index.html` — a standalone Hebrew gift-amount calculator ("כמה לתת במתנה?") served via GitHub Pages. See [README-gift-calculator.md](README-gift-calculator.md)

## Features

- User authentication and role-based access control (Admin, Customer)
- CRUD operations for movies, showtimes, and tickets
- Secure JWT-based authentication
- Database persistence using JPA and PostgreSQL
- API documentation using Swagger
- **JUnit & MockMvc** for testing

## Tech Stack

- **Spring Boot 3** (Web, Security, Data JPA)
- **PostgreSQL** as the database
- **Lombok** for reducing boilerplate code
- **Spring Security** for authentication & authorization
- **Swagger/OpenAPI** for API documentation
- **JUnit & MockMvc** for testing

## Installation & Setup

### Prerequisites

- Java 17+
- Maven
- PostgreSQL (Ensure a database is created and update `application.properties` accordingly)

### Clone the Repository

```sh
$ git clone https://github.com/shayh22/matana.git
$ cd matana
```

### Configure Database

Update the `src/main/resources/application.properties` file with your database details:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/movie_ticket_db
spring.datasource.username=your_db_user
spring.datasource.password=your_db_password
spring.jpa.hibernate.ddl-auto=update
```

### Build and Run

```sh
$ mvn clean install
$ mvn spring-boot:run
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Authenticate user and get JWT token

### Movies

- `GET /api/movies` - Retrieve all movies
- `POST /api/movies` (Admin) - Add a new movie
- `PUT /api/movies/{id}` (Admin) - Update movie details
- `DELETE /api/movies/{id}` (Admin) - Remove a movie

### Showtimes

- `GET /api/showtimes` - List all showtimes
- `POST /api/showtimes` (Admin) - Create a showtime

### Tickets

- `GET /api/tickets` (Authenticated users) - View user tickets
- `POST /api/tickets/book` (Authenticated users) - Book a ticket

## Changes & Updates

- **User object replaced with userId** in `Ticket` entity for better efficiency.
- **Improved role-based access control** in controllers.
- **Optimized test cases** to ensure proper isolation.

## Running Tests

```sh
$ mvn test
```

## Deployment

To deploy the app using Docker:

```sh
$ docker build -t matana .
$ docker run -p 8080:8080 matana
```

## Contributing

Feel free to fork this repository and submit pull requests for improvements.

## License

This project is licensed under the MIT License.
