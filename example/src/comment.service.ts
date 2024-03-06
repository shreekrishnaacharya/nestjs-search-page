import { Injectable } from '@nestjs/common';
import { CommonEntity, Page } from '@sksharma72000/nestjs-search-page';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from "typeorm";
import { Comment } from './entities/comment.entity';
import { CommentSearchDto } from './dtos/comment.search.dto';
import { IPage } from '@sksharma72000/nestjs-search-page/interfaces';

@Injectable()
export class CommentService extends CommonEntity<Comment> {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>
  ) {
    super(commentRepository);
  }
  getAll(
    pagable: IPage,
    commentDto: CommentSearchDto
  ): Promise<Page<Comment>> {
    return this.findAllByPage(pagable, commentDto);
  }

  // createComment(commentCreateDto:CommentCreateDto):Promish<Comment>{
  //   const createComment=this.commentRepository.create({...commentCreateDto})
  //   return await this.commentRepository.save(createComment)
  // }
}
