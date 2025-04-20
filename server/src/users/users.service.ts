import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import * as crypto from 'crypto';
import { PasswordService } from '../auth/password.service';
import { CreateUserInput } from './dto/create-user.input';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private passwordService: PasswordService,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  async create(createUserData: CreateUserInput): Promise<User> {
    // Hash the password before creating the user
    if (createUserData.password) {
      createUserData.password = await this.passwordService.hash(
        createUserData.password,
      );
    }

    const user = this.usersRepository.create(createUserData);
    return await this.usersRepository.save(user);
  }

  async update(
    id: string,
    updateUserInput: UpdateUserInput | Partial<User>,
  ): Promise<User> {
    const user = await this.findById(id);

    // If password is being updated, hash it
    if ('password' in updateUserInput && updateUserInput.password) {
      updateUserInput.password = await this.passwordService.hash(
        updateUserInput.password,
      );
    }

    Object.assign(user, updateUserInput);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<User> {
    const user = await this.findById(id);
    await this.usersRepository.remove(user);
    return user;
  }

  async findByPasswordResetToken(token: string): Promise<User | undefined> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: MoreThan(new Date()),
      },
    });
    return user ?? undefined;
  }

  async compareUserPassword(
    userId: string,
    password: string,
  ): Promise<boolean> {
    const user = await this.findById(userId);
    return this.passwordService.verify(password, user.password);
  }
}
