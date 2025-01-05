import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { UserRole } from '../../user/user-role.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  role?: UserRole;
}
