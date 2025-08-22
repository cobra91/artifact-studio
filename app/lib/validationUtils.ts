import { PropertyValue,ValidationRule, ValidationType as _ValidationType } from "../types/artifact";

export const validateProperty = (
  value: PropertyValue,
  rules: ValidationRule[],
): string | null => {
  for (const rule of rules) {
    switch (rule.type) {
      case "required":
        if (value === null || value === undefined || value === "") {
          return rule.message;
        }
        break;
      case "minLength":
        if (typeof value === "string" && value.length < (rule.value as number)) {
          return rule.message;
        }
        break;
      case "maxLength":
        if (typeof value === "string" && value.length > (rule.value as number)) {
          return rule.message;
        }
        break;
      case "min":
        if (typeof value === "number" && value < (rule.value as number)) {
          return rule.message;
        }
        break;
      case "max":
        if (typeof value === "number" && value > (rule.value as number)) {
          return rule.message;
        }
        break;
      case "pattern":
        if (typeof value === "string" && !new RegExp(rule.value as string).test(value)) {
          return rule.message;
        }
        break;
      case "email":
        // Basic email regex, can be more comprehensive
        if (typeof value === "string" && !/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,6}$/.test(value)) {
          return rule.message;
        }
        break;
      case "url":
        // Basic URL regex, can be more comprehensive
        if (typeof value === "string" && !/^https?:\/\/[^\s/$.?#].[^\s]*$/.test(value)) {
          return rule.message;
        }
        break;
      default:
        break;
    }
  }
  return null; // No validation errors
};
