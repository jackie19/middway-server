import { Provide } from '@midwayjs/decorator';
import { IController } from '../../core/decorator/controller';
import { DemoSchemaEntity } from '../../entity/schemaDemo';
import { APIS } from '../../core/constants/global';

@Provide()
@IController('/schema', undefined, {
  api: [APIS.SCHEMA],
  entity: DemoSchemaEntity,
})
export class SchemaController {}
