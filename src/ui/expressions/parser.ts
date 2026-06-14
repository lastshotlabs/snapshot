import { getNestedValue } from "../context/utils";

type TokenType =
  | "identifier"
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "operator"
  | "punctuation";

interface Token {
  type: TokenType;
  value: string;
}

/**
 * Expression AST used by the safe expression evaluator.
 */
type AstNode =
  | { type: "literal"; value: unknown }
  | { type: "ref"; path: string }
  | { type: "call"; name: "defined" | "empty" | "length"; ref: string }
  | { type: "unary"; operator: "!" | "-"; operand: AstNode }
  | { type: "binary"; operator: string; left: AstNode; right: AstNode }
  | {
      type: "ternary";
      condition: AstNode;
      consequent: AstNode;
      alternate: AstNode;
    }
  | {
      type: "method-call";
      object: AstNode;
      method: string;
      args: AstNode[];
    }
  | {
      type: "builtin-call";
      namespace: "Math" | "String";
      method: string;
      args: AstNode[];
    };

export interface ExpressionContext {
  [key: string]: unknown;
}

/**
 * Safe builtin allowlist available to expressions.
 */
export const SAFE_BUILTINS: Record<
  "Math" | "String",
  Record<string, (...args: unknown[]) => unknown>
> = {
  Math: {
    floor: (value: unknown) => Math.floor(Number(value)),
    ceil: (value: unknown) => Math.ceil(Number(value)),
    round: (value: unknown) => Math.round(Number(value)),
    abs: (value: unknown) => Math.abs(Number(value)),
    min: (...values: unknown[]) => Math.min(...values.map(Number)),
    max: (...values: unknown[]) => Math.max(...values.map(Number)),
  },
  String: {
    includes: (value: unknown, search: unknown) =>
      String(value).includes(String(search)),
    startsWith: (value: unknown, search: unknown) =>
      String(value).startsWith(String(search)),
    endsWith: (value: unknown, search: unknown) =>
      String(value).endsWith(String(search)),
    toLowerCase: (value: unknown) => String(value).toLowerCase(),
    toUpperCase: (value: unknown) => String(value).toUpperCase(),
    trim: (value: unknown) => String(value).trim(),
    length: (value: unknown) => String(value).length,
    slice: (value: unknown, start: unknown, end?: unknown) =>
      String(value).slice(
        Number(start),
        end !== undefined ? Number(end) : undefined,
      ),
  },
};

const OPERATOR_TOKENS = [
  "||",
  "&&",
  "==",
  "!=",
  ">=",
  "<=",
  ">",
  "<",
  "!",
  "+",
  "-",
  "*",
  "/",
  "%",
] as const;

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < input.length) {
    const current = input[index]!;
    if (/\s/.test(current)) {
      index += 1;
      continue;
    }

    const operator = OPERATOR_TOKENS.find((candidate) =>
      input.startsWith(candidate, index),
    );
    if (operator) {
      tokens.push({ type: "operator", value: operator });
      index += operator.length;
      continue;
    }

    if ("().[],:?".includes(current)) {
      tokens.push({ type: "punctuation", value: current });
      index += 1;
      continue;
    }

    if (current === "'" || current === '"') {
      const quote = current;
      let value = "";
      index += 1;
      while (index < input.length && input[index] !== quote) {
        if (input[index] === "\\" && index + 1 < input.length) {
          value += input[index + 1]!;
          index += 2;
          continue;
        }
        value += input[index]!;
        index += 1;
      }
      if (input[index] !== quote) {
        throw new Error(`Unterminated string literal in "${input}"`);
      }
      index += 1;
      tokens.push({ type: "string", value });
      continue;
    }

    if (/[0-9]/.test(current)) {
      let value = current;
      index += 1;
      while (index < input.length && /[0-9.]/.test(input[index]!)) {
        value += input[index]!;
        index += 1;
      }
      tokens.push({ type: "number", value });
      continue;
    }

    if (/[a-zA-Z_$]/.test(current)) {
      let value = current;
      index += 1;
      while (index < input.length && /[a-zA-Z0-9_$-]/.test(input[index]!)) {
        value += input[index]!;
        index += 1;
      }

      if (value === "true" || value === "false") {
        tokens.push({ type: "boolean", value });
      } else if (value === "null") {
        tokens.push({ type: "null", value });
      } else {
        tokens.push({ type: "identifier", value });
      }
      continue;
    }

    throw new Error(`Unexpected token "${current}" in expression "${input}"`);
  }

  return tokens;
}

