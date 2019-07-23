import { IsNotEmpty, IsString } from 'class-validator';

export class RewriteConfig {
  @IsString()
  @IsNotEmpty()
  from: string;

  @IsString()
  @IsNotEmpty()
  to: string;

  constructor(from: string, to: string) {
    this.from = from;
    this.to = to;
  }
}
