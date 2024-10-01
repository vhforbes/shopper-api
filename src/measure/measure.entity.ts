import { CustomerEntity } from 'src/customer/customer.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'measure' })
export class MeasureEntity {
  @PrimaryGeneratedColumn('uuid')
  measure_uuid: string;

  @Column({ type: 'varchar', length: 255 })
  measure_type: string;

  @Column({ type: 'float' })
  measure_value: number;

  @Column({ type: 'varchar', length: 255 })
  image_url: string;

  @Column({ type: 'boolean', default: false })
  has_confirmed: boolean;

  @Column({ type: 'timestamp' })
  measure_datetime: Date;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn({ name: 'customer_code' })
  customer: CustomerEntity;
}
