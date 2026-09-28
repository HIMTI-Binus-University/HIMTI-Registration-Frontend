import axios from "axios";

export type CanonicalApiError = {
  message: string;
  code?: string;
  details?: unknown;
  fieldErrors: Record<string, string>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function parseApiError(error: unknown): CanonicalApiError {
  const body = axios.isAxiosError(error) ? error.response?.data : error;
  if (!isRecord(body))
    return {
      message: "Something went wrong. Please try again.",
      fieldErrors: {},
    };
  const details = body.details;
  const detailFields = isRecord(details) ? details.fieldErrors : undefined;
  const issues = isRecord(details) ? details.issues : undefined;
  const arrayFields = Array.isArray(detailFields)
    ? detailFields.reduce<Record<string, string>>((result, item) => {
        if (
          isRecord(item) &&
          typeof item.questionId === "string" &&
          typeof item.message === "string" &&
          result[item.questionId] === undefined
        )
          result[item.questionId] = item.message;
        return result;
      }, {})
    : undefined;
  const source =
    arrayFields ??
    (isRecord(detailFields)
      ? detailFields
      : Array.isArray(issues)
        ? Object.fromEntries(
            issues.flatMap((issue) =>
              isRecord(issue) &&
              Array.isArray(issue.path) &&
              typeof issue.path[0] === "string" &&
              typeof issue.message === "string"
                ? [[issue.path[0], issue.message]]
                : [],
            ),
          )
        : isRecord(body.errors)
          ? body.errors
          : {});
  const fieldErrors = Object.fromEntries(
    Object.entries(source).flatMap(([key, value]) => {
      const message = Array.isArray(value) ? value[0] : value;
      return typeof message === "string" ? [[key, message]] : [];
    }),
  );
  return {
    message:
      typeof body.message === "string"
        ? body.message
        : typeof body.msg === "string"
          ? body.msg
          : "Something went wrong. Please try again.",
    code: typeof body.code === "string" ? body.code : undefined,
    details,
    fieldErrors,
  };
}
