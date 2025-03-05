import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = { id: 1, email: 'test@test.com' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@test.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('test@test.com');
      expect(result).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should create and return new user', async () => {
      const mockUser = { 
        id: 1, 
        email: 'test@test.com',
        passwordHash: 'hashedPassword'
      };
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.createUser({
        email: 'test@test.com',
        passwordHash: 'hashedPassword'
      });

      expect(result).toEqual(mockUser);
    });
  });
});