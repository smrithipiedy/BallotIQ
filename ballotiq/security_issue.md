# Issue: XSS Vulnerability via Client-Side Sanitization Race Condition in SafeHTML

## 🏷️ Program & Contribution Info
* **Program**: SSOC '26 (Social Summer of Code 2026)
* **Category**: Security / Bug Fix
* **Difficulty**: Medium
* **Status**: Open for contribution

---

## 📝 Description (In Simple Terms)

### What is the issue?
There is a safety loophole (security bug) in how BallotIQ displays AI-generated explanations and translations to users. 

To prevent hackers from injecting bad code (like malicious scripts) into the page, the app uses a security library called **DOMPurify**. However, the app loads this library dynamically in the background *after* the page starts loading. 

While the library is still downloading, if the app receives any text to display, it falls back to a basic search-and-remove check that only looks for `<script>` tags. This check is very weak. 

### Why is this dangerous?
During the brief moment before the security library is fully loaded, an attacker could feed the app other kinds of malicious code (like `<img src=x onerror=...>` or `<iframe src=...>` tags). The simple check won't catch these, and they will run directly in the user's browser, leading to a **Cross-Site Scripting (XSS)** attack.

---

## 🔍 Technical Details

1. **Where it starts**: In [`src/lib/security/sanitize.ts`](file:///c:/Users/tejj1/OneDrive/Desktop/New%20folder%20%282%29/New%20folder/BallotIQ/ballotiq/src/lib/security/sanitize.ts#L6-L15), `isomorphic-dompurify` is loaded asynchronously on the client:
   ```typescript
   if (typeof window !== "undefined") {
     void import("isomorphic-dompurify").then((mod) => {
       DOMPurifyInstance = (mod.default || mod) as DOMPurifyType;
     });
   }
   ```
2. **The Race Condition**: In [`src/components/ui/SafeHTML.tsx`](file:///c:/Users/tejj1/OneDrive/Desktop/New%20folder%20%282%29/New%20folder/BallotIQ/ballotiq/src/components/ui/SafeHTML.tsx#L24-L47), the component immediately calls `sanitizeAIResponse(html)` upon mounting.
3. **The Loophole**: Because the dynamic import of DOMPurify hasn't completed yet, `DOMPurifyInstance` is still `null`. The code falls back to:
   ```typescript
   safeHTML = response.replace(
     /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
     "",
   );
   ```
   This regex fails to strip XSS payloads that do not use `<script>` tags.

---

## 💡 Proposed Solution

We need to make sure the app never renders raw or weakly-sanitized HTML while DOMPurify is loading.

1. **Option A (Static Import)**: Statically import `isomorphic-dompurify` in `sanitize.ts` since it is already safe for both server-side rendering (SSR) and client-side runs.
2. **Option B (Loading State)**: Add a state tracking whether the sanitizer has loaded, and prevent rendering of the HTML block inside `SafeHTML.tsx` until `DOMPurifyInstance` is initialized.

---

## 🛠️ How to verify
1. Run the test suite: `npm test`
2. Ensure that any changes to `SafeHTML` or `sanitize.ts` pass the existing 299 tests.
3. Add a test in `__tests__/components/SafeHTML.test.tsx` verifying that rendering happens securely even if `SafeHTML` is mounted immediately before DOMPurify completes loading.
