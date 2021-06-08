import * as Joi from 'joi';

export const custom = (type, ...methods) =>
  Joi.extend(joi => {
    const rules = methods.reduce((acc, cur) => {
      acc[cur] = {
        method(val) {
          return this.$_setFlag(cur, val);
        },
      };
      return acc;
    }, {});
    return {
      type,
      base: joi[type](),
      rules,
    };
  });
