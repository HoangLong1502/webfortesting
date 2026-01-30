import * as Joi from 'joi';

export interface EnvVars {
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
}

export const envValidationSchema: Joi.ObjectSchema<EnvVars> = Joi.object<EnvVars>({
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().min(1).required(),
  DB_NAME: Joi.string().required(),
});
