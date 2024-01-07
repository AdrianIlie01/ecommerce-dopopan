import { PartialType } from '@nestjs/mapped-types';
import { CreatePdfDto } from './create-pdf.dto';

export class UpdateMailDto extends PartialType(CreatePdfDto) {}
