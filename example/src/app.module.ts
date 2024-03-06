import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database.module';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';


@Module({
  imports: [
    DatabaseModule,
    TypeOrmModule.forFeature([Comment, Post]),
  ],
  controllers: [AppController],
  providers: [CommentService],
})
export class AppModule { }
