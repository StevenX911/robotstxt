const path = require('path')
const { listFileSync } = require('../src/wash')
const { expect } = require('chai')

describe('wash.js', function () {
  it('listFileSync遍历www目录', function () {
    const newList = listFileSync(path.resolve(__dirname, '../www'))
    /* eslint-disable-next-line */
    expect(newList).to.not.be.null
    /* eslint-disable-next-line */
    expect(newList).to.not.be.undefined
    /* eslint-disable-next-line */
    expect(newList).to.not.be.empty
  })
})
