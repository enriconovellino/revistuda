import { IsEnum, IsString } from "class-validator";

export class CreateAtividadeDto {

    @IsString()
    titulo_atividade!: string

    @IsString()
    descricao_atividade!: string;

    @IsString()
    tipo_atividade!: string;
    
}
