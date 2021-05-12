// 部分数据验证需要从实体类获取字段
export interface ValidDataFunc {
  (...args: any[]): AnyObject;
}

export interface AnyObject {
  [propName: string]: any;
}

export interface ValidCallbackFunc {
  (msg: string): void | any;
}

export interface ValidatorFunc {
  (value: string | number): boolean;
}

export interface Store {
  [propName: string]: any;
}

export interface RuleItem {
  required?: boolean;
  type?: string;
  message: string;
  validator?: ValidatorFunc;
  [propName: string]: any;
}

export type IRules = RuleItem[];
