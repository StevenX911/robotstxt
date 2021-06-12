const { getPageName } = require('../src/robot')
const { expect } = require('chai')

describe('robot.js', function () {
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
})
