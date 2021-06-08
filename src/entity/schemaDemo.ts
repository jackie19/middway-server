import { CreateApiPropertyDoc } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/decorator';
import { custom } from '../core/lib';

/**
 * schema
 */

const options = [
  {
    label: 'area1',
    value: {
      id: 'shanghai',
      name: 'shanghai',
    },
  },
];

const el = {
  valueKey: 'id',
};

export class DemoSchemaEntity {
  @CreateApiPropertyDoc('标题', {
    example: '华为荣耀',
  })
  @Rule(RuleType.string().required().max(10).min(1))
  title: string;

  @CreateApiPropertyDoc('价格', { example: 99 })
  @Rule(RuleType.number().required().max(100))
  price: number;

  @CreateApiPropertyDoc('对象数组', {
    example: {
      name: 'foo',
    },
  })
  @Rule(RuleType.array().items({ name: 'foo' }, { name: 'bar' }))
  objArray: string;

  @CreateApiPropertyDoc('方法', { example: 'GET' })
  @Rule(RuleType.array().items('GET', 'POST', 'DELETE', 'PUT'))
  method: string;

  @CreateApiPropertyDoc('自定义', { example: '' })
  @Rule(RuleType.any().allow('el-input'))
  custom: any;

  @CreateApiPropertyDoc('多选', { example: '' })
  @Rule(RuleType.array().allow('checkbox-group').items('GET', 'POST'))
  checkbox: string;

  @CreateApiPropertyDoc('单选', { example: '' })
  @Rule(RuleType.array().allow('radio-group').items('male', 'female'))
  radio: string;

  @CreateApiPropertyDoc('布尔', { example: false })
  @Rule(RuleType.boolean())
  bool: boolean;

  @CreateApiPropertyDoc('分类', {
    description: '产品分类',
    example: [{ id: 1, name: 'electron' }],
  })
  @Rule(custom('array', 'option', 'el').array().option(options).el(el))
  category;
}
