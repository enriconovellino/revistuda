export class CreateUserDto {
  nome!: string;
  email!: string;
  permissions?: string[];
}