class Parser {
  private readonly tokens: Token[];

  private index = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  parse(): AstNode {
    const expression = this.parseTernaryExpr();
    if (this.peek()) {
      throw new Error(`Unexpected token "${this.peek()!.value}"`);
    }
    return expression;
  }

  private parseTernaryExpr(): AstNode {
    const condition = this.parseOrExpr();
    if (!this.match("punctuation", "?")) {
      return condition;
    }

    const consequent = this.parseTernaryExpr();
    this.expect("punctuation", ":");
    const alternate = this.parseTernaryExpr();
    return {
      type: "ternary",
      condition,
      consequent,
      alternate,
    };
  }

  private parseOrExpr(): AstNode {
    let left = this.parseAndExpr();
    while (this.match("operator", "||")) {
      left = {
        type: "binary",
        operator: "||",
        left,
        right: this.parseAndExpr(),
      };
    }
    return left;
  }

  private parseAndExpr(): AstNode {
    let left = this.parseEqualityExpr();
    while (this.match("operator", "&&")) {
      left = {
        type: "binary",
        operator: "&&",
        left,
        right: this.parseEqualityExpr(),
      };
    }
    return left;
  }

  private parseEqualityExpr(): AstNode {
    let left = this.parseCompareExpr();
    while (true) {
      if (this.match("operator", "==")) {
        left = {
          type: "binary",
          operator: "==",
          left,
          right: this.parseCompareExpr(),
        };
        continue;
      }
      if (this.match("operator", "!=")) {
        left = {
          type: "binary",
          operator: "!=",
          left,
          right: this.parseCompareExpr(),
        };
        continue;
      }
      return left;
    }
  }

  private parseCompareExpr(): AstNode {
    let left = this.parseAddExpr();
    while (true) {
      const token = this.peek();
      if (
        token?.type === "operator" &&
        [">", "<", ">=", "<="].includes(token.value)
      ) {
        this.index += 1;
        left = {
          type: "binary",
          operator: token.value,
          left,
          right: this.parseAddExpr(),
        };
        continue;
      }
      return left;
    }
  }

  private parseAddExpr(): AstNode {
    let left = this.parseMultiplyExpr();
    while (true) {
      if (this.match("operator", "+")) {
        left = {
          type: "binary",
          operator: "+",
          left,
          right: this.parseMultiplyExpr(),
        };
        continue;
      }
      if (this.match("operator", "-")) {
        left = {
          type: "binary",
          operator: "-",
          left,
          right: this.parseMultiplyExpr(),
        };
        continue;
      }
      return left;
    }
  }

  private parseMultiplyExpr(): AstNode {
    let left = this.parseUnaryExpr();
    while (true) {
      if (this.match("operator", "*")) {
        left = {
          type: "binary",
          operator: "*",
          left,
          right: this.parseUnaryExpr(),
        };
        continue;
      }
      if (this.match("operator", "/")) {
        left = {
          type: "binary",
          operator: "/",
          left,
          right: this.parseUnaryExpr(),
        };
        continue;
      }
      if (this.match("operator", "%")) {
        left = {
          type: "binary",
          operator: "%",
          left,
          right: this.parseUnaryExpr(),
        };
        continue;
      }
      return left;
    }
  }

  private parseUnaryExpr(): AstNode {
    if (this.match("operator", "!")) {
      return {
        type: "unary",
        operator: "!",
        operand: this.parseUnaryExpr(),
      };
    }

    if (this.match("operator", "-")) {
      return {
        type: "unary",
        operator: "-",
        operand: this.parseUnaryExpr(),
      };
    }

    return this.parseCallExpr();
  }

  private parseCallExpr(): AstNode {
    let current = this.parsePrimary();

    while (this.match("punctuation", ".")) {
      const method = this.expect("identifier").value;
      const args = this.parseCallArgs();

      if (
        current.type === "ref" &&
        (current.path === "Math" || current.path === "String")
      ) {
        current = {
          type: "builtin-call",
          namespace: current.path,
          method,
          args,
        };
        continue;
      }

      current = {
        type: "method-call",
        object: current,
        method,
        args,
      };
    }

    return current;
  }

