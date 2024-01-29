import { ThermalPrinter, PrinterTypes, CharacterSet, BreakLine } from 'node-thermal-printer';
import moment from 'moment';
const id = process.argv[2]

const example = async () => {
	const response = await fetch(process.env.API+id);
	const apiData = await response.json();
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

	printer.println(String(id).padStart(8, '0'))
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

	console.log(printer.getText());
  
	// try {
	//     await printer.execute();
	//     console.log('Print success.');
	// } catch (error) {
	//     console.error('Print error:', error);
	// }
}
  
example();