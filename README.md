# Walkthrough - SwedBank Banking System

We have successfully created a self-contained banking system inside `C:\Projects\SwedBank\bank-app`. The project consists of a Java Spring Boot REST API (Backend) and an Angular SPA (Frontend).

---

## 🚀 How to Run the Application

To run the application locally, you will need two terminals.

### 1. Start the Backend (Spring Boot REST API)
Open a terminal in the backend directory:
```powershell
cd C:\Projects\SwedBank\bank-app\backend
.\mvnw spring-boot:run
```
- The backend will start on **port 8080** (`http://localhost:8080`).
- The H2 Database Web Console will be available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:bankdb`, Username: `sa`, Password: `[blank]`).

### 2. Start the Frontend (Angular SPA)
Open a terminal in the frontend directory:
```powershell
cd C:\Projects\SwedBank\bank-app\frontend
npm start
```
- Open your browser to `http://localhost:4200` to view the application.

---

## 🛠️ What We Built

### 1. Backend (Spring Boot + H2 SQL DB)
- **Account & Transaction Entities**: Modeled accounts with individual currencies (EUR, USD, SEK, GBP, VND) and a relational mapping to paginated transaction histories.
- **Fixed-Rate Currency Exchange**: Implemented fixed rates between all currencies through a EUR base (EUR=1.0, USD=1.08, SEK=11.45, GBP=0.84, VND=27500.0).
- **Simulated External Logger**: Implemented a call to `https://httpstat.us/200` via Java's native `HttpClient` preceding all debit operations.
- **PDF Report Generation**: Integrated the `OpenPDF` library to generate and serve downloadable receipt PDFs at `/api/transactions/{id}/pdf`.
- **Backend Unit Tests**: Implemented comprehensive tests in `BankAccountApplicationTests.java` covering account creations, deposits, debits (validating insufficient funds/correct currencies), and cross-currency exchange conversions.

### 2. Frontend (Angular 19 + NgRx State Management)
- **Dashboard / Home Page**:
  - Displays user accounts as credit cards styled with premium glassmorphic gradients.
  - Features an "Open New Account" modal.
  - Clean error and loading handlers.
- **Account Overview Page**:
  - **Pulsing Large Balance**: Large glowing indicator of the account balance and currency.
  - **Floating Quick Actions**: Integrated modals for Deposit, Debit (Withdrawal), and Exchange Transfer.
  - **Balance Over Time Line Chart**: Integrated a line chart using `Chart.js` tracking the historic sequence of the account balance (timestamp on X-axis, balanceAfter on Y-axis).
  - **Paginated Transaction History**: Implemented a scrollable list containing all transaction details.
  - **Infinite Scroll**: List dynamically triggers additional page loading from the backend when the user scrolls near the bottom of the transaction container.
- **Transaction Overview Page**:
  - Displays a detailed transaction receipt card.
  - Clickable button to download the backend-generated PDF transaction summary.

---

## 🧪 Validation & Results

- **Backend compilation & tests**: Passed successfully with `BUILD SUCCESS` and `Tests run: 8, Failures: 0, Errors: 0`.
- **Frontend compilation**: Completed successfully with `Application bundle generation complete` and zero compilation errors.
