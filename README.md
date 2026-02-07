# ClassGrid
## Deployment

### Render

This project is configured for deployment on [Render](https://render.com/).

1.  Connect your GitHub repository to Render.
2.  Click **New +** and select **Blueprint**.
3.  Connect the repository.
4.  Render will detect the `render.yaml` file.
5.  Set the `MONGODB_URL` and `FIRST_SUPERUSER_PASSWORD` environment variables in the Render dashboard during setup or afterwards.
