import {
  IsIn,
  IsString,
  IsInt,
  Max,
  Min,
  IsOptional, IsJSON
} from 'class-validator';

export class ResponseConfig {
  constructor(
    body: any,
    cookies: { [key: string]: string },
    delay: number,
    headers: { [key: string]: string },
    method: string,
    path: string,
    status: number,
  ) {
    this.body = body;
    this.cookies = cookies;
    this.headers = headers;
    this.delay = delay;
    this.method = method;
    this.path = path;
    this.status = status;
  }

  @IsOptional()
  body?: any;

  @IsOptional()
  @IsJSON()
  cookies?: { [key: string]: string };

  @IsInt()
  @Min(0)
  @Max(50000)
  @IsOptional()
  delay?: number;

  @IsOptional()
  @IsJSON()
  headers?: { [key: string]: string };

  @IsString()
  @IsIn(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  @IsOptional()
  method: string;

  @IsString()
  @IsOptional()
  path: string;

  @IsInt()
  @IsIn([200, 201, 202, 204, 302, 400, 401, 403, 404, 409, 500])
  @IsOptional()
  status: number;
}
