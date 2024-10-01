import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('measure')
export class MeasureEntity {
  @PrimaryGeneratedColumn('uuid')
  measure_uuid: string;

  @Column({ type: 'varchar', length: 255 })
  measure_type: string;

  @Column({ type: 'varchar', length: 255 })
  image_url: string;

  @Column({ type: 'boolean', default: false })
  has_confirmed: boolean;

  @Column({ type: 'timestamp' })
  measure_datetime: Date;
}
