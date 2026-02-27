import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class ChatHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;

  @Column({ nullable: true })
  image_path: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.chatHistories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  user_id: number;
}
