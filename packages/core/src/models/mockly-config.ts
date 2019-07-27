import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

/**
 * Mockly server configuration.
 */
export class MocklyConfig {
  @IsString()
  @IsOptional()
  public readonly customControllersGlob: string;

  @IsInt()
  @Min(0)
  @Max(50000)
  @IsOptional()
  public readonly delay: number;

  @IsInt()
  @IsOptional()
  public readonly port: number;

  @IsString()
  @IsOptional()
  public readonly prefix: string;

  @IsString()
  @IsOptional()
  public readonly resourceFilesGlob: string;

  @IsString()
  @IsOptional()
  public readonly rewritesFilesGlob: string;

  @IsString()
  @IsOptional()
  public readonly responsesConfigGlob: string;

  constructor(
    customControllersGlob: string,
    delay: number,
    port: number,
    prefix: string,
    resourceFilesGlob: string,
    rewritesFilesGlob: string,
    responsesConfigGlob: string
  ) {
    this.customControllersGlob = customControllersGlob;
    this.delay = delay;
    this.port = port;
    this.prefix = prefix;
    this.resourceFilesGlob = resourceFilesGlob;
    this.rewritesFilesGlob = rewritesFilesGlob;
    this.responsesConfigGlob = responsesConfigGlob;
  }
}
