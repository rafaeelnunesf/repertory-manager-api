import { Test, TestingModule } from '@nestjs/testing';
import { TeamsService } from './teams.service';
import { ConfigService } from '../../config/config.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

describe('TeamsService', () => {
  let service: TeamsService;

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
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany();
    await prisma.teamUser.deleteMany();
    await prisma.repertory.deleteMany();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany();
    await prisma.teamUser.deleteMany();
    await prisma.repertory.deleteMany();
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({});
    await prisma.team.deleteMany();
    await prisma.teamUser.deleteMany();
    await prisma.repertory.deleteMany();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TeamsService, PrismaService],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
