import {
  Provide,
  getClassMetadata,
  getPropertyMetadata,
  RULES_KEY,
} from '@midwayjs/decorator';
import { SWAGGER_DOCUMENT_KEY } from '@midwayjs/swagger';
import { SwaggerDefinition } from '@midwayjs/swagger/dist/lib/document';

function mixWhenPropertyEmpty(target, source) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (!target[key] && source[key]) {
        // options 和 joi 冲突了,手动转为 options
        if (key === 'option') {
          target['options'] = source[key];
        } else {
          target[key] = source[key];
        }
      }
    }
  }
}
@Provide()
export class SchemaService {
  getProperties(entityClass, decoratorNameKey, properties = {}) {
    properties = {
      ...getClassMetadata(decoratorNameKey, entityClass),
      ...properties,
    };
    const superClass = Object.getPrototypeOf(entityClass);
    if (!superClass.name) {
      return properties;
    }
    return this.getProperties(superClass, decoratorNameKey, properties);
  }
  async schema(param, { entity }) {
    const properties = this.getProperties(entity, SWAGGER_DOCUMENT_KEY);
    const swaggerDefinition = new SwaggerDefinition();
    for (const propertyName in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, propertyName)) {
        swaggerDefinition.properties[propertyName] = {
          label: properties[propertyName].description,
          default: properties[propertyName].example,
        };
      }
    }
    const rules = this.getProperties(entity, RULES_KEY);
    if (rules) {
      const ruleKeys = Object.keys(rules);
      for (const property of ruleKeys) {
        const describe = rules[property].describe();
        swaggerDefinition.properties[property].type = describe.type;
        if (Array.isArray(describe?.rules)) {
          describe.rules.forEach(rule => {
            if (rule.name === 'max') {
              swaggerDefinition.properties[property].max = rule.args.limit;
            }
            if (rule.name === 'min') {
              swaggerDefinition.properties[property].min = rule.args.limit;
            }
          });
        }

        // 数组类型的 items
        if (Array.isArray(describe.items)) {
          const items = describe.items
            .map(i => i.allow)
            .flat()
            .filter(i => typeof i === 'string');
          swaggerDefinition.properties[property].options = items.map(label => ({
            label,
            value: label,
          }));
        }

        if (describe.example) {
          swaggerDefinition.properties[property].example = describe.example;
        }

        // boolean 转 switch
        if (swaggerDefinition.properties[property].type === 'boolean') {
          swaggerDefinition.properties[property].type = 'switch';
        }

        // number 转 input-number
        if (swaggerDefinition.properties[property].type === 'number') {
          swaggerDefinition.properties[property].type = 'input-number';
        }

        // custom component use : allow
        if (Array.isArray(describe.allow) && describe.allow.length) {
          swaggerDefinition.properties[property].type = describe.allow[0];
        }

        // set required
        if (describe?.flags?.presence === 'required') {
          swaggerDefinition.required.push(property);
          swaggerDefinition.properties[property].required = true;
          describe.flags.presence = undefined;
        }

        // 自定义flags
        if (describe.flags) {
          mixWhenPropertyEmpty(
            swaggerDefinition.properties[property],
            describe.flags
          );
        }

        // get property description
        const propertyInfo = getPropertyMetadata(
          SWAGGER_DOCUMENT_KEY,
          entity,
          property
        );

        if (propertyInfo) {
          mixWhenPropertyEmpty(
            swaggerDefinition.properties[property],
            propertyInfo
          );
        }
      }
    }

    return Object.keys(swaggerDefinition.properties).map(id => {
      return {
        id,
        ...swaggerDefinition.properties[id],
      };
    });
  }
}
