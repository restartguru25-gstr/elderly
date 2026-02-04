# Firebase Storage CORS Setup

If you see CORS errors when uploading files from localhost (e.g. sponsor brand images, medical docs), configure CORS on your Storage bucket.

## Option 1: Google Cloud Shell (easiest)

1. Open [Google Cloud Shell](https://shell.cloud.google.com)
2. Select your project: `studio-7755060677-3cbb9`
3. Create `cors.json`:
   ```bash
   cat > cors.json << 'EOF'
   [
     {
       "origin": ["http://localhost:9002", "http://localhost:3000", "http://127.0.0.1:9002", "http://127.0.0.1:3000"],
       "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
       "responseHeader": ["Content-Type", "Authorization", "Content-Length", "x-goog-resumable", "x-goog-meta-*"],
       "maxAgeSeconds": 3600
     }
   ]
   EOF
   ```
4. Apply:
   ```bash
   gsutil cors set cors.json gs://studio-7755060677-3cbb9.firebasestorage.app
   ```

## Option 2: Local gsutil

If you have [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed:

```bash
gsutil cors set storage.cors.json gs://studio-7755060677-3cbb9.firebasestorage.app
```

(`storage.cors.json` is in the project root.)

## Verify

```bash
gsutil cors get gs://studio-7755060677-3cbb9.firebasestorage.app
```

## Production

Add your production domain(s) to the `origin` array in the CORS config when deploying.
