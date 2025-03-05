import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('validateUser', () => {
    it('should throw BadRequestException when user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      
      await expect(service.validateUser('test@test.com', 'password'))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException when password is invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        email: 'test@test.com',
        passwordHash: 'hashedPassword',
      });
      
      await expect(service.validateUser('test@test.com', 'wrongpassword'))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('register', () => {
    it('should throw BadRequestException when user already exists', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 1, email: 'test@test.com' });
      
      await expect(service.register({ email: 'test@test.com', password: 'password' }))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should create new user and return access token', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.createUser.mockResolvedValue({ 
        id: 1, 
        email: 'test@test.com' 
      });
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.register({
        email: 'test@test.com',
        password: 'password',
      });

      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('jwt_token');
    });
  });
});