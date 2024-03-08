import {
  Query,
  UsePipes,
  ValidationPipe,
  Controller,
  Get
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { PagableDto } from './dtos/pagable.dto';
import { CommentSearchDto } from './dtos/comment.search.dto';

@Controller("comments")
export class AppController {
  constructor(private readonly commentService: CommentService) { }

  @Get()
  @UsePipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  getComments(
    @Query() commentSearchDto: CommentSearchDto,
    @Query() pagableDto: PagableDto,
  ) {
    return this.commentService.getAll(pagableDto, commentSearchDto);
  }
}
