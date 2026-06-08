export class UpdateUserDto {
  nome?: string;
  email?: string;
  senha!: string;
  permissions?: string[];
}