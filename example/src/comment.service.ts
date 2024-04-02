import { Injectable } from '@nestjs/common';
import { findAllByPage, findOne, Page } from '@sksharma72000/nestjs-search-page';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { Comment } from './entities/comment.entity';
import { CommentSearchDto } from './dtos/comment.search.dto';
import { IPage } from '@sksharma72000/nestjs-search-page/interfaces';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {
  }
  getAll(
    pagable: IPage,
    commentDto: CommentSearchDto
  ): Promise<Page<Comment>> {
    return findAllByPage<Comment>({ repo: this.commentRepository, page: pagable, queryDto: commentDto });
  }

  getOne(
    id: number,
    commentDto: CommentSearchDto
  ): Promise<Page<Comment>> {
    return findOne<Comment>({ id, repo: this.commentRepository, queryDto: commentDto, customQuery: [{ column: 'status', value: 'active', operation: "eq", operator: "and" }] });
  }
}
