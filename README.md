# sksharma72000\nestjs-search-page

**Installation:**

1. Install via Composer:

    ```bash
   npm install @sksharma72000/nestjs-search-page
    ```

**Features:**
1. Easy conditional searching using dto with query parameter.
2. Relational table searching
3. Relational table data extraction
4. Customizable condition ie AND, OR. Default OR
5. Customizable operation of MYSQL QUERY ie LIKE, EQUAL, GREATEN THEN, other,
6. Easy pagination with start and end page, order by column, sort type ie. ASC, DESC

**Uses:**
1. @PageSearch Decorator\
   You can define your custom data transfer object defining your quering attributes.
   Your quering attributes are the table column where your query keyword would be search.
   @PageSearch decorator accept IPageSearch interface object.
    ```
    interface IPageSearch {
        is_relational?: boolean;
        column?: string;
        is_nested?: boolean;
        operation?: Operation;
        operator?: Operator;
        value?: string | number | boolean | null;
    }
    ```
    *is_relational*: Indicate if the attribute is relational. By Default, if attribute value type is boolen, \
                    then attribute is considered as relational unless it is set to false.\
                    ie this will extract the relational table of current table with name of attribute and add to your response. Default value is null.\
\
    *column*: Name of table's column where your want to query. Default value is the name of the attribute.\
\
    *is_nested*: Indicate if current quering attribute is of relational table column. If the column name \
                    consist of dot ie '.' then the attribute is taken nested. When this options is set to true, \
                    column option must be define indicating the relational table name and column name \
                    saperated by dot. Default is false.\
                    Example : \
                    ```
                    {column:"post.title"}
                    ```
\
\
    *operation*: Operation are one of "eq" | "neq" | "in" | "gt" | "gteq" | "lt" | "lteq" | "like" | "between". Default is "like".\
\
    *operator*: Operator are one of "and" | "or". Default is "and".\
\
    *value*: Value of query attribute. It can be one of type: string | number | boolean | null. Default is null.\

2. IPage\
    IPage defines the attribute that customize your pagination.
    Your dto should implements IPage or has all attribute of IPage defined. IPage consist of following attributes :
    ```
    interface IPage {
        _start: number;
        _end: number;
        _sort: string;
        _order: SortDirection;
    }
    ```
    *_start*: Define from which row you want to the data list to start from. \
            Example:\
            Start from 10th item of 1000 items \
\
    *_end*: Define upto which row you want the data list.\
            Example:\
            Upto 100th item of 1000 items.\
            With this the item from 10th to 100th will be responsed. \
\
    *_sort*: Define the column that you want the list to be sorted by.
            By default, the list will be sorted by id in DESC order. \
\
    *_order*: Define the order of column you want the list to be sorted by.
        By default, the list will be sorted buy in DESC order of id column.

3. findAllByPage\
    It is the function that is responsible for quering into table with to enable pagination in your service. It takes IFindAllByPage interface as parameter. IFindAllByPage consist of repo, page, queryDto, customQuery where repo is your repositiry to perform query, page is IPage, queryDto is your dto and customQuery is where you can add custom where condition. It taked the Model class as its type. \
    Example :
    ```
    findAllByPage<Comment>({ repo: this.commentRepository, page: pagable, queryDto: commentDto });
    ```

4. findOne\
    This findOne perform query by id into your repository and gets you one model result or null. It takes IFindOne interface as parameter. IFindOne consist of id, repo, queryDto, customQuery where id is id of model, repo is your repositiry to perform query, queryDto is your dto and customQuery is where you can add custom where condition. It taked the Model class as its type. \
    Example :
    ```
    findOne<Comment>({id:1, repo: this.commentRepository, queryDto: commentDto });
    ```
\
5. findOptions\
    It is the function that is responsible for building typeorm FindManyOptions and return the options. It is similar to findAllByPage, except it does not takes repo and does not actually perform  query, rather returns the FindManyOptions so you can futher customize the where option and run your query. It takes IFindOptionByPage interface as parameter. IFindOptionByPage consist of page, queryDto, customQuery where page is IPage, queryDto is your dto and customQuery is where you can add custom where condition. It taked the Model class as its type. \
    Example :

    ```
    findOptions<Comment>({ page: pagable, queryDto: commentDto });
    /*
    {
        where, #your where condition from dto
        order, #your order from IPage sort
        relations, #your relation from dto,
        skip, #your skip from from IPage start
        take, #your take from from IPage end
    }
    */

    ```
\
This is how your CommentService looks like.

   Example : Your Entity
   ```bash
        import { Injectable } from '@nestjs/common';
        import { findAllByPage, findOne, Page, IPage } from '@sksharma72000/nestjs-search-page';
        import { InjectRepository } from '@nestjs/typeorm';
        import { Repository } from "typeorm";
        import { Comment } from './entities/comment.entity';
        import { CommentSearchDto } from './dtos/comment.search.dto';

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
                return findAllByPage<Comment>({repo:this.commentRepository, page:pagable, queryDto:commentDto, customQuery:[{column: 'status',value:'active', operation: "eq", operator: "and" }]});
            }

            getOne(
                id: number,
                commentDto: CommentSearchDto
            ): Promise<Page<Comment>> {
                return findOne<Comment>({id,repo:this.commentRepository,queryDto:commentDto,customQuery:[{column:'status',value:'active', operation: "eq", operator: "and" }]});
            }
        }
```
\
Following is how your CommentSearchDto looks like:
```bash
        import { PageSearch } from '@sksharma72000/nestjs-search-page'
        import { Type } from 'class-transformer'
        import { IsOptional } from 'class-validator'
        export class CommentSearchDto {
            @IsOptional()
            @PageSearch({ column: "post.title" })
            post_title: string

            @IsOptional()
            @Type(() => Boolean)
            @PageSearch({column:"post.author"})//here indication column name as 'post.author' for relation will return post with its relational column author
            post: boolean

            @IsOptional()
            @Type(() => Number)
            @PageSearch({ operation: "eq", operator: "and" })
            post_id: number

            @IsOptional()
            @PageSearch()
            message: string

        }
```
\

Following is how your CommentController looks like:

```bash
        import {
            Param,
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

            @Get("/")
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

            @Get("/:id")
            getOne(
                @Param("id") id: number,
                @Query() commentSearchDto: CommentSearchDto,
            ) {
                return this.commentService.getOne(id, commentSearchDto);
            }
            
        }

```

Now you can make search url query for searching your comment

```
http://localhost:5000/comments?post=true&post_id=1&message=Hello&_start=10&_end=50
http://localhost:5000/comments/5?post=true

```

Github:

Want to explor the code for free.

We appreciate your star and fork on github : https://github.com/shreekrishnaacharya/nestjs-search-page

Contributing:

We welcome contributions! Please see Contribution Guidelines: https://github.com/shreekrishnaacharya/nestjs-search-page/CONTRIBUTING.md

License:

Open-source licensed under the MIT license: https://opensource.org/licenses/MIT

Credits:

Developed by Shree Krishna Acharya: https://www.linkedin.com/in/shree-krishna-acharya/ Built on top of the amazing Laravel framework

