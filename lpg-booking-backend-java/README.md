# LPG Cylinder Booking & Distribution System (Java Spring Boot Microservices)

A cloud-native, microservices-based utility and logistics management system for LPG cylinder refills booking, distributor inventory management, digital payment verify, and doorstep delivery OTP validation.

---

## 1. System Architecture

The backend is built as a distributed microservices platform coordinate via Service Discovery and a centralized API Gateway.

```mermaid
graph TD
    Client[React Frontend / Vite] -->|Requests on Port 5000| Gateway[API Gateway: Port 5000]
    
    subgraph Discovery Server
        Eureka[Eureka Discovery Server: Port 8761]
    end

    subgraph Downstream Microservices
        Gateway -->|Route: /api/auth/**| AuthService[Auth & Identity Service: Port 8081]
        Gateway -->|Route: /api/customer/**, /api/booking/**, /api/payment/**| BookingService[Booking & Payment Service: Port 8082]
        Gateway -->|Route: /api/distributor/**, /api/deliveryagent/**| DistributionService[Logistics Service: Port 8083]
    end

    subgraph Data Tier (Database-per-Service)
        AuthService --> AuthDB[(MySQL: lpg_auth)]
        BookingService --> BookingDB[(MongoDB: lpg_bookings)]
        DistributionService --> DistDB[(MySQL: lpg_distribution)]
    end

    subgraph Messaging Broker
        AuthService -->|Publish Events| RabbitMQ((RabbitMQ Broker))
        BookingService -->|Publish Events| RabbitMQ
        RabbitMQ -->|Consume events| NotificationService[Notification Service: Port 8084]
    end
```

### Decoupled Components
1. **`api-gateway` (Port 5000)**: Serves as the single edge listener. Decodes JWTs and forwards user claims (`X-User-Id`, `X-User-Role`, `X-User-Email`) downstream.
2. **`eureka-server` (Port 8761)**: Dynamic service registration registry.
3. **`auth-service` (Port 8081)**: Manages users, BCrypt password hashing, JWT generation (JJWT), and password resets. Backed by MySQL.
4. **`booking-service` (Port 8082)**: Coordinates customer profiles connection details, placing cylinder bookings, and payment verifying. Backed by MongoDB.
5. **`distribution-service` (Port 8083)**: Maintains distributor inventories, stocks, capacities, and driver registries. Backed by MySQL.
6. **`notification-service` (Port 8084)**: Listens to RabbitMQ queues to log welcome emails and delivery OTP codes asynchronously to `mock_emails.txt`.

---

## 2. Prerequisites & local setup

Make sure you have the following installed on your machine:
- **Java JDK 21**
- **Apache Maven 3.9+**
- **Docker Desktop** (to run MySQL, MongoDB, and RabbitMQ)
- **Node.js & npm** (to run the React frontend)

### Step 1: Start backing services via Docker Compose
In the root directory of the Java backend, run:
```bash
docker-compose up -d
```
This boots up:
- MySQL Server on port `3306` (creates databases `lpg_auth` and `lpg_distribution`)
- MongoDB Server on port `27017` (database `lpg_bookings`)
- RabbitMQ broker on port `5672` (management interface at `http://localhost:15672` with credentials `guest` / `guest`)

### Step 2: Build the Maven Project
Compile all modules by running the following command from the root of the Java project:
```bash
mvn clean install
```

### Step 3: Run the Microservices
Start each service in individual terminals or run them in the background. Boot them in this order:
1. **Eureka Server**:
   ```bash
   cd eureka-server && mvn spring-boot:run
   ```
2. **API Gateway**:
   ```bash
   cd api-gateway && mvn spring-boot:run
   ```
3. **Auth Service**:
   ```bash
   cd auth-service && mvn spring-boot:run
   ```
4. **Distribution Service**:
   ```bash
   cd distribution-service && mvn spring-boot:run
   ```
5. **Booking Service**:
   ```bash
   cd booking-service && mvn spring-boot:run
   ```
6. **Notification Service**:
   ```bash
   cd notification-service && mvn spring-boot:run
   ```

Verify that all services have successfully registered on Eureka by visiting:
[http://localhost:8761/](http://localhost:8761/)

---

## 3. Database Seeding & Startup Credentials

Upon startup, the databases are pre-populated with default seed data:
- **Admin account**:
  - Email: `admin@lpgbooking.com`
  - Password: `Admin@123`
- **Distributor account**:
  - Email: `distributor1@lpgbooking.com`
  - Password: `Distributor@123`
  - Profile Agency: `Super Gas Agency` (Current stock: 450, capacity: 1000)
- **Delivery Agent account**:
  - Email: `agent1@lpgbooking.com`
  - Password: `Agent@123`
  - Profile Driver: `Ramesh Kumar` (Vehicle: `MH-02-AB-1234`)

---

## 4. Run Automated tests
Execute unit tests covering the 25-day gap policy, quantity constraints, and OTP verification:
```bash
cd booking-service && mvn test
```
