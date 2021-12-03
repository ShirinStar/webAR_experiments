#!/usr/bin/env node

const createSri = require('../index')

const path = process.argv[2]

createSri(path).then((res) => {
  console.log('sha384 encryption result:')
  console.log(res)
}).catch((err) => {
  console.log(err)
})
