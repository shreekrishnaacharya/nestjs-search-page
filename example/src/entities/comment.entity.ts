import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'comments' })
export class Comment {

    @PrimaryGeneratedColumn({ type: "integer" })
    id: number;

    @Column({ type: 'text' })
    message: string;

    @Column()
    post_id: number;

    @ManyToOne(() => Post, (post) => post.id)
    @JoinColumn({ name: "post_id" })
    post: Post

}