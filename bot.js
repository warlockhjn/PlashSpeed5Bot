const puppeteer = require('puppeteer-extra');
const pluginStealth = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const schedule = require('node-schedule');
const {installMouseHelper} = require('./extras/install_mouse_helper');

puppeteer.use(pluginStealth())

const html_path = 'htmls/bot_';
const screenshot_path = 'screenshots/bot_';
const SimpleNodeLogger = require('simple-node-logger'),
	opts = {
					logFilePath:'logs/' + 'bot.log',
					timestampFormat: 'YYYY-MM-DD HH:mm:ss.SSS',
	};
let html = '';

const usr = 'YourAmazonAccount';
const pwd = 'YourAmazonPassword';

const url = 'https://www.amazon.com/gp/product/B08FC5L3RG/';
const debug = true;
const buy = true;
const placeOrderSelectors = ['#turbo-checkout-iframe', '#bottomSubmitOrderButtonId', '#submitOrderButtonId', '[name="placeYourOrder1"]'];

function login(usr, pwd) {

}

(async () => {

	const browser = await puppeteer.launch({
		ignoreHTTPSErrors: true,
		headless: false,
	});
	const page = await browser.newPage();

	if (debug == true) {
			await installMouseHelper(page);

			let dir = './htmls';
			if(!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			dir = './screenshots';
			if(!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			dir = './logs';
			if(!fs.existsSync(dir)) {
				fs.mkdirSync(dir);
			}

			log = SimpleNodeLogger.createSimpleFileLogger(opts);
			log.setLevel('info');
			}

	await page.goto('https://www.amazon.com/gp/sign-in.html');
	await page.type('#ap_email', usr);
	await page.click('#continue');
	await page.waitForNavigation();
	await page.type('#ap_password', pwd);
	await page.click('[name="rememberMe"]');
	await page.click('#signInSubmit');
	await page.waitForNavigation();
	await page.goto(url);
	let i = 0;
	do {
		try {
		await page.click('#buy-now-button');

		await page.waitForSelector('#turbo-checkout-iframe');


			const selectorContainer = await page.waitForSelector(placeOrderSelectors.toString());

			let containerName = selectorContainer._remoteObject.className;

			console.log(containerName);     //HTMLSpanElement or HTMLIFrameElement

			if(containerName == 'HTMLIFrameElement') {
				const frame = await page.frames().find(f => f.name() === 'turbo-checkout-iframe');
				await frame.waitForSelector('#turbo-checkout-pyo-button');
				const buy = await frame.$('#turbo-checkout-pyo-button');
				await buy.click();
				await page.waitFor(500);
			}
			else if(containerName == 'HTMLSpanElement') {
				await page.click('#bottomSubmitOrderButtonId,#submitOrderButtonId,[name="placeYourOrder1"]');
				await page.waitFor(500);
			}
			else {
				console.log('Purchase Error 3');
			}
			await page.waitFor(500);
		}
		catch(e) {
			console.log(e);
		}
		console.log(i++);
		await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
	} while(buy === true)


	//await browser.close();
	}

)();
