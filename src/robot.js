const fs = require('fs-extra')
const path = require('path')
const puppeteer = require('puppeteer')
const chalk = require('chalk')

const startURI = 'http://www.robotstxt.org/'
const dirPrefix = '../temp/'
const clog = console.log

function getPageName (uri) {
  if (uri === startURI) {
    return 'index.html'
  } else {
    return uri.replace(`${startURI}`, '')
  }
}

async function savePageHTML (browser, uri) {
  const tempPagePath = path.resolve(__dirname, dirPrefix + getPageName(uri))
  if (!fs.existsSync(tempPagePath)) {
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(false)
    await page.goto(uri)
    clog(`${uri} ${chalk.green('GET')}`)
    const content = await page.content()
    fs.ensureFileSync(tempPagePath)
    fs.writeFileSync(
      tempPagePath,
      content
    )
    await page.close()
    clog(`${uri} ${chalk.green('下载成功')}`)
  } else {
    clog(`${uri} ${chalk.yellow('跳过')}`)
  }
}

(async () => {
  clog(chalk.green('启动puppeteer'))

  const browser = await puppeteer.launch({
    // Chromium.app 需自行下载 https://download-chromium.appspot.com/
    executablePath: path.resolve(__dirname, '../chrome-mac/Chromium.app/Contents/MacOS/Chromium'),
    timeout: 10000,
    ignoreHTTPSErrors: true,
    devtools: false,
    headless: true
  })
  try {
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(false)
    await page.goto(startURI)
    clog(`${startURI} ${chalk.green('GET')}`)
    // first hierarchy
    const result = await page.evaluate((startURI) => {
      const uriArray = document.querySelectorAll('body a')
      const array = Array.prototype.slice.call(uriArray, 0)
      const links = array.map((v) => {
        const href = v.href
        if (href.startsWith(startURI) && href.indexOf('#') < 0) {
          return `${href}`
        }
        return startURI
      })
      return {
        links
      }
    }, startURI)

    let tempLinks = []
    // second hierarchy
    for (const link of result.links) {
      if (link) {
        await page.goto(link)
        clog(`${link} ${chalk.green('GET')}`)
        const result = await page.evaluate((startURI) => {
          const uriArray = document.querySelectorAll('body a')
          const array = Array.prototype.slice.call(uriArray, 0)
          const links = array.map((v) => {
            const href = v.href
            if (href.startsWith(startURI) && href.indexOf('#') < 0) {
              return `${href}`
            }
            return startURI
          })
          return {
            links
          }
        }, startURI)

        tempLinks = [...result.links, ...tempLinks]
      }
    }

    const allURI = Array.from(new Set(tempLinks))

    const tmparr = []
    for (const link of allURI) {
      if (link) {
        tmparr.push(savePageHTML(browser, link))
      }
    }
    await Promise.all(tmparr)

    clog(chalk.green('下载完成'))
    await page.close()
    await browser.close()
    clog(chalk.green('退出puppeteer'))
  } catch (error) {
    clog(error)
    await browser.close()
    clog(chalk.red('退出puppeteer'))
  }
})()
