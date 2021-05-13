import { Provide } from '@midwayjs/decorator';
import { IController } from '../../core/decorator/controller';
import { DemoAppCategoryEntity } from '../../entity/category';

@Provide()
@IController('/category', undefined, {
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  entity: DemoAppCategoryEntity,
})
export class CategoryController {}
