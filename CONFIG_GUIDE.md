# 🛠️ Configuration & Deployment Guide

This document defines the standard ports, subdomains, and environment variables for the LoeiTech Admission project across all environments.

---

## 🌐 Environment Matrix

| Feature | Local Development | Testing (Test Stack) | Production (Prod Stack) |
| :--- | :--- | :--- | :--- |
| **Frontend URL** | `http://localhost:13000` | `https://test-admission.loeitech.ac.th` | `https://admission.loeitech.ac.th` |
| **Backend API URL** | `http://localhost:13001` | `https://test-api-admission.loeitech.ac.th` | `https://api-admission.loeitech.ac.th` |
| **Backend Port (Host)** | `13001` | `3002` | `3001` |
| **Frontend Port (Host)** | `13000` | `5174` | `5173` |
| **Docker Project Name** | `loeitech-admission` | `ltc-admission-test` | `ltc-admission-prod` |
| **Docker Tag** | `latest` | `test` | `prod` |

---

## 🔐 GitHub Secrets

The following secrets must be configured in the GitHub Repository Settings (**Settings > Secrets and variables > Actions**):

### Infrastructure
- `SERVER_IP`: IP address of the deployment server.
- `SERVER_USER`: SSH username (e.g., `adm1n_ltc`).
- `SSH_PRIVATE_KEY`: Private key for SSH access.
- `REGISTRY_URL`: `https://registry.loeitech.org` (Private Registry URL).
- `DOCKER_USERNAME`: Registry username.
- `DOCKER_PASSWORD`: Registry password.

### Application (Production)
- `DATABASE_URL_PROD`: PostgreSQL connection string for production.
- `JWT_SECRET_PROD`: Secret key for JWT in production.

### Application (Testing)
- `DATABASE_URL_TEST`: PostgreSQL connection string for testing.
- `JWT_SECRET_TEST`: Secret key for JWT in testing.

---

## 🛠️ Local Setup (.env)

### Backend (`backend/.env`)
```env
PORT=13001
FRONTEND_URL=http://localhost:13000
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=your_local_secret
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:13001
```

---

## 🚀 Deployment Flow
1. **Test**: Push to `test` branch ➡️ Deploys to `test-admission.loeitech.ac.th`
2. **Production**: Push to `prod` branch ➡️ Deploys to `admission.loeitech.ac.th`
