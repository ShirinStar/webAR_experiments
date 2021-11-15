# sri-create
create sri from local file or remote file
## usage
#### use in terminal
```bash
npm i sri-create -g
create-sri <file-url|file-path>
## for example
create-sri https://raw.githubusercontent.com/Youjingyu/sri-create/master/index.js
## output: sha384-ZUyT6D39ELzG6ROLqGHl2YFZux5Itck7tyrrXZIPpIlnI6z2Npm6QYe14vMKXFdJ

## or
create-sri /utils/index.js
```
#### use in script
```bash
npm i sri-create --save
```
```javascript
const createSri = require('sri-create')
createSri('https://github.com/Youjingyu/sri-create/blob/master/index.js').then((res) => {
  console.log(res)
}).catch((err) => {
  console.log(err)
})
```