import { Provide } from '@midwayjs/decorator';
import { IController } from '../../core/decorator/controller';
import { DemoAppCategoryEntity } from '../../entity/category';
import { APIS } from '../../core/constants/global';

@Provide()
@IController('/category', undefined, {
  api: [APIS.ADD, APIS.UPDATE, APIS.DELETE, APIS.LIST, APIS.INFO],
  entity: DemoAppCategoryEntity,
})
export class CategoryController {}
