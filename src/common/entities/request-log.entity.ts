import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class RequestLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  username: string;

  // @Column({ nullable: true })
  // ip: string;

  @Column()
  method: string;

  @Column()
  path: string;

  @Column({ type: 'text', nullable: true })
  params: string;

  @Column()
  statusCode: number;

  @Column()
  duration: number; // in milliseconds

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  referer: string;

  @CreateDateColumn()
  createdAt: Date;
}
