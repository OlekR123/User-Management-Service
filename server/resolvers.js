const { createUser, findUserById, findUserByEmail, listUsers, updateUser, deleteUser } = require('./models');
const { generateToken, checkPassword, isAdmin } = require('./utils');

const resolvers = {
  Query: {
    listUsers: (_, { filter, limit, offset }) => listUsers({ filter, limit, offset }),
    getUser: (_, { id }) => findUserById(id),
  },
  Mutation: {
    createUser: async (_, { input }) => createUser(input),
    updateUser: async (_, { id, input }) => updateUser(id, input),
    deleteUser: async (_, { id }, context) => {
      if (!context.user) throw new Error('Authentication required');
      isAdmin(context);
      return deleteUser(id);
    },
    login: async (_, { email, password }) => {
      const user = await findUserByEmail(email);
      if (!user) throw new Error('User not found');
      const valid = await checkPassword(password, user.passwordHash);
      if (!valid) throw new Error('Invalid password');
      const token = generateToken(user);
      return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    },
  },
};

module.exports = resolvers;