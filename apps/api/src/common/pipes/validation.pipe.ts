import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { LoggerService } from '../../modules/logger/logger.service';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  constructor(private readonly logger: LoggerService) {}

  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const validationErrors = this.formatErrors(errors);

      this.logger.error('ValidationPipe', {
        message: 'Validation failed',
        errors: validationErrors,
        value,
      });

      throw new BadRequestException({
        message: '请求参数验证失败',
        errors: validationErrors,
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatErrors(errors: any[]) {
    return errors.reduce((acc, err) => {
      acc[err.property] = Object.values(err.constraints);
      return acc;
    }, {});
  }
}
