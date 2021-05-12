import { MetaStorage } from './MetaStorage';
import {
  RULES_KEY,
  saveClassMetadata,
  saveModule,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import { MetadataUtils } from 'typeorm/metadata-builder/MetadataUtils';

import { IRules, AnyObject, ValidDataFunc, RuleItem } from './interface';
import { filterByTarget } from './filterByTarget';

class MetaDataStore {
  store: MetaStorage;
  constructor() {
    this.store = new MetaStorage();
  }
}

export const metaDataStore = new MetaDataStore();

export function EntityValidator() {
  return target => {
    let rules = metaDataStore.store.rules;

    const targetTree = MetadataUtils.getInheritanceTree(target);
    rules = filterByTarget(rules, targetTree).map(({ rules }) => rules);

    saveModule(RULES_KEY, target);
    saveClassMetadata(RULES_KEY, rules, target);
    Scope(ScopeEnum.Request)(target);
  };
}

export function Rules(rules: IRules) {
  return (target: any, name: string) => {
    metaDataStore.store.rules.push({
      target: target.constructor,
      rules: {
        [name]: rules.map(item => {
          return {
            ...item,
            name,
          };
        }),
      },
    });
  };
}

export function validate(rules, data: ValidDataFunc | AnyObject) {
  let messages = '';
  let validData = data as any;

  if (typeof data === 'function') {
    validData = data();
  }

  const result = rules.every(ruleObject => {
    const [[key, rules]] = Object.entries(ruleObject) as [string, IRules][];
    const value = validData[key];

    return rules.every((item: RuleItem) => {
      if (item.required && !value) {
        messages = item.message;
        return false;
      }
      if (item.type && typeof value !== item.type) {
        messages = item.message;
        return false;
      }
      if (item.validator) {
        const bool = item.validator(value);
        if (!bool) {
          messages = item.message;
        }
        return bool;
      }
      return true;
    });
  });

  return {
    success: result,
    error: {
      messages,
    },
    data,
  };
}
