import { PartialType } from '@nestjs/mapped-types';
import { CreateLicaoDto } from './create-licao.dto';

export class UpdateLicaoDto extends PartialType(CreateLicaoDto) {}
