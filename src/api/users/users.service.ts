import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { AtLeastOneFieldException } from './exceptions/at-least-one-filed.exception';
import { DuplicateException } from './exceptions/duplicated.exception';
import { NotFoundException } from './exceptions/not-found.exception';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(where: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where,
    });
  }

  async findOneByEmail(
    where: Prisma.UserWhereUniqueInput,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where,
    });

    if (!user) throw new NotFoundException('Email not found');
    return user;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (existingUser) throw new DuplicateException();

    const salt = 10;
    const hashedPassword = await bcrypt.hash(data.password, salt);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,

        teams: {
          create: [
            {
              main: true,
              team: { create: { name: 'main' } },
            },
          ],
        },
      },
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const {
      where,
      data: { name, password },
    } = params;
    const data = {};

    if (!name && !password) throw new AtLeastOneFieldException();

    let hashedPassword: string;

    if (password) {
      const salt = 10;
      hashedPassword = await bcrypt.hash(password as string, salt);
      data['password'] = hashedPassword;
    }
    if (name) data['name'] = name;

    return this.prisma.user.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.UserWhereUniqueInput): Promise<void> {
    const user = await this.prisma.user.findUnique({ where });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({
      where,
    });
  }
}
