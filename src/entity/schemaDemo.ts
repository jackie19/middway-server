import { CreateApiPropertyDoc } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/decorator';

/**
 * schema
 */
export class DemoSchemaEntity {
  @CreateApiPropertyDoc('标题', {
    example: '华为荣耀',
  })
  @Rule(RuleType.string().required().max(10).min(1))
  title: string;

  @CreateApiPropertyDoc('价格', { example: 99 })
  @Rule(RuleType.number().required().max(100))
  price: number;

  @CreateApiPropertyDoc('方法', { example: 'GET' })
  @Rule(RuleType.array().items('GET', 'POST', 'DELETE', 'PUT'))
  method: string;

  @CreateApiPropertyDoc('分类', {
    description: '产品分类',
    example: [{ id: 1, name: 'electron' }],
  })
  @Rule(
    RuleType.array().items(
      RuleType.object({
        id: RuleType.number,
        name: RuleType.string,
      })
    )
  )
  category;
}
