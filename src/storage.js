const dataKey = 'dgmxq:user-management:data';

export function createMemoryStorage(initial = null) {
  const values = new Map();
  if (initial) {
    values.set(dataKey, JSON.stringify(initial));
  }
  return {
    async getJSON(key) {
      const value = values.get(key);
      return value ? JSON.parse(value) : null;
    },
    async putJSON(key, value) {
      values.set(key, JSON.stringify(value));
    },
  };
}

export function createEdgeKvStorage(env) {
  const kv = env.USER_STORE_KV ?? env.USERS_KV ?? env.KV;
  if (!kv) {
    throw new Error('Missing EdgeOne KV binding. Bind USER_STORE_KV, USERS_KV, or KV.');
  }

  return {
    async getJSON(key) {
      const value = await kv.get(key);
      if (!value) {
        return null;
      }
      return typeof value === 'string' ? JSON.parse(value) : value;
    },
    async putJSON(key, value) {
      await kv.put(key, JSON.stringify(value));
    },
  };
}

export function createUserStore(storage, adminCredentials) {
  return {
    async initialize() {
      let data = await readData(storage);
      if (!data.users.some((user) => user.role === 'admin')) {
        data = {
          ...data,
          nextId: Math.max(data.nextId, 2),
          users: [
            ...data.users,
            {
              id: 1,
              username: normalizeUsername(adminCredentials.username),
              nickname: adminCredentials.nickname,
              role: 'admin',
              passwordHash: adminCredentials.passwordHash,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        };
        await writeData(storage, data);
      }
    },
    async listUsers() {
      const data = await readData(storage);
      return data.users.toSorted((a, b) => a.id - b.id);
    },
    async findById(id) {
      const data = await readData(storage);
      return data.users.find((user) => user.id === id) ?? null;
    },
    async findByUsername(username) {
      const data = await readData(storage);
      return data.users.find((user) => user.username === normalizeUsername(username)) ?? null;
    },
    async createUser({ username, passwordHash, nickname }) {
      const data = await readData(storage);
      const now = new Date().toISOString();
      const user = {
        id: data.nextId,
        username: normalizeUsername(username),
        nickname,
        role: 'user',
        passwordHash,
        createdAt: now,
        updatedAt: now,
      };
      data.nextId += 1;
      data.users.push(user);
      await writeData(storage, data);
      return user;
    },
    async updateUser(id, changes) {
      const data = await readData(storage);
      const user = data.users.find((item) => item.id === id);
      if (!user) {
        return null;
      }
      Object.assign(user, changes, { updatedAt: new Date().toISOString() });
      await writeData(storage, data);
      return user;
    },
    async deleteUser(id) {
      const data = await readData(storage);
      data.users = data.users.filter((user) => user.id !== id);
      await writeData(storage, data);
    },
  };
}

async function readData(storage) {
  return (await storage.getJSON(dataKey)) ?? { nextId: 1, users: [] };
}

async function writeData(storage, data) {
  await storage.putJSON(dataKey, data);
}

function normalizeUsername(username) {
  return String(username).trim().toLowerCase();
}