  private parseCallArgs(): AstNode[] {
    this.expect("punctuation", "(");
    const args: AstNode[] = [];
    if (this.match("punctuation", ")")) {
      return args;
    }

    while (true) {
      args.push(this.parseTernaryExpr());
      if (this.match("punctuation", ")")) {
        return args;
      }
      this.expect("punctuation", ",");
    }
  }

  private parsePrimary(): AstNode {
    if (this.match("punctuation", "(")) {
      const expression = this.parseTernaryExpr();
      this.expect("punctuation", ")");
      return expression;
    }

    const token = this.peek();
    if (!token) {
      throw new Error("Unexpected end of expression");
    }

    if (token.type === "string") {
      this.index += 1;
      return { type: "literal", value: token.value };
    }

    if (token.type === "number") {
      this.index += 1;
      return { type: "literal", value: Number(token.value) };
    }

    if (token.type === "boolean") {
      this.index += 1;
      return { type: "literal", value: token.value === "true" };
    }

    if (token.type === "null") {
      this.index += 1;
      return { type: "literal", value: null };
    }

    if (token.type === "identifier") {
      const identifier = token.value;
      if (
        ["defined", "empty", "length"].includes(identifier) &&
        this.peek(1)?.value === "("
      ) {
        this.index += 1;
        this.expect("punctuation", "(");
        const ref = this.parseRef();
        this.expect("punctuation", ")");
        return {
          type: "call",
          name: identifier as "defined" | "empty" | "length",
          ref,
        };
      }

      return {
        type: "ref",
        path: this.parseRef(),
      };
    }

    throw new Error(`Unexpected token "${token.value}"`);
  }

  private parseRef(): string {
    const first = this.expect("identifier");
    let path = first.value;

    while (true) {
      if (this.match("punctuation", ".")) {
        const next = this.expect("identifier");
        path += `.${next.value}`;
        continue;
      }

      if (this.match("punctuation", "[")) {
        const next = this.peek();
        if (!next) {
          throw new Error("Unexpected end of expression");
        }

        if (next.type === "number" || next.type === "string") {
          this.index += 1;
          path += `[${next.type === "string" ? JSON.stringify(next.value) : next.value}]`;
          this.expect("punctuation", "]");
          continue;
        }

        throw new Error(`Invalid ref segment "${next.value}"`);
      }

      break;
    }

    return path;
  }

  private match(type: TokenType, value?: string): boolean {
    const token = this.peek();
    if (!token || token.type !== type || (value && token.value !== value)) {
      return false;
    }
    this.index += 1;
    return true;
  }

  private expect(type: TokenType, value?: string): Token {
    const token = this.peek();
    if (!token || token.type !== type || (value && token.value !== value)) {
      throw new Error(
        `Expected ${value ?? type} but found "${token?.value ?? "<eof>"}"`,
      );
    }
    this.index += 1;
    return token;
  }

  private peek(offset = 0): Token | undefined {
    return this.tokens[this.index + offset];
  }
}

function toNumber(value: unknown): number {
  return typeof value === "number" ? value : Number(value);
}

function resolveRefPath(path: string, context: ExpressionContext): unknown {
  const normalized = path.replace(/\[("([^"]*)"|'([^']*)'|[0-9]+)\]/g, ".$1");
  const cleaned = normalized
    .replace(/\."([^"]*)"/g, ".$1")
    .replace(/\.'([^']*)'/g, ".$1");

  return getNestedValue(context, cleaned);
}

function isEmpty(value: unknown): boolean {
  if (value == null || value === "") {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === "object") {
    return Object.keys(value as Record<string, unknown>).length === 0;
  }
  return false;
}

