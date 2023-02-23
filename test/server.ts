import http, { Server } from 'http'
import { usePromise } from '../utils/tools'
let replyList: http.ServerResponse[] = []

function wrapData(event: string, data: string) {
  return [
    `event: ${event}`,
    `data: ${data}`,
    '\n'
  ].join('\n')
}


export const server = http.createServer(function (req, res) {
  req.on('close', () => {
    replyList = replyList.filter(e => e !== res)
  })

  var path = '.' + req.url

  let count = 0

  if (path === './get') {
    res.write('OK')
    res.end()
    return;
  }

  if (path === './trigger') {
    replyList.push(res)
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })
    // trigger client's open event
    res.write('\n\n')
    return;
  }

  if (path === './interval') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    })

    res.write('data: ' + count + '\n\n')

    const interval = setInterval(function () {
      count += 1
      res.write('data: ' + count + '\n\n')
    }, 1000)

    req.socket.addListener('close', () => clearInterval(interval))
  }
})

export async function send(data: string) {
  return await Promise.all(replyList.map(e => e.write(wrapData('message', data))))
}
