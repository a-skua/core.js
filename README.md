# core.js

My favorite types.

## Usage

```ts
import { Result } from "@asuka/core";

function toUpperCase(obj: any): Result<string> {
  if (typeof obj === "string") {
    return Result.ok(obj.toUpperCase());
  }

  return Result.err(new Error("is not string"));
}

const result = toUpperCase(1);
if (result.ok) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```
