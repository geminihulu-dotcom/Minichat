import express from 'express';
import cors from 'cors';
import { createRouteHandler } from 'uploadthing/server';
import { ourFileRouter } from '../uploadthing-server';

const app = express();

app.use(cors());

const uploadthingRoute = createRouteHandler({
  router: ourFileRouter,
});

app.use('/api/uploadthing', uploadthingRoute);

app.listen(3000, () => {
  console.log('UploadThing server listening on port 3000');
});
