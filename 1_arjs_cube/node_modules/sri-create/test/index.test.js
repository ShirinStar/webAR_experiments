const createSri = require('../index')

const expectRes = 'sha384-ZUyT6D39ELzG6ROLqGHl2YFZux5Itck7tyrrXZIPpIlnI6z2Npm6QYe14vMKXFdJ'
createSri('https://raw.githubusercontent.com/Youjingyu/sri-create/master/index.js').then((res) => {
  if (expectRes === res) {
    console.info('create sri passed')
  } else {
    console.error('create sri failed')
  }
}).catch((err) => {
  console.error(err)
})
