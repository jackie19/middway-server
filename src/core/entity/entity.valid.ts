/*
 * 类型校验器
 * 支持部分验证 done
 * 支持自定义验证方法 done
 * */

import {
  Scope,
  ScopeEnum,
  saveClassMetadata,
  saveModule,
  RULES_KEY,
} from '@midwayjs/decorator';

import {
  ValidDataFunc,
  ValidCallbackFunc,
  RuleItem,
  Rules,
  Store,
  AnyObject,
} from './entity.valid.interface';

export class EntityValid {
  constructor(scope: string) {
    this.scope = scope || 'default';
    this.store[this.scope] = {};
  }
  scope = '';
  store: Store = {};

  static validate(rules, data: ValidDataFunc | AnyObject) {
    let messages = '';
    let validData = data;

    if (typeof data === 'function') {
      validData = data();
    }
    const result = Object.entries(validData).every(([key, value]): boolean => {
      if (rules[key]) {
        return rules[key].every((item): boolean => {
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
      }
      return true;
    });

    return {
      success: result,
      error: {
        messages,
      },
      data,
    };
  }

  registerEntity() {
    return target => {
      console.log(this.store, '===store');
      saveModule(RULES_KEY, target);
      saveClassMetadata(RULES_KEY, this.store[this.scope], target);
      Scope(ScopeEnum.Request)(target);
    };
  }

  // 切片
  valid(
    data: ValidDataFunc | AnyObject,
    cb: ValidCallbackFunc = (msg: string): any => {}
  ) {
    return (target: any, name: string, descriptor: PropertyDescriptor) => {
      const oldValue = descriptor.value;
      const that = this as any;
      let result: boolean;
      descriptor.value = function (...args: any[]) {
        let messages = '';
        let validData = data;
        if (typeof data === 'function') {
          validData = data(...args);
        }
        result = Object.entries(validData).every(([key, value]): boolean => {
          const rules: Rules = that.store[that.scope][key];
          if (rules) {
            return rules.every((item): boolean => {
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
          }
          return true;
        });

        if (!result) {
          cb(messages);
          return;
        }
        return oldValue.apply(this, args);
      };
      return descriptor;
    };
  }

  rules(rules: Rules) {
    return (target: any, name: string) => {
      this.store[this.scope][name] = rules.map(
        (item: RuleItem): RuleItem => {
          return {
            ...item,
            name,
          };
        }
      );
    };
  }
}