function evaluateMethodCall(
  objectValue: unknown,
  method: string,
  args: unknown[],
): unknown {
  switch (method) {
    case "includes":
      return String(objectValue).includes(String(args[0]));
    case "startsWith":
      return String(objectValue).startsWith(String(args[0]));
    case "endsWith":
      return String(objectValue).endsWith(String(args[0]));
    case "toLowerCase":
      return String(objectValue).toLowerCase();
    case "toUpperCase":
      return String(objectValue).toUpperCase();
    case "trim":
      return String(objectValue).trim();
    case "length":
      return String(objectValue).length;
    case "slice":
      return String(objectValue).slice(
        Number(args[0]),
        args[1] !== undefined ? Number(args[1]) : undefined,
      );
    default:
      throw new Error(`Unknown method "${method}" in expression`);
  }
}

function evaluateAst(node: AstNode, context: ExpressionContext): unknown {
  switch (node.type) {
    case "literal":
      return node.value;
    case "ref":
      return resolveRefPath(node.path, context);
    case "call": {
      const value = resolveRefPath(node.ref, context);
      switch (node.name) {
        case "defined":
          return value !== undefined && value !== null;
        case "empty":
          return isEmpty(value);
        case "length":
          return value != null && "length" in Object(value)
            ? Number((value as { length?: unknown }).length ?? 0)
            : 0;
      }
    }
    case "unary":
      return node.operator === "-"
        ? -toNumber(evaluateAst(node.operand, context))
        : !Boolean(evaluateAst(node.operand, context));
    case "ternary":
      return Boolean(evaluateAst(node.condition, context))
        ? evaluateAst(node.consequent, context)
        : evaluateAst(node.alternate, context);
    case "builtin-call": {
      const namespace = SAFE_BUILTINS[node.namespace];
      const method = namespace[node.method];
      if (!method) {
        throw new Error(
          `Unknown builtin "${node.namespace}.${node.method}" in expression`,
        );
      }
      return method(...node.args.map((arg) => evaluateAst(arg, context)));
    }
    case "method-call":
      return evaluateMethodCall(
        evaluateAst(node.object, context),
        node.method,
        node.args.map((arg) => evaluateAst(arg, context)),
      );
    case "binary": {
      if (node.operator === "||") {
        return Boolean(evaluateAst(node.left, context)) ||
          Boolean(evaluateAst(node.right, context));
      }
      if (node.operator === "&&") {
        return Boolean(evaluateAst(node.left, context)) &&
          Boolean(evaluateAst(node.right, context));
      }

      const left = evaluateAst(node.left, context);
      const right = evaluateAst(node.right, context);

      switch (node.operator) {
        case "==":
          // eslint-disable-next-line eqeqeq
          return left == right;
        case "!=":
          // eslint-disable-next-line eqeqeq
          return left != right;
        case ">":
          return toNumber(left) > toNumber(right);
        case "<":
          return toNumber(left) < toNumber(right);
        case ">=":
          return toNumber(left) >= toNumber(right);
        case "<=":
          return toNumber(left) <= toNumber(right);
        case "+":
          return typeof left === "string" || typeof right === "string"
            ? `${left ?? ""}${right ?? ""}`
            : toNumber(left) + toNumber(right);
        case "-":
          return toNumber(left) - toNumber(right);
        case "*":
          return toNumber(left) * toNumber(right);
        case "/":
          return toNumber(left) / toNumber(right);
        case "%":
          return toNumber(left) % toNumber(right);
        default:
          return false;
      }
    }
  }
}

export function evaluateExpression(
  expression: string,
  context: ExpressionContext,
): unknown {
  return evaluateAst(new Parser(tokenize(expression)).parse(), context);
}

export function extractExpressionRefs(expression: string): string[] {
  const refs = new Set<string>();
  const ast = new Parser(tokenize(expression)).parse();

  const walk = (node: AstNode): void => {
    switch (node.type) {
      case "ref":
        if (node.path !== "Math" && node.path !== "String") {
          refs.add(node.path);
        }
        return;
      case "call":
        refs.add(node.ref);
        return;
      case "unary":
        walk(node.operand);
        return;
      case "binary":
        walk(node.left);
        walk(node.right);
        return;
      case "ternary":
        walk(node.condition);
        walk(node.consequent);
        walk(node.alternate);
        return;
      case "method-call":
        walk(node.object);
        node.args.forEach(walk);
        return;
      case "builtin-call":
        node.args.forEach(walk);
        return;
      case "literal":
        return;
    }
  };

  walk(ast);
  return [...refs];
}
