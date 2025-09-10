/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return { hello: 'world' }
})

router.get('/media', '#controllers/media_controller.list')
router.get('/job/:jobId', '#controllers/media_controller.jobStatus')
router.post('/upload', '#controllers/media_controller.upload')
router.get('/preview/:filename', async ({ params }) => {
  return { filename: params.filename }
})
