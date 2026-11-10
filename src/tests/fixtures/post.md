# Main title {#custom-id}

Intro paragraph with **bold**, _italic_, ~~strike~~, `inline code` and a [link](https://example.com).

## Table of contents

## Section one

Autolink: https://example.org and a footnote reference[^1].

- [x] done task
- [ ] open task

1. first
2. second

| Name  | Value |
| :---- | ----: |
| alpha |     1 |
| beta  |     2 |

> A quote with a nested `code` span.

### Code

```ts
const answer: number = 42;
console.log(answer);
```

```unknownlang
plain text block
```

```
no language
```

## Math

Inline math $e^{i\pi} + 1 = 0$ inside text.

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$

## Raw HTML

<div class="custom">raw <b>html</b></div>

<script>alert('xss')</script>

<img src="x" onerror="alert('xss')" />

[js link](javascript:alert('xss'))

![image](https://example.com/image.png)

[^1]: The footnote text.
