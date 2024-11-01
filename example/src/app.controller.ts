import {
  Query,
  UsePipes,
  ValidationPipe,
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { PagableDto } from './dtos/pagable.dto';
import { CommentSearchDto } from './dtos/comment.search.dto';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { SelectQuery } from './decorater';
import { NestedSelectionDTO } from './dtos/test';

@ApiTags('sms-group')
@Controller('comments')
export class AppController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  )
  getComments(
    @Query() commentSearchDto: CommentSearchDto,
    @Query() pagableDto: PagableDto,
  ) {
    return this.commentService.getAll(pagableDto, commentSearchDto);
  }

  // @Get('/:id')
  // getOne(@Param('id') id: number, @Query() commentSearchDto: CommentSearchDto) {
  //   return this.commentService.getOne(id, commentSearchDto);
  // }

  @ApiQuery({
    name: 'select',
    type: NestedSelectionDTO,
    required: false,
    description: 'Specify the fields to include in the response',
  })
  @Get('/entity')
  getEntity(
    // @SelectQuery(NestedSelectionDTO) commentSearchDto: NestedSelectionDTO,
  ) {
    // console.log(commentSearchDto,"commentSearchDto");
    return;
  }
}
