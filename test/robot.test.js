const path = require('path')
const puppeteer = require('puppeteer')
const { getPageName, getPageLinks } = require('../src/robot')
const { expect } = require('chai')

describe('robot.js', function () {
  let browser
  before(async function () {
    browser = await puppeteer.launch({
      executablePath: path.resolve(
        __dirname,
        '../chrome-mac/Chromium.app/Contents/MacOS/Chromium'
      ),
      timeout: 10000,
      ignoreHTTPSErrors: true,
      devtools: false,
      headless: true
    })
  })

  after(async function () {
    await browser.close()
  })

  it('getPageName返回index.html', function () {
    expect(
      getPageName('http://www.robotstxt.org/', 'http://www.robotstxt.org/')
    ).equal('index.html')
  })

  it('getPageName返回abc.html', function () {
    expect(
      getPageName(
        'http://www.robotstxt.org/abc.html',
        'http://www.robotstxt.org/'
      )
    ).equal('abc.html')
  })

  it('getPageLinks', async function () {
    const links = await getPageLinks(browser, 'http://www.robotstxt.org/')
    /* eslint-disable-next-line */
    expect(links).to.not.be.null
    /* eslint-disable-next-line */
    expect(links).to.not.be.undefined
    /* eslint-disable-next-line */
    expect(links).to.not.be.empty
  })
})
