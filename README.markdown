# GraphQL User Management Service

## Описание
Сервис реализует GraphQL API для управления пользователями: создание, обновление, удаление, получение списка и логин с JWT-аутентификацией.

## Стек технологий
- Язык: Node.js
- GraphQL: Apollo Server
- Хранилище: SQLite
- Авторизация: JWT

## Установка
1. Склонируйте репозиторий:
   ```bash
   git clone <your-repo-url>
   cd user-management-service
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Создайте `.env` файл:
   ```
   PORT=4000
   JWT_SECRET=your_jwt_secret_123
   DATABASE_URL=./database.sqlite
   ```

## Запуск сервера
```bash
npm run start
```
Сервер доступен на `http://localhost:4000/graphql`.

## Примеры запросов
### 1. Query: Получить список пользователей
```graphql
query {
  listUsers(limit: 10, offset: 0) {
    id
    name
    email
    role
  }
}
```
**Ответ:**
```json
{
  "data": {
    "listUsers": [
      { "id": "1", "name": "Alice", "email": "alice@example.com", "role": "USER" },
      { "id": "3", "name": "Charlie", "email": "charliergf34@example.com", "role": "USER" },
      { "id": "4", "name": "Charlie", "email": "charliep8858@example.com", "role": "USER" },
      { "id": "5", "name": "Admin", "email": "admin@example.com", "role": "ADMIN" },
      { "id": "6", "name": "David", "email": "davidm7b8z@example.com", "role": "USER" }
    ]
  }
}
```

### 2. Mutation: Создать нового пользователя
```graphql
mutation {
  createUser(input: { name: "Charlie", email: "charlie@example.com", password: "secret", role: "USER" }) {
    id
    name
    email
    role
  }
}
```
**Ответ:**
```json
{
  "data": {
    "createUser": {
      "id": "20",
      "name": "Charlie",
      "email": "charlie@example.com",
      "role": "USER"
    }
  }
}
```

### 3. Mutation: Логин
```graphql
mutation {
  login(email: "admin@example.com", password: "secret") {
    token
    user {
      id
      name
      role
    }
  }
}
```
**Ответ:**
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "5",
        "name": "Admin",
        "role": "ADMIN"
      }
    }
  }
}
```

## Структура проекта
```
.
├── schema/
│   └── schema.graphql
├── server/
│   ├── index.js
│   ├── resolvers.js
│   ├── models.js
│   └── utils.js
├── client/
│   └── index.js
├── .env
├── package.json
└── README.md
```