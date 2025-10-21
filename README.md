# Swagger-Tutorial
A Tutorial on Swagger made for the .Hack Resource Repository

## Getting Started

### Prerequisites
- Node.js installed on your system

### Installation
```bash
npm install
```

### Running the Server
```bash
npm start
```

The server will start on port 3001 (or the port specified in the PORT environment variable).

### Available Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint

### Testing
You can test the server using curl:
```bash
curl http://localhost:3000/
curl http://localhost:3000/health
```
