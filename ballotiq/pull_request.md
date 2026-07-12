# Pull Request: Fix Client-Side XSS Sanitization Race Condition & Resolve Build Errors

## 🏷️ Program & Contribution Info
* **Program**: SSOC '26 (Social Summer of Code 2026)
* **Status**: Ready for review

---

## 📝 Description

### 🔒 Security Issue Fixed: XSS via Client-Side Race Condition
In `src/lib/security/sanitize.ts`, the `isomorphic-dompurify` library was loaded dynamically and asynchronously inside a `typeof window !== "undefined"` block. 

When the `SafeHTML` component mounted, it immediately called the synchronous helper `sanitizeAIResponse(html)`. If this ran before the dynamic import completed, `DOMPurifyInstance` was `null` and it fell back to a basic regex that only stripped `<script>` tags. This left the application vulnerable to XSS using other tags (such as `<img src=x onerror=...>`, `<svg onload=...>`, `<iframe src=...>`).

### 🛠️ Solution
1. **Dynamic-to-Synchronous Import (Client-Only)**: Changed the async dynamic `import()` to a synchronous `require()` inside the browser check in `sanitize.ts`. This guarantees that `DOMPurify` is loaded as soon as the client module is evaluated, eliminating the race condition, while remaining synchronous so the component tests and rendering behavior do not need to change.
2. **Server-Side Safety**: Wrapped it inside `typeof window !== "undefined"` to prevent JSDOM execution or bundling issues on the server side during SSG (Static Site Generation) page collection.
3. **Linter & Type Errors Cleared**: 
   * Replaced `any[]` with `unknown[]` and updated return types to `Promise<Response>` in `withAuth` inside `auth.ts` to solve Next.js route handler build errors.
   * Restored Tailwind compiler compatibility types for `addComponents` and `addUtilities` in `tailwind.config.ts` while silencing the linter's `no-unsafe-function-type` rule.

---

## 🧪 Verification & Testing Results

### 1. Jest Unit Tests
All **26 test suites** and **299 test cases** pass successfully.
```bash
Test Suites: 26 passed, 26 total
Tests:       299 passed, 299 total
Snapshots:   0 total
Time:        7.285 s
```

### 2. Next.js Production Build
Running `npm run build` compiles completely with zero errors:
```bash
 ✓ Compiled successfully in 4.5s
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (23/23) ...
   Finalizing page optimization ...
   Collecting build traces ...
```
---

## 📦 Type of Change
- [x] Bug fix (non-breaking change which fixes an issue)
- [x] Security fix / vulnerability patch
- [x] Code clean up / linting correction
