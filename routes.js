import express from 'express';
import moment from 'moment';
import { ThermalPrinter, PrinterTypes, BreakLine } from 'node-thermal-printer';


let app = express.Router()

app.get('/', (req, res) => {
    var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
    console.log(`Connection from ${ip}`)
    res.send('It is working!')
});

app.get('/print', (req, res) => {
    const example = async () => {
        const response = await fetch(process.env.API+req.query.sale_id);
        const apiData = await response.json();

        if(apiData.status != 'error'){
            var sum = 0;
        
            const printer = new ThermalPrinter({
                type: PrinterTypes.EPSON,
                interface: process.env.INTERFACE,
                driver: 'printer',
                options: {
                    timeout: 1000,
                },
                width: 32,
                breakLine: BreakLine.WORD,
            });
        
            const isConnected = await printer.isPrinterConnected();
            console.log('Printer connected:', isConnected);
        
            printer.alignCenter()
            printer.println(String(req.query.sale_id).padStart(8, '0'))
            printer.bold(true);  
            printer.drawLine('=')
            printer.println(process.env.COMPANY)
            printer.drawLine('=')
            printer.bold(false);  
            printer.leftRight(moment().format('DD/MM/YYYY'), "CASHIER 1")
            printer.leftRight(moment().format('HH:mm:ss'), "")
            printer.bold(true);  
            printer.newLine()
            printer.leftRight("Item", "Price (RM)")
            printer.bold(false);  
            printer.drawLine()
        
            apiData.forEach((items) => {
                items.items.forEach((i) => {
                    printer.leftRight(i.r_item.item.substring(0, 14)+' x '+i.quantity, (parseFloat(i.r_item.price_selling) * parseInt(i.quantity)).toFixed(2))
                    sum += parseFloat(parseFloat(i.r_item.price_selling) * parseInt(i.quantity));
                })
            });
        
            printer.drawLine()
            printer.bold(true);  
            printer.leftRight("TOTAL", sum.toFixed(2))
            printer.bold(false);  
            printer.newLine()
            printer.newLine()
            printer.println('Sebarang pemulangan adalah ')
            printer.println('7 hari selepas pengambilan.')
            printer.println('Sila simpan resit ini untuk')
            printer.println('rujukan semasa pemulangan')
            printer.newLine()
            printer.newLine()
            printer.newLine()
            printer.newLine()
                    
            try {
                await printer.execute();
                res.send('Printing');
            } catch (error) {
                res.send('Error!')
            }
        } else {
            res.send('Sale ID is unknown.')
        }
    }

    example()
});

export default app