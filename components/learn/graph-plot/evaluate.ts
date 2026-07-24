/**
 * A tiny, safe math-expression evaluator for the ```graph renderer.
 *
 * Lesson content is authored by us in the seed, but it still travels through the
 * database and the markdown pipeline as a plain string — so we never want to run
 * it through `eval`/`new Function`. Instead we tokenise, convert to RPN with a
 * shunting-yard pass, and interpret. The only free variable is `x`; everything
 * else is a fixed whitelist of functions and constants.
 *
 * `compile("exp(-x) * sin(x)")` returns `(x: number) => number`, reusing one RPN
 * program across the ~400 samples a curve needs. A malformed expression throws,
 * and the caller renders a graceful fallback instead of a broken plot.
 */

type Token =
  | { t: "num"; v: number }
  | { t: "var" }
  | { t: "op"; v: string }
  | { t: "fn"; v: string }
  | { t: "lp" }
  | { t: "rp" }
  | { t: "comma" }

const FUNCTIONS: Record<string, (a: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10, // Khmer curriculum "log" is base-10
  log10: Math.log10,
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  abs: Math.abs,
  sign: Math.sign,
  floor: Math.floor,
  ceil: Math.ceil,
}

const CONSTANTS: Record<string, number> = {
  pi: Math.PI,
  e: Math.E,
}

/** Binary operators: precedence + associativity. Unary minus is `u-` (prec 5). */
const BINARY: Record<string, { prec: number; right: boolean }> = {
  "+": { prec: 2, right: false },
  "-": { prec: 2, right: false },
  "*": { prec: 3, right: false },
  "/": { prec: 3, right: false },
  "^": { prec: 4, right: true },
}

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  const isDigit = (c: string) => c >= "0" && c <= "9"
  const isAlpha = (c: string) =>
    (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_"

  while (i < src.length) {
    const c = src[i]
    if (c === " " || c === "\t" || c === "\n") {
      i++
      continue
    }
    if (isDigit(c) || (c === "." && isDigit(src[i + 1] ?? ""))) {
      let j = i + 1
      while (j < src.length && (isDigit(src[j]) || src[j] === ".")) j++
      // scientific notation: 1e-3, 2.5E6
      if (src[j] === "e" || src[j] === "E") {
        let k = j + 1
        if (src[k] === "+" || src[k] === "-") k++
        if (isDigit(src[k] ?? "")) {
          k++
          while (k < src.length && isDigit(src[k])) k++
          j = k
        }
      }
      tokens.push({ t: "num", v: Number(src.slice(i, j)) })
      i = j
      continue
    }
    if (isAlpha(c)) {
      let j = i + 1
      while (j < src.length && (isAlpha(src[j]) || isDigit(src[j]))) j++
      const name = src.slice(i, j)
      if (name === "x" || name === "X") tokens.push({ t: "var" })
      else if (name in FUNCTIONS) tokens.push({ t: "fn", v: name })
      else if (name in CONSTANTS) tokens.push({ t: "num", v: CONSTANTS[name] })
      else throw new Error(`Unknown name "${name}"`)
      i = j
      continue
    }
    if (c === "(") {
      tokens.push({ t: "lp" })
      i++
      continue
    }
    if (c === ")") {
      tokens.push({ t: "rp" })
      i++
      continue
    }
    if (c === ",") {
      tokens.push({ t: "comma" })
      i++
      continue
    }
    if (c in BINARY) {
      tokens.push({ t: "op", v: c })
      i++
      continue
    }
    throw new Error(`Unexpected character "${c}"`)
  }
  return tokens
}

/** Shunting-yard → RPN, resolving unary +/- to `u-` / dropping `u+`. */
function toRpn(tokens: Token[]): Token[] {
  const out: Token[] = []
  const stack: Token[] = []
  let prev: Token | null = null

  const isValueEnd = (tk: Token | null) =>
    tk !== null && (tk.t === "num" || tk.t === "var" || tk.t === "rp")

  for (const tk of tokens) {
    if (tk.t === "num" || tk.t === "var") {
      out.push(tk)
    } else if (tk.t === "fn") {
      stack.push(tk)
    } else if (tk.t === "comma") {
      while (stack.length && stack[stack.length - 1].t !== "lp")
        out.push(stack.pop()!)
    } else if (tk.t === "op") {
      // A +/- in prefix position is unary.
      if ((tk.v === "-" || tk.v === "+") && !isValueEnd(prev)) {
        if (tk.v === "-") stack.push({ t: "op", v: "u-" })
        // unary plus is a no-op
      } else {
        const o1 = BINARY[tk.v]
        while (stack.length) {
          const top = stack[stack.length - 1]
          if (top.t === "fn") {
            out.push(stack.pop()!)
            continue
          }
          if (top.t === "op") {
            if (top.v === "u-") {
              out.push(stack.pop()!)
              continue
            }
            const o2 = BINARY[top.v]
            if (o2 && (o2.prec > o1.prec || (o2.prec === o1.prec && !o1.right))) {
              out.push(stack.pop()!)
              continue
            }
          }
          break
        }
        stack.push(tk)
      }
    } else if (tk.t === "lp") {
      stack.push(tk)
    } else if (tk.t === "rp") {
      while (stack.length && stack[stack.length - 1].t !== "lp")
        out.push(stack.pop()!)
      if (!stack.length) throw new Error("Mismatched parentheses")
      stack.pop() // discard the "("
      if (stack.length && stack[stack.length - 1].t === "fn")
        out.push(stack.pop()!)
    }
    prev = tk
  }
  while (stack.length) {
    const top = stack.pop()!
    if (top.t === "lp") throw new Error("Mismatched parentheses")
    out.push(top)
  }
  return out
}

export function compile(expr: string): (x: number) => number {
  const rpn = toRpn(tokenize(expr))

  return (x: number) => {
    const st: number[] = []
    for (const tk of rpn) {
      if (tk.t === "num") st.push(tk.v)
      else if (tk.t === "var") st.push(x)
      else if (tk.t === "fn") {
        const a = st.pop()
        if (a === undefined) return NaN
        st.push(FUNCTIONS[tk.v](a))
      } else if (tk.t === "op") {
        if (tk.v === "u-") {
          const a = st.pop()
          if (a === undefined) return NaN
          st.push(-a)
          continue
        }
        const b = st.pop()
        const a = st.pop()
        if (a === undefined || b === undefined) return NaN
        switch (tk.v) {
          case "+":
            st.push(a + b)
            break
          case "-":
            st.push(a - b)
            break
          case "*":
            st.push(a * b)
            break
          case "/":
            st.push(a / b)
            break
          case "^":
            st.push(Math.pow(a, b))
            break
        }
      }
    }
    return st.length === 1 ? st[0] : NaN
  }
}
