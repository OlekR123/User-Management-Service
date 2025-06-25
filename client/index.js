const { ApolloClient, InMemoryCache, HttpLink, gql } = require('@apollo/client/core');
const fetch = (...args) => import('cross-fetch').then(({ default: fetch }) => fetch(...args));

const client = new ApolloClient({
  link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch }),
  cache: new InMemoryCache(),
});

let adminToken = null;
let userToken = null;

// 1. Логин как ADMIN
client
  .mutate({
    mutation: gql`
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
    `,
  })
  .then((res) => {
    adminToken = res.data.login.token;
  })
  .catch((err) => console.error('Admin login error:', err));

// 2. Логин как новый USER
client
  .mutate({
    mutation: gql`
      mutation CreateAndLogin($email: String!, $password: String!) {
        createUser(input: { name: "NewUser", email: $email, password: $password, role: "USER" }) {
          id
          email
        }
      }
    `,
    variables: {
      email: `newuser${Math.random().toString(36).substr(2, 5)}@example.com`,
      password: "secret",
    },
  })
  .then((res) => {
    const newUserEmail = res.data.createUser.email;
    return client.mutate({
      mutation: gql`
        mutation {
          login(email: "${newUserEmail}", password: "secret") {
            token
            user {
              id
              name
              role
            }
          }
        }
      `,
    });
  })
  .then((res) => {
    userToken = res.data.login.token;
    console.log('New user login result:', res.data.login);
  })
  .catch((err) => console.error('User login error:', err));

// 3. Создание пользователя с уникальным email
client
  .mutate({
    mutation: gql`
      mutation CreateUser($email: String!) {
        createUser(input: { name: "David", email: $email, password: "secret", role: "USER" }) {
          id
          name
          email
          role
        }
      }
    `,
    variables: {
      email: `david${Math.random().toString(36).substr(2, 5)}@example.com`,
    },
  })
  .then((res) => console.log('Created user:', res.data.createUser))
  .catch((err) => console.error('Create error:', err));

// 4. Список пользователей
client
  .query({
    query: gql`
      query {
        listUsers(limit: 5, offset: 0) {
          id
          name
          email
          role
        }
      }
    `,
  })
  .then((res) => console.log('Users list:', res.data.listUsers))
  .catch((err) => console.error('List error:', err));

// 5. Получение одного пользователя
client
  .query({
    query: gql`
      query {
        getUser(id: "5") {
          id
          name
          email
          role
        }
      }
    `,
  })
  .then((res) => console.log('Single user:', res.data.getUser))
  .catch((err) => console.error('Get error:', err));

// 6. Удаление пользователя с токеном ADMIN
setTimeout(() => {
  if (adminToken) {
    client
      .mutate({
        mutation: gql`
          mutation {
            deleteUser(id: "1")
          }
        `,
        context: {
          headers: {
            authorization: `Bearer ${adminToken}`,
          },
        },
      })
      .then((res) => console.log('Delete result with ADMIN token:', res.data.deleteUser))
      .catch((err) => console.error('Delete error with ADMIN token:', err));
  }
}, 1000);