import { PrimaryGeneratedColumn, Column, Entity } from "typeorm";

@Entity({ name: "posts" })
export class Post {

    @PrimaryGeneratedColumn({ type: "integer" })
    id: number;

    @Column()
    public title: string;

}
