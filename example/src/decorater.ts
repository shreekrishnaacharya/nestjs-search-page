import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
  Type,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

export function SelectQuery(dtoClass: Type<any>) {
  return createParamDecorator(async (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const selectParam = request.query.select;

    if (!selectParam) {
      return {}; // Return an empty object if select is not provided
    }
    console.log(selectParam, 'selectParam');
    let parsedSelection: any;
    try {
      parsedSelection = JSON.parse(JSON.stringify(selectParam));
    } catch (error) {
      throw new BadRequestException(
        'Invalid select format. It should be a valid JSON array.',
      );
    }

    const transformedSelection = parseSelection(parsedSelection);
    console.log(parsedSelection, transformedSelection);
    // Transform and validate against the specified DTO class
    const selectionDto = plainToInstance(dtoClass, transformedSelection);
    await validateOrReject(selectionDto);

    return selectionDto;
  })();
}

// Helper function to dynamically transform the array-based selection into DTO-compatible format
function parseSelection(selection: any): any {
  const parsedSelection: Record<string, any> = {};

  selection.forEach((field: any) => {
    if (typeof field === 'string') {
      // Simple field, set it to true
      parsedSelection[field] = true;
      console.log(field);
    } else if (typeof field === 'object' && !Array.isArray(field)) {
      // Nested object field, we expect it to have a single key with an array value
      const [key, subFields] = Object.entries(field)[0];
      if (Array.isArray(subFields)) {
        parsedSelection[key] = parseSelection(subFields);
      }
    }
  });

  return parsedSelection;
}
