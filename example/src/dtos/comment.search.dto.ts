import { PageSearch } from '@sksharma72000/nestjs-search-page'
import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
export class CommentSearchDto {
    /* 
        Set your is_nested to true as attribute post_title will 
        be checked into relational table ie post table thus set is_nested to true.
        And mention your table and column in column attribute saperated by ".".
        as long as you set column attribute PageSearch of you can give any name to dto attribute.
    */
    @IsOptional()
    @PageSearch({ column: "post.title" })
    post_title: string

    /* 
        Set your is_relational to true if want the relational table post to be included in yout response.
    */
    @IsOptional()
    @Type(() => Boolean)
    @PageSearch()
    post: boolean

    /* 
        By default PageSearch uses OR operator and 'like %your query%' as operation.
        You can override this by specifing your requirment as below
    */
    @IsOptional()
    @Type(() => Number)
    @PageSearch({ operation: "eq", operator: "and" })
    post_id: number

    /* 
        This will match the message column of comment table with like operation, 
        which is also the default behaviour
    */
    @IsOptional()
    @PageSearch()
    message: string

}