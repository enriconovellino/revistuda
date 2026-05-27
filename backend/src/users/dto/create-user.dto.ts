export class CreateUserDto {
  nome!: string;
  email!: string;
  senha!: string;
  permissions?: string[];
}