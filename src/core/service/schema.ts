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
    if (!target[key] && source[key]) {
      target[key] = source[key];
    }
  }
}
@Provide()
export class SchemaService {
  async schema(param, { entity }) {
    const properties = getClassMetadata(SWAGGER_DOCUMENT_KEY, entity);
    const swaggerDefinition = new SwaggerDefinition();
    swaggerDefinition.name = entity.name;
    swaggerDefinition.type = 'object';
    for (const propertyName in properties) {
      if (Object.prototype.hasOwnProperty.call(properties, propertyName)) {
        swaggerDefinition.properties[propertyName] = {
          label: properties[propertyName].description,
          default: properties[propertyName].example,
        };
      }
    }
    const rules = getClassMetadata(RULES_KEY, entity);
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
          properties[property].elements = properties[property].elements || {};
          swaggerDefinition.properties[property].elements =
            swaggerDefinition.properties[property].elements || {};
          swaggerDefinition.properties[
            property
          ].elements.one_of = describe.items
            .map(i => i.allow)
            .flat()
            .filter(i => typeof i === 'string');
          swaggerDefinition.properties[property].elements.type = 'string';
        }

        if (describe.example) {
          swaggerDefinition.properties[property].example = describe.example;
        }

        // custom component
        if (Array.isArray(describe.allow) && describe.allow.length) {
          swaggerDefinition.properties[property].component = describe.allow[0];
        }

        // set required
        if (describe?.flags?.presence === 'required') {
          swaggerDefinition.required.push(property);
          swaggerDefinition.properties[property].required = true;
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

    return swaggerDefinition.properties;
  }
}
