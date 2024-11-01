import {
  IsBoolean,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

enum AddressSelection {
  country = 'country',
  city = 'city',
  state = 'state',
}

enum StudentEnum {
  name = 'name',
  email = 'email',
  phone = 'phone',
}

export class AddressSelectionDTO {
  @ApiProperty({ enum: AddressSelection, isArray: true })
  field: AddressSelection[];
  @ApiProperty({ enum: StudentEnum, isArray: true })
  town: StudentEnum[];
}

export class StudentSelectionDTO {
  @ApiProperty({ enum: StudentEnum, isArray: true })
  field: StudentEnum[];
  @ApiProperty({ type: AddressSelectionDTO })
  address: AddressSelectionDTO;
}

export class NestedSelectionDTO {
  @ApiProperty({ type: StudentSelectionDTO })
  @IsOptional()
  @IsBoolean()
  student?: StudentSelectionDTO;
}
