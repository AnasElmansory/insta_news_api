const Joi = require("joi");

const userSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  avatar: Joi.string(),
  name: Joi.string().max(50).default(Joi.ref("email")),
  provider: Joi.string().required(),
});
const adminSchema = Joi.object({
  id: Joi.string().required(),
  email: Joi.string().email().required(),
  avatar: Joi.string(),
  name: Joi.string().max(50).default(Joi.ref("email")),
  provider: Joi.string().required(),
  permission: Joi.string().default("editor"),
});

const sourceSchema = Joi.object({
  id: Joi.string().required(),
  username: Joi.string().required(),
  name: Joi.string().max(50).required(),
  profile_image_url: Joi.string().default(""),
  url: Joi.string().default(""),
  location: Joi.string(),
  description: Joi.string(),
  created_at: Joi.string(),
  verified: Joi.bool(),
});

const newsSchema = Joi.object({
  id: Joi.string().required(),
  author_id: Joi.string(),
  text: Joi.string(),
  lang: Joi.string(),
  source: Joi.string(),
  location: Joi.string(),
  created_at: Joi.string(),
  attachments: Joi.object(),
  public_metrics: Joi.object(),
  media: Joi.array(),
});

module.exports = {
  userSchema,
  sourceSchema,
  adminSchema,
  newsSchema,
};
