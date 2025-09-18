Place images used by the site (e.g., login background, hero images) here.

- Access via server URL: `/api/storage/assets/<filename>`
- Example: `/api/storage/assets/login-bg.jpg`
- If you upload via the admin API with a base key (e.g., `login-bg`), the server will manage the extension and you can use `/api/storage/assets/login-bg` to resolve the latest.

Notes:
- This folder is served by the server at runtime. Ensure the server process has read permissions.
- In production Docker, mount or bake this folder into the image.
