import { IsNumber, IsString, IsOptional } from "class-validator";

export class CreateAtividadeDto {
    @IsString()
    titulo_atividade!: string;

    @IsOptional()
    @IsString()
    descricao_atividade?: string | null;

    @IsString()
    tipo_atividade!: string;

    @IsNumber()
    licao_id!: number;
}