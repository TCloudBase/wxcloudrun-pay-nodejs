const express = require('express')
const request = require('request')

const app = express()
app.use(express.json())

const mchId = process.env.mch_id || '1XXXXXXXXX' // 这里商户号需要替换成自己的
// 也可以在部署时设定环境变量【mch_id】为商户号

app.post('/unifiedOrder', async function (req, res) {
  const ip = req.headers['x-forwarded-for'] // 小程序直接callcontainer请求会存在
  const openid = req.headers['x-wx-openid'] // 小程序直接callcontainer请求会存在
  // 如果是业务异步流程需自己替换openid来源
  const { text, noid, fee } = req.body
  const payreq = {
    body: text, // 订单描述
    out_trade_no: noid, // 自定义订单号
    sub_mch_id: mchId, // 微信支付商户号
    total_fee: fee, // 金额，单位：分
    openid: openid, // 用户唯一身份ID
    spbill_create_ip: ip, // 用户客户端IP地址
    env_id: req.headers['x-wx-env'], // 接收回调的环境ID
    callback_type: 2, // 云托管服务接收回调，填2
    container: {
      service: req.headers['x-wx-service'], // 回调的服务名称
      path: '/' // 回调的路径
    }
  }
  console.log('[unifiedOrder]请求体', payreq)
  const info = await callpay('unifiedorder', payreq)
  console.log('[unifiedOrder]响应体', info)
  res.send(info)
})

app.post('/queryorder', async function (req, res) {
  const { noid } = req.body
  const payreq = {
    out_trade_no: noid, // 自定义订单号
    sub_mch_id: mchId // 微信支付商户号
  }
  console.log('[queryorder]请求体', payreq)
  const info = await callpay('queryorder', payreq)
  console.log('[queryorder]响应体', info)
  res.send(info)
})

app.post('/closeorder', async function (req, res) {
  const { noid } = req.body
  const payreq = {
    out_trade_no: noid, // 自定义订单号
    sub_mch_id: mchId // 微信支付商户号
  }
  console.log('[closeorder]请求体', payreq)
  const info = await callpay('closeorder', payreq)
  console.log('[closeorder]响应体', info)
  res.send(info)
})

app.post('/refund', async function (req, res) {
  const { text, noid, fee } = req.body
  const payreq = {
    body: text, // 订单描述
    out_trade_no: noid, // 自定义订单号
    out_refund_no: `R_${noid}`, // 自定义退款单号
    sub_mch_id: mchId, // 微信支付商户号
    total_fee: fee, // 订单金额，单位：分
    refund_fee: fee, // 退款金额，单位：分
    refund_desc: `${text}_退款`, // 订单退款描述
    env_id: req.headers['x-wx-env'], // 接收回调的环境ID
    callback_type: 2, // 云托管服务接收回调，填2
    container: {
      service: req.headers['x-wx-service'], // 回调的服务名称
      path: '/' // 回调的路径
    }
  }
  console.log('[refund]请求体', payreq)
  const info = await callpay('refund', payreq)
  console.log('[refund]响应体', info)
  res.send(info)
})

app.post('/queryrefund', async function (req, res) {
  const { noid } = req.body
  const payreq = {
    out_trade_no: noid, // 自定义订单号
    sub_mch_id: mchId // 微信支付商户号
  }
  console.log('[queryrefund]请求体', payreq)
  const info = await callpay('queryrefund', payreq)
  console.log('[queryrefund]响应体', info)
  res.send(info)
})

app.all('/', function (req, res) {
  console.log('回调请求头', req.headers)
  console.log('回调收到内容', req.body || req.query)
  res.send('success')
})

app.listen(80, function () {
  console.log('服务启动成功！')
})

function callpay (action, paybody) {
  return new Promise((resolve, reject) => {
    request({
      url: `http://api.weixin.qq.com/_/pay/${action}`,
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(paybody)
    }, function (error, res) {
      if (error) {
        resolve(error)
      } else {
        resolve(res.body)
      }
    })
  })
}
