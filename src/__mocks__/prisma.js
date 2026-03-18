const prisma = {
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  role: {
    findUnique: jest.fn(),
  },
  admin: {
    findUnique: jest.fn(),
  },
};

export default prisma;
