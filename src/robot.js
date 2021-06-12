const fs = require('fs-extra')
const path = require('path')
const puppeteer = require('puppeteer')
const chalk = require('chalk')

const startURI = 'http://www.robotstxt.org/'
const dirPrefix = '../temp/'
const clog = console.log

function getPageName (uri, startURI) {
  if (uri === startURI) {
    return 'index.html'
  } else {
    return uri.replace(`${startURI}`, '')
  }
}

async function getPageLinks (browser, link, startURI) {
  if (!startURI) startURI = link
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(false)
  await page.goto(link)
  clog(`${link} ${chalk.green('GET')}`)
  const result = await page.evaluate(startURI => {
    const uriArray = document.querySelectorAll('body a')
    const array = Array.prototype.slice.call(uriArray, 0)
    const links = array.map(v => {
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
  await page.close()
  return result.links
}

async function savePageHTML (browser, uri, startURI) {
  const tempPagePath = path.resolve(
    __dirname,
    dirPrefix + getPageName(uri, startURI)
  )
  if (!fs.existsSync(tempPagePath)) {
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(false)
    await page.goto(uri)
    clog(`${uri} ${chalk.green('GET')}`)
    const content = await page.content()
    fs.ensureFileSync(tempPagePath)
    fs.writeFileSync(tempPagePath, content)
    await page.close()
    clog(`${uri} ${chalk.green('下载成功')}`)
  } else {
    clog(`${uri} ${chalk.yellow('跳过')}`)
  }
}

const run = async (rerun = 5) => {
  clog(chalk.green('启动puppeteer'))

  const browser = await puppeteer.launch({
    // Chromium.app 需自行下载 https://download-chromium.appspot.com/
    executablePath: path.resolve(
      __dirname,
      '../chrome-mac/Chromium.app/Contents/MacOS/Chromium'
    ),
    timeout: 10000,
    ignoreHTTPSErrors: true,
    devtools: false,
    headless: true
  })
  try {
    // first hierarchy
    const firstlinks = await getPageLinks(browser, startURI)

    // clog(firstlinks.length) // 24

    // second hierarchy
    let secondLinks = []
    const temparrlink = []
    for (const link of firstlinks) {
      if (link) {
        temparrlink.push(getPageLinks(browser, link, startURI))
      }
    }
    await Promise.all(temparrlink).then(linkss => {
      secondLinks = [...linkss.flat(1)]
    })

    // clog(secondLinks.length) // 1141

    const allPageLinks = Array.from(new Set(secondLinks))

    const temparr = []
    for (const link of allPageLinks) {
      if (link) {
        temparr.push(savePageHTML(browser, link, startURI))
      }
    }
    await Promise.all(temparr)
    clog(chalk.green('下载完成'))
    await browser.close()
    clog(chalk.green('退出puppeteer'))
  } catch (error) {
    clog(error)
    await browser.close()
    if (rerun > 0) {
      run(--rerun)
      clog(chalk.yellow(`重启puppeteer ${rerun} 次`))
    } else {
      clog(chalk.yellow('部分下载失败'))
      clog(chalk.red('退出puppeteer'))
    }
  }
}

if (typeof describe === 'undefined') {
  run()
}

module.exports = {
  run,
  getPageName,
  getPageLinks,
  savePageHTML
}
