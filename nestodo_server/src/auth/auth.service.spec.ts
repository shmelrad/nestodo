import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
    let service: AuthService;
    let prisma: PrismaService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                UsersService,
                PrismaService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            if (key === 'JWT_SECRET') return 'test-secret';
                            if (key === 'JWT_EXPIRATION_TIME') return '1h';
                            return null;
                        }),
                    },
                },
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(() => 'test-token'),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    afterEach(async () => {
        await prisma.user.deleteMany();
    });

    describe('register', () => {
        const registerDto = {
            email: 'test@example.com',
            username: 'testuser',
            password: 'password123'
        };

        it('should register a new user successfully', async () => {
            const result = await service.register(registerDto);

            expect(result).toHaveProperty('access_token');
            expect(result.access_token).toBe('test-token');

            const user = await prisma.user.findUnique({
                where: { email: registerDto.email }
            });

            expect(user).toBeDefined();
            expect(user?.email).toBe(registerDto.email);
            expect(user?.username).toBe(registerDto.username);
            expect(user?.passwordHash).not.toBe(registerDto.password);
        });

        it('should throw error if email already exists', async () => {
            await service.register(registerDto);

            const registerUsingSameEmail = () => service.register(registerDto)

            await expect(registerUsingSameEmail)
                .rejects
                .toThrow(BadRequestException);

            await expect(registerUsingSameEmail).rejects.toThrow('Email already taken');
        });

        it('should throw error if username already exists', async () => {
            await service.register(registerDto);

            const registerUsingSameUsername = () => service.register({
                ...registerDto,
                email: 'another@example.com'
            })

            await expect(registerUsingSameUsername)
                .rejects
                .toThrow(BadRequestException);

            await expect(registerUsingSameUsername).rejects.toThrow('Username already taken');

        });
    });
});
