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
    ```bash
    interface IPageSearch {
        is_relational?: boolean;
        column?: string;
        is_nested?: boolean;
        operation?: Operation;
        operator?: Operator;
        value?: string | number | boolean | null;
    }
    ```
    *is_relational*: Indicate if the attribute is relational. ie this will extract the relational table of current table\
                      and add to your response. Default value is false.\
\
    *column*: Name of table's column where your want to query. Default value is the name of the attribute.\
\
    *is_nested*: Indicate if current quering attribute is of relational table column. when this options is set to true.\
                    column option must be define indicating the relational table name and column name saperated by dot.
                    Default is false.\
                    Example : \
                    ```
                    {column:"post.title",is_nested:true}
                    ```
\
\
    *operation*: Operation are one of "eq" | "neq" | "gt" | "gteq" | "lt" | "lteq" | "like". Default is "like".\
\
    *operator*: Operator are one of "and" | "or". Default is "and".\
\
    *value*: Value of query attribute. It can be one of type: string | number | boolean | null. Default is null.\

2. IPage\
    IPage defines the attribute that customise your pagination.
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

3. CommonEntity\
    You must extends your service with CommonEntity class inorder to enable pagination in your service. CommonEntity also takes the entity type, which is the entity that you have created the services for. also you need to call super class and pass your serviceRepository as paremeter. \
    Example :
    ```
    @Injectable()
    export class CommentService extends CommonEntity<Comment> {
        constructor(
            @InjectRepository(Comment)
            private readonly commentRepository: Repository<Comment>
        ) {
            super(commentRepository);
        }
        //... rest of your code
    }
    ```
4. findAllByPage\
    Once you have extends CommonEntity in your service. You can call findAllByPage method as `this.findAllByPage`. findAllByPage takes three arguments ie first IPage, second your dto with @PageSearch decorated attribute, and custom IPageSearch List. Here 1st and 2nd argument are required and 3rd is optional. You can pass your IPage dto as 1st argument, your custom dto with @PageSearch decorated attribute as second argument and you can add additional query condition to your pagination with the third argument. This method returns Promise of type `Page`.
    Example of Page



1. Update your service by extending CommonEntity

   Example : Your Entity
   ```bash
    import { Entity, Column } from 'typeorm';
    
    @Entity({ name: 'comments' })
    export class Notification extends BaseEntity {

        @PrimaryGeneratedColumn({ type: "integer" })
        id: number;

        @Column({ type: 'text' })
        message: string;

        @Column()
        user_id: number;

        @Column()
        post_id: number;

        @Column()
        user_id: number;

        @ManyToOne(() => User, (user) => user.id)
        @JoinColumn({ name: "user_id" })
        user: User

        @ManyToOne(() => Post, (post) => post.id)
        @JoinColumn({ name: "post_id" })
        post: Post

    }

    import { Entity, Column, BeforeInsert, JoinColumn, ManyToOne } from 'typeorm';
    import { User } from "./users.entity";
    import { Post } from "./posts.entity";

    @Entity({ name: 'comments' })
    export class Notification extends BaseEntity {

        @PrimaryGeneratedColumn({ type: "integer" })
        id: number;

        @Column({ type: 'text' })
        message: string;

        @Column()
        user_id: number;

        @Column()
        post_id: number;

        @Column()
        user_id: number;

        @ManyToOne(() => User, (user) => user.id)
        @JoinColumn({ name: "user_id" })
        user: User

        @ManyToOne(() => Post, (post) => post.id)
        @JoinColumn({ name: "post_id" })
        post: Post

    }


2. Visit url example 'http://localhost:8000/skrbac/home'

   This will list all the role define. Incase of empty list, you can start by adding new roles with create new role button.
   Creating new role, you will enter role name and select assigned user.

3. Once role is created, you can click on key icon and view list of routes. By default all routes are allowed to access to all user. You can allow or denied
   each route by clicking switch buttons.

4. Middleware `\Skacharya\LaravelRbac\Middlewares\RbacFilter::class`

   You can add middleware `\Skacharya\LaravelRbac\Middlewares\RbacFilter::class` to the middleware group. 
   
   Example you can open app\Http\Kernel.php 
   ```bash
       protected $middlewareGroups = [
        'web' => [
        //    ...other middleware
            \Skacharya\LaravelRbac\Middlewares\RbacFilter::class
        ],
    ];
    ```
5. Route setup

   While setting your route follow the practice of grouping your route and giving name to your each route.
   Example :
   ```bash
    Route::group(['prefix' => 'demo', 'as' => 'admin.'], function () {
            Route::get('post', [ExampleController::class, 'index'])->name("post.index");
            Route::post('post', [ExampleController::class, 'store'])->name("post.store");
            Route::get('post/{post}', [ExampleController::class, 'show'])->name("post.show");
            Route::put('post/{post}', [ExampleController::class, 'update'])->name("post.update");
            Route::delete('post/{post}', [ExampleController::class, 'delete'])->name("post.delete");
    });
    ```
    Here 'admin.' is the group name.

6. You can use `\Skacharya\LaravelRbac\SkAccess` class to check if given route is accessable to the current login user or not. For that you can use its static method hasAccess. You can dynamically keep or remove certain route button or a tag depending on the current access of user to that route. This method will return false if user is loggedin and has no access to route else in other all case it return true

    Example :
    ```bash
    @if(SkAccess::hasAccess('demo.post.index'))
        <a href="{{route('demo.post.index')}}">Post</a>
    @endif
    ```


*Notes:* If you want to design you custom view for landing page of rbac. You can define you own route insted of `http://localhost:8000/skrbac/home` and have a div element with id and load js file. ID of div element must be `root`
Example :
Your custom blade file mycustomrbac.blade.php
```bash
@extends('layout/main')
@section('content')
<div id="root"></div>
@endsection
@push('footer_script')
    <script defer="defer" type="module" src="/vendor/laravel-rbac/js/skrbac.js"></script>
@endpush
```
Github:

Want to explor the code for free.

We appreciate your star and fork on github :
https://github.com/shreekrishnaacharya/laravel-rbac

Contributing:

We welcome contributions! Please see Contribution Guidelines: https://github.com/shreekrishnaacharya/laravel-rbac/blob/main/CONTRIBUTING.md

License:

Open-source licensed under the MIT license: https://opensource.org/licenses/MIT

Credits:

Developed by Shree Krishna Acharya: https://www.linkedin.com/in/shree-krishna-acharya/
Built on top of the amazing Laravel framework