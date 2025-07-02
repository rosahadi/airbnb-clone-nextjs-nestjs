import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserInput } from './dto/update-user.input';
import { UpdateMeInput } from './dto/update-profile.input';
import { CreateUserInput } from './dto/create-user.input';
import * as crypto from 'crypto';
import { PasswordService } from '../auth/password.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private passwordService: PasswordService,
    private cloudinaryService: CloudinaryService,
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

  async updateProfile(id: string, updateMeInput: UpdateMeInput): Promise<User> {
    const user = await this.findById(id);

    // Handle profile image upload if present
    if (updateMeInput.profileImage) {
      try {
        // Simply convert the base64 string to a buffer
        const imageBuffer = Buffer.from(updateMeInput.profileImage, 'base64');

        // Upload directly to Cloudinary
        const uploadedImage = await this.cloudinaryService.uploadProfileImage(
          imageBuffer,
          `profile-${id}`,
        );
        user.profileImage = uploadedImage.url;
      } catch {
        throw new Error('Failed to upload profile image');
      }
    }

    // Update other fields
    if (updateMeInput.name !== undefined) {
      user.name = updateMeInput.name;
    }

    if (updateMeInput.email !== undefined) {
      user.email = updateMeInput.email;
    }

    const savedUser = await this.usersRepository.save(user);
    return savedUser;
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
}
