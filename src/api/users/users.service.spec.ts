import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, PrismaClient, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '../../config/config.service';
import { UsersService } from './users.service';
import { faker } from '@faker-js/faker';
import { createUser } from '../../../test/factories/users.factory';
import { NotFoundException } from './exceptions/not-found.exception';

describe('CustomersService', () => {
  let service: UsersService;
  const config = new ConfigService();
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.get('DATABASE_URL'),
      },
    },
  });

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Create', () => {
    it('should create and return a user successfuly', async () => {
      //Arrange
      const data: Prisma.UserCreateInput = {
        name: faker.name.fullName(),
        email: faker.internet.email(),
        password: faker.random.word(),
      };

      //Act
      const user = await service.create(data);

      //Assert
      expect(user).toBeDefined();
      expect(user.name).toEqual(data.name);
      expect(user.email).toEqual(data.email);
      expect(user.password).not.toEqual(data.password);
    });
  });
  it('should create and return an array of users successfuly', async () => {
    //Arrange
    await createUser(prisma);
    await createUser(prisma);

    //Act
    const test = await service.users({});

    //Assert
    expect(test).toBeDefined();
    expect(Array.isArray(test)).toBe(true);
    expect(test).toHaveLength(2);
  });

  it('should create and return an unique existent customer', async () => {
    //Arrange
    const password = '123456';
    const data = await createUser(prisma, { password });

    //Act
    const user = await service.user({ email: data.email });

    //Assert
    expect(user).toBeDefined();
    expect(user.email).toEqual(data.email);
    expect(user.name).toEqual(data.name);
    expect(user.password).not.toEqual(password);
  });

  it('should return an error if a non-existent email is passed', async () => {
    //Arrange
    const nonExistentEmail = 'email@example.com';

    //Act
    try {
      await service.findOneByEmail({ email: nonExistentEmail });
    } catch (error) {
      //Assert
      expect(error).toEqual(new NotFoundException('Email not found'));
    }
  });
});