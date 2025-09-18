## Xero Integration Test Guide

This guide helps you validate the end-to-end Xero OAuth connection and invoice creation flow implemented in the backend (`/api/xero/*`) and the admin UI.

### 1. Preconditions
Ensure the following environment variables are set (server container / `.env`):

```
XERO_CLIENT_ID=...
XERO_CLIENT_SECRET=...
XERO_REDIRECT_URI=https://your-domain.example.com/api/xero/callback
XERO_SCOPES=openid profile email accounting.transactions accounting.contacts offline_access
XERO_DEFAULT_ACCOUNT_CODE=200              # (optional override)
XERO_SHIPPING_ACCOUNT_CODE=420             # (optional)
XERO_TAX_CODE_PRODUCTS=GST Free            # (optional)
XERO_TAX_CODE_SHIPPING=GST on Income       # (optional)
XERO_BRANDING_THEME_ID=xxxxxxxx-xxxx-....  # (optional)
```

Confirm the redirect URI exactly matches the one configured in the Xero developer portal.

### 2. Check Status Before Connecting
While authenticated as an admin (JWT present in `localStorage.token`), visit:

```
/api/xero/status
```

Expected JSON before first connection:
```
{ "connected": false, "reason": "no_token", "env": { ... } }
```

If you receive `{ "error": "Unauthorized" }`, the Authorization header is not being sent. Re‑login or manually set the token in DevTools:
```
localStorage.setItem('token', '<JWT_FROM_LOGIN_RESPONSE>');
```

### 3. Initiate OAuth Flow
Navigate (still logged in) to:
```
/api/xero/connect
```
You should be redirected to Xero's consent screen. Approve access.

On success you’ll see: `Xero connected successfully. You can close this window.`

### 4. Verify Connection
Reload:
```
/api/xero/status
```
Expected sample:
```
{
  "connected": true,
  "tenant_id": "...",
  "remaining_seconds": 3540,
  "env": { "has_client_id": true, ... },
  "guidance": "Token active."
}
```

If `connected` is false with `reason: no_token`, the callback did not persist a token. Check server logs for `[xero] callback` entries.

### 5. Create a Test Order (if needed)
Use the admin order creation UI or API to ensure there is at least one non-sample order with line items and (optionally) shipping.

### 6. Create an Invoice
From the admin UI (Orders list or detail) trigger "Create Xero Invoice". Alternatively:
```
fetch('/api/admin/orders/<ORDER_ID>/xero-invoice', { method:'POST', headers:{ 'Authorization': 'Bearer ' + localStorage.getItem('token') }})
  .then(r=>r.json()).then(console.log);
```

Success returns invoice payload from Xero: `{ data: { Invoices: [...] } }`.

### 7. Common Failure Modes
| Symptom | Cause | Action |
|---------|-------|--------|
| `{ error: 'xero_not_connected' }` | No token row or expired without refresh | Run `/api/xero/connect` again |
| 401 Unauthorized (JSON) | Missing / invalid JWT | Re-authenticate; ensure `Authorization: Bearer <token>` header present |
| 400 from Xero with validation errors | Missing required contact or account codes | Ensure order has `user_name`, `email`, and environment account codes valid |
| `Token expired` in status | Refresh flow will run automatically only during invoice creation; if it fails, re-connect |

### 8. Refresh Logic
The server auto-refreshes the token in `getActiveXeroToken()` when `expires_at` is past. If refresh fails, logs will include the thrown error and invoice creation will respond with `xero_not_connected`.

### 9. Cleanup / Security Notes
After successful testing, remove the temporary query `?jwt=` fallback (if still present) from auth flows and rotate any test credentials used.

### 10. Next Enhancements (Optional)
1. Persist Xero Invoice Number back onto the order record.
2. Add a frontend status widget with Connect / Reconnect button.
3. Surface detailed Xero validation errors in a human-friendly toast.
4. Schedule background token refresh 5 minutes before expiry.

---
This guide lives alongside the implementation to ensure reproducible testing of the Xero integration.
