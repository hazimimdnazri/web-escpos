import moment from 'moment'
import path from 'path'
import { ThermalPrinter, PrinterTypes, BreakLine } from 'node-thermal-printer'

const __dirname = path.resolve();

const printReceipt = (req, res) => {
    const getData = async () => {
        try {
            const response = await Promise.race([
                fetch(process.env.API+req.query.sale_id),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
            ]);
    
            const apiData = await response.json();
            printData(apiData)

        } catch (error){
            res.sendFile(path.join(__dirname+'/public/timeout.html'));
        }
    }

    const printData = async (apiData) => {
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
        
            printer.alignCenter()
            printer.println(String(req.query.sale_id).padStart(8, '0'))
            printer.bold(true);  
            printer.drawLine('=')
            printer.println(process.env.COMPANY)
            printer.println(process.env.EVENT)
            printer.drawLine('=')
            printer.bold(false);  
            printer.leftRight(moment().format('DD/MM/YYYY'), `CASHIER #${apiData[0].cashier_id}`)
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

            // console.log(printer.getText());
                    
            try {
                await printer.execute();
                console.log(`Printing sale #${req.query.sale_id}`)
                res.sendFile(path.join(__dirname+'/public/index.html'));
            } catch (error) {
                res.send('Printer error! Please check your printer connection.')
            }
        } else {
            res.send('Sale ID is unknown.')
        }
    }

    getData()
}

export { printReceipt }