# Deployment Guide for Vercel

This guide provides instructions for deploying the Audit PoC application to Vercel, addressing common issues that may arise during deployment.

## Prerequisites

- A Vercel account
- Git repository with your project
- OpenReplay project key

## Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Log in to your Vercel account and import your project
3. Configure environment variables:
   - `VITE_OPENREPLAY_PROJECT_KEY`: Your OpenReplay project key
4. Deploy the application

## Addressing Common Issues

### Font Files

The application uses the GDS (Government Digital Service) design system, which requires specific font files. These files are included in the `public/assets/fonts` directory and should be automatically deployed to Vercel.

If you encounter 404 errors for font files, ensure that the following files exist in your repository:

```
public/assets/fonts/bold-affa96571d-v2.woff
public/assets/fonts/bold-b542beb274-v2.woff2
public/assets/fonts/light-94a07e06a1-v2.woff2
public/assets/fonts/light-f591b13f7d-v2.woff
```

### Client-Side Routing

The application uses React Router for client-side routing. To ensure that all routes work correctly on Vercel, a `vercel.json` configuration file is included in the repository with the following content:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

This configuration tells Vercel to rewrite all requests to `index.html`, allowing React Router to handle the routing on the client side.

### OpenReplay Integration

If you encounter issues with OpenReplay integration:

1. Verify that the `VITE_OPENREPLAY_PROJECT_KEY` environment variable is correctly set in your Vercel project settings
2. Check that your OpenReplay project is active and properly configured
3. If necessary, update the OpenReplay tracker configuration in `src/utils/openReplayTracker.ts` to include additional options such as `ingestPoint` if you're using a self-hosted OpenReplay instance

## Troubleshooting

If you continue to experience issues with the deployment:

1. Check the Vercel deployment logs for specific error messages
2. Verify that all required files are included in your repository
3. Ensure that the build process completes successfully
4. Test the application locally using `npm run build` and `npm run preview` to identify any issues before deployment