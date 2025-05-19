import { HttpExceptionFilter } from 'src/filters/httpException.filter';
import { TypeOrmExceptionFilter } from 'src/filters/typeOrmException.filter';
import { IBase } from 'src/interfaces/models.interface';

export function isExitItem<T extends IBase>(value: any): value is T {
  return value !== null && typeof value === 'object' && typeof value.id === 'string';
}

export function isErrorInstance(error: any): error is HttpExceptionFilter | TypeOrmExceptionFilter {
  return error instanceof HttpExceptionFilter || error instanceof TypeOrmExceptionFilter;
}
