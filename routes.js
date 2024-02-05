import express from 'express'
import { printReceipt } from './controllers/PrinterController.js'
import { index } from './controllers/ApiController.js';

let app = express.Router()

app.get('/', index);
app.get('/print', printReceipt);

export default app